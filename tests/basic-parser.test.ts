import { parseCSV, parseCSVFromString } from "../src/basic-parser";
import * as path from "path";
import { z } from "zod";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
const JOB_CSV_PATH = path.join(__dirname, "../data/job.csv");
const OTHER_CSV_PATH = path.join(__dirname, "../data/other.csv");
const COMMENTS_CSV_PATH = path.join(__dirname, "../data/comments.csv");
const MULTI_CSV_PATH = path.join(__dirname, "../data/quoted_multiline.csv");

//Collect generator output into arrays for easy assertions
async function collect(gen: AsyncGenerator<any>) {
  const rows: any[] = [];
  const errors: any[] = [];
  for await (const item of gen) {
    if ("message" in item) errors.push(item);
    else rows.push(item);
  }
  return { rows, errors };
}

test("parseCSV yields arrays", async () => {
  const { rows, errors } = await collect(parseCSV(PEOPLE_CSV_PATH));
  expect(errors).toHaveLength(0); // No errors expected
  expect(rows).toHaveLength(5);
  expect(rows[0].data).toEqual(["name", "age"]);
  expect(rows[1].data).toEqual(["Alice", "23"]);
  expect(rows[2].data).toEqual(["Bob", "thirty"]); 
  expect(rows[3].data).toEqual(["Charlie", "25"]);
  expect(rows[4].data).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const { rows, errors } = await collect(parseCSV(PEOPLE_CSV_PATH));
  expect(errors).toHaveLength(0);
  for (const r of rows) {
    expect(Array.isArray(r.data)).toBe(true);
  }
});

const RowSchema = z.tuple([z.string(), z.coerce.number()]);

test("yields an error when a row has too many columns (job.csv)", async () => {
  const { errors } = await collect(parseCSV(JOB_CSV_PATH, RowSchema, true));
  expect(errors.length).toBeGreaterThan(0);
});

test("yields an error when a row has too few columns (other.csv)", async () => {
  const { errors } = await collect(parseCSV(OTHER_CSV_PATH, RowSchema, true));
  expect(errors.length).toBeGreaterThan(0);
});

/**
 * It uses the 'job.csv'
 */
test("yields an error when a row has too few columns", async () => {
  const { errors } = await collect(parseCSV(JOB_CSV_PATH, RowSchema));
  expect(errors.length).toBeGreaterThan(0);
});

test("correctly parses fields with quoted commas", async () => {
  const { rows, errors } = await collect(parseCSV(OTHER_CSV_PATH, undefined, true)); // header=true
  expect(errors).toHaveLength(0);
  // First data row after header
  expect(rows[0].data).toEqual(["Mallory, Alice", "senior developer"]);
});

/**
 * When header == true
 */
test("header=true attaches the header and skips it as data", async () => {
  const { rows, errors } = await collect(parseCSV(PEOPLE_CSV_PATH, undefined, true));
  expect(errors).toHaveLength(0);
  for (const r of rows) {
    expect(r.header).toEqual(["name", "age"]);
  }
  // With header=true, data length should be 4 (header not included)
  expect(rows).toHaveLength(4);
});

test("header=false leaves header undefined", async () => {
  const { rows, errors } = await collect(parseCSV(PEOPLE_CSV_PATH, undefined, false));
  expect(errors).toHaveLength(0);
  for (const r of rows) expect(r.header).toBeUndefined();
});

// Branded name type
type NonEmptyName = string & { __brand: "NonEmptyName" };
const NameSchema = z.string().min(1).brand<NonEmptyName>();

// Tuple with refine (age >= 24)
const PersonTuple = z
  .tuple([NameSchema, z.coerce.number()])
  .refine(([_, age]) => age >= 24, { message: "age must be >= 24" });

test("works with .refine() and .brand()", async () => {
  const { rows, errors } = await collect(parseCSV(PEOPLE_CSV_PATH, PersonTuple, true));
  // Alice (23) should fail refine; Charlie (25) + Nim (22) -> Nim fails, Charlie passes
  expect(errors.length).toBeGreaterThan(0); 
  // Ensure at least one branded success (Charlie)
  const ok = rows.map(r => r.data);
  expect(ok.some(([name, age]: any) => typeof name === "string" && age === 25)).toBe(true);
});

test("skips lines beginning with commentChar", async () => {
  const { rows, errors } = await collect(parseCSV(COMMENTS_CSV_PATH, undefined, true, "#"));
  expect(errors).toHaveLength(0);
  expect(rows.map(r => r.data)).toEqual([
    ["Alice","23"],
    ["Bob","30"],
  ]);
  for (const r of rows) expect(r.header).toEqual(["name","age"]);
});

test("parses embedded newlines inside quotes as a single logical record", async () => {
  const { rows, errors } = await collect(parseCSV(MULTI_CSV_PATH, undefined, true));
  expect(errors).toHaveLength(0);
  // Ana's notes should include newlines merged in one cell
  expect(rows[0].data[0]).toBe("Ana");
  expect(rows[0].data[1]).toBe("line1\nline2\nline3");
  expect(rows[1].data).toEqual(["Bob","single line"]);
});

test("blank lines are skipped and extra columns yield error (job.csv)", async () => {
  const { rows, errors } = await collect(parseCSV(JOB_CSV_PATH, undefined, true));
  // Data rows: David, Eve (blank line skipped; Frank row is an error due to extra column)
  expect(rows.length).toBe(2);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0].message).toMatch(/Column count mismatch/);
});

test("CsvParseError includes rowNumber, message, rawLine", async () => {
  const { errors } = await collect(parseCSV(OTHER_CSV_PATH, undefined, true));
  // There should be at least one error from the malformed 'Charlie' line
  const err = errors[0];
  expect(typeof err.rowNumber).toBe("number");
  expect(typeof err.message).toBe("string");
  expect(typeof err.rawLine).toBe("string");
});

// Base A (unbranded): [name, price]
const BaseA = z.tuple([z.string(), z.coerce.number()]);
// A1: price >= 0
const A1 = BaseA.refine(([_, price]) => price >= 0, { message: "price must be >= 0" });
// A2: price is integer
const A2 = BaseA.refine(([_, price]) => Number.isInteger(price), { message: "price must be integer" });

// Base B (branded): [NonEmptyName, qty]
const BaseB = z.tuple([NameSchema, z.coerce.number()]);
// B1: qty >= 1
const B1 = BaseB.refine(([_, qty]) => qty >= 1, { message: "qty must be >= 1" });
// B2: qty even
const B2 = BaseB.refine(([_, qty]) => qty % 2 === 0, { message: "qty must be even" });

// Valid/invalid rows to test:
const goodA = ["Widget", "10"];   // ok for A1/A2 (10 integer >= 0)
const badA1 = ["Widget", "-5"];   // violates A1
const badA2 = ["Widget", "10.5"]; // violates A2

const goodB = ["Gizmo", "2"];     // ok for B1/B2
const badB1 = ["", "3"];          // name empty → brand/min(1) fails
const badB2 = ["Thing", "3"];     // odd qty → violates B2

test("US-5: A1 valid/invalid", async () => {
  const csv = `name,price\n${goodA.join(",")}\n${badA1.join(",")}`;
  const { rows, errors } = await collect(parseCSVFromString(csv, A1, true));
  expect(rows.length).toBe(1);
  expect(errors.length).toBe(1);
});

test("US-5: A2 valid/invalid", async () => {
  const csv = `name,price\n${goodA.join(",")}\n${badA2.join(",")}`;
  const { rows, errors } = await collect(parseCSVFromString(csv, A2, true));
  expect(rows.length).toBe(1);
  expect(errors.length).toBe(1);
});

test("US-5: B1 valid/invalid (branded)", async () => {
  const csv = `name,qty\n${goodB.join(",")}\n${badB1.join(",")}`;
  const { rows, errors } = await collect(parseCSVFromString(csv, B1, true));
  expect(rows.length).toBe(1); // Gizmo,2 passes
  expect(errors.length).toBe(1); // empty name fails brand/min(1)
});

test("US-5: B2 valid/invalid (branded)", async () => {
  const csv = `name,qty\n${goodB.join(",")}\n${badB2.join(",")}`;
  const { rows, errors } = await collect(parseCSVFromString(csv, B2, true));
  expect(rows.length).toBe(1); // Gizmo,2 passes (even)
  expect(errors.length).toBe(1); // 3 is odd
});
