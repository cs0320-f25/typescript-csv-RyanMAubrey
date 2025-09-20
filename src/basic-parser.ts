import * as fs from "fs";
import * as readline from "readline";
import { z } from  "zod";

// Track quote state while ignoring "" escapes
function togglesQuoteState(chunk: string, inQuotes: boolean): boolean {
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] === '"') {
      if (i + 1 < chunk.length && chunk[i + 1] === '"') { i++; continue; } 
      inQuotes = !inQuotes; // Flip on unmatched quote
    }
  }
  return inQuotes;
}
// Helper function gets raw-sting support
export async function* parseCSVFromString<T>(
  csv: string,
  schema?: z.ZodType<T>,
  header: boolean = false,
  commentChar?: string
) {
  // Stream the string line-by-line using Readable + readline
  const { Readable } = await import("stream");
  const src = Readable.from(csv.split(/\r?\n/), { objectMode: true });
  const rl = readline.createInterface({ input: src, crlfDelay: Infinity });

  let headerRow: string[] | undefined = undefined;
  let lineNumber = 0;
  let inQuotes = false;
  let buffer = "";

  try {
    for await (const line of rl) {
      if (commentChar && line.trimStart().startsWith(commentChar)) continue;
      const combined = buffer ? buffer + "\n" + line : line;
      inQuotes = togglesQuoteState(line, inQuotes);
      if (inQuotes) { buffer = combined; continue; }
      buffer = "";
      lineNumber++;

      const values = parseLineCSV(combined);
      if (values.length === 1 && values[0] === "") continue;

      if (header && lineNumber === 1) { headerRow = values; continue; }

      if (schema) {
        const parsed = schema.safeParse(values);
        if (!parsed.success) {
          yield { rowNumber: lineNumber, message: parsed.error.message, zodError: parsed.error, rawLine: combined };
          continue;
        }
        yield { data: parsed.data as T, header: headerRow, rowNumber: lineNumber };
      } else {
        if (headerRow && values.length !== headerRow.length) {
          yield { rowNumber: lineNumber, message: `Column count mismatch: expected ${headerRow.length}, got ${values.length}`, rawLine: combined };
          continue;
        }
        yield { data: values, header: headerRow, rowNumber: lineNumber };
      }
    }
  } finally {
    rl.close();
  }
}
// Helper function thet parses each line correctly
function parseLineCSV(line: string): string[] {
  const re = /(?:^|,)(?:"((?:[^"]|"")*)"|([^",]*))/g; // Regex4
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m[1] !== undefined) out.push(m[1].replace(/""/g, '"')); // Unescape
    else out.push(m[2] ?? "");
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  // Keep trailing empty cell if line ends with comma
  if (line.endsWith(",")) out.push("");
  return out;
}

// Header reeturn type
export type RowWithHeader<T = string[]> = {
  data: T;
  header?: string[];
  rowNumber: number;
}

// Parser error return
export type CsvParseError = {
  rowNumber: number;     // Which line in the CSV file
  message: string;        // Human-readable message
  zodError?: z.ZodError;  // Full Zod error object
  rawLine: string;       // The original CSV text for that row
};

/**
 * This is a JSDoc comment. Similar to JavaDoc, it documents a public-facing
 * function for others to use. Most modern editors will show the comment when 
 * mousing over this function name. Try it in run-parser.ts!
 * 
 * File I/O in TypeScript is "asynchronous", meaning that we can't just
 * read the file and return its contents. You'll learn more about this 
 * in class. For now, just leave the "async" and "await" where they are. 
 * You shouldn't need to alter them.
 * 
 * @param path The path to the file being loaded.
 * @returns an async generator that yields { data, header, rowNumber } for each row
 */
export async function* parseCSV<T>(path: string, schema?: z.ZodType<T>, header: boolean = false, commentChar?: string): AsyncGenerator<RowWithHeader<T | string[]>  | CsvParseError> {
  // This initial block of code reads from a file in Node.js. The "rl"
  // value can be iterated over in a "for" loop. 
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // handle different line endings
  });

  // Header holder
  let headerRow: string[] | undefined = undefined;  
  // Create line bumber to track what csv file line breaks
  let lineNumber = 0;
  

  // We add the "await" here because file I/O is asynchronous. 
  // We xneed to force TypeScript to _wait_ for a row before moving on. 
  // More on this in class soon!
  // Inside an open quoted field
  let inQuotes = false;  
  let buffer = "";
  for await (const line of rl) {
    // If the linee is a comment skip
    if (commentChar && line.trimStart().startsWith(commentChar)) continue;
    const combined = buffer ? (buffer + "\n" + line) : line;

    // Update quote state using only the new chunk
    inQuotes = togglesQuoteState(line, inQuotes);
  
    if (inQuotes) {
      // Not complete yet—keep accumulating
      buffer = combined;
      continue;
    }
  
    // Record complete—clear buffer and count it
    buffer = "";
    lineNumber++;    
    // Parses line for the correct dsata
    const values = parseLineCSV(combined);
    // If it's a blank line, skip
    if (values.length === 1 && values[0] === "") continue;  
  
    // Comment: save header row and skip it as data
    if (header && lineNumber === 1) {
      headerRow = values;
      continue;
    }
  
    if (schema) {
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        // Yield a structured error instead of throwing
        yield {
          rowNumber: lineNumber,
          message: parsed.error.message,
          zodError: parsed.error,
          rawLine: combined
        } as CsvParseError;
        // Skip to next line automatically
        continue;
      }
      // Saves data in header return type
      yield { data: parsed.data as T, header: headerRow, rowNumber: lineNumber };
    } else {
      // Error check
      if (headerRow && values.length !== headerRow.length) {
        yield {
          rowNumber: lineNumber,
          message: `Column count mismatch: expected ${headerRow.length}, got ${values.length}`,
          rawLine: combined
        } as CsvParseError;
        continue;
      }
      // Saves data in header return type
      yield { data: values, header: headerRow, rowNumber: lineNumber };
    }
  }
} 