import * as fs from "fs";
import * as readline from "readline";
import { z } from  "zod";

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
 * @returns a "promise" to produce a 2-d array of cell values
 */
export async function parseCSV<T>(path: string, schema?: z.ZodType<T>, header: boolean = false): Promise<string[][] | T[]> {
  // This initial block of code reads from a file in Node.js. The "rl"
  // value can be iterated over in a "for" loop. 
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // handle different line endings
  });
  
  // Create line bumber to track what csv file line breaks
  let lineNumber = 0;

  // We add the "await" here because file I/O is asynchronous. 
  // We xneed to force TypeScript to _wait_ for a row before moving on. 
  // More on this in class soon!
  if (schema) {
    const result: T[] = [];
    for await (const line of rl) {
      // Iterate the line number
      lineNumber++;
      // If there is a header row skip it once
      if (header && lineNumber === 1) continue;
      const values = line.split(",").map((v) => v.trim());
      const parsed = schema.safeParse(values);
  
      if (parsed.success) {
        result.push(parsed.data);
      } else {
        throw new Error(`CSV parsing error on line ${lineNumber}: ${parsed.error.message}`);
      }
    }
    return result;
  } else {
    let result: string[][] = [];
    for await (const line of rl) {
      // Iterate the line number
      lineNumber++;
      // If there is a header row skip it once
      if (header && lineNumber === 1) continue; 
      const values = line.split(",").map((v) => v.trim());
      result.push(values);
    }
    return result;
  }
} 