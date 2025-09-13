import { parseCSV } from "../src/basic-parser";
import * as path from "path";
import { z } from "zod";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
const JOB_CSV_PATH = path.join(__dirname, "../data/job.csv");
const OTHER_CSV_PATH = path.join(__dirname, "../data/other.csv");

test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  
  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
  expect(results[3]).toEqual(["Charlie", "25"]);
  expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  for(const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});

const RowSchema = z.tuple([z.string(), z.coerce.number()]);

test("it THROWS AN ERROR when a row has a non-numeric type", async () => {
  await expect(parseCSV(OTHER_CSV_PATH, RowSchema)).rejects.toThrow();
});

/**
 * It uses the 'other.csv' 
 */
test("it THROWS AN ERROR when a row has too many columns", async () => {
  await expect(parseCSV(OTHER_CSV_PATH, RowSchema)).rejects.toThrow();
});

/**
 * It uses the 'job.csv'
 */
test("it THROWS AN ERROR when a row has too few columns", async () => {
  await expect(parseCSV(JOB_CSV_PATH, RowSchema)).rejects.toThrow();
});

test("it INCORRECTLY parses fields with quoted commas", async () => {
  const results = await parseCSV(OTHER_CSV_PATH);
  expect(results[0]).toEqual(['"Mallory, Alice"', 'senior developer']);
});