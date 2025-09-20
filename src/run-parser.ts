import { parseCSV } from "./basic-parser";
import { z } from "zod";

/*
  Example of how to run the parser outside of a test suite.
*/

const DATA_FILE = "./data/people.csv"; // update with your actual file name

async function main() {
  // Stream rows one-by-one
  for await (const record of parseCSV(DATA_FILE /* path */, /* schema */ undefined, /* header */ false, /* commentChar */ "#")) {
    if ("message" in record) {
      // Structured error
      console.error("ERR line", record.rowNumber, "-", record.message);
    } else {
      // Good row-> string[] or schema-typed T
      console.log(record.data); 
    }
  }
}

main();