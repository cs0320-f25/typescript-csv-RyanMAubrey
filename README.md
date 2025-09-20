# Sprint 1: TypeScript CSV

### Task C: Proposing Enhancement

- #### Step 1: Brainstorm on your own.
1. Functionality- As a user I could skip a row of data so there would need to be tests for missing columns
2. Extensibility- As a user I could introduce an unforeseen category so the parser would need to account for extra fields if it is an object
3. Functionality- As a user I could input something that includes a comma but not used to separate columns like 30,000 so the parser would need to interpret data correctly 

- #### Step 2: Use an LLM to help expand your perspective.

Prompt- I am working on a csv parser using java script that currently accepts a filename as input and converts rows into strings or objects.. I aim brainstorming ideas on enhancements for bugs or new features these are my ideas
- #### Step 1: Brainstorm on your own.
1. Functionality- As a user I could skip a row of data so there would need to be tests for missing columns
2. Extensibility- As a user I could introduce an unforeseen category so the parser would need to account for extra fields if it is an object
3. Functionality- As a user I could input something that includes a comma but not used to separate columns like 30,000 so the parser would need to interpret data correctly


- #### Step 3: use an LLM to help expand your perspective.

    Include a list of the top 4 enhancements or edge cases you think are most valuable to explore in the next week’s sprint. Label them clearly by category (extensibility vs. functionality), and include whether they came from you, the LLM, or both. Describe these using the User Story format—see below for a definition. 

1. Quoted Field Handling
Category: Functionality
Source: Both (My initial idea of commas in fields, expanded by the LLM)
User Story: "As a data analyst, I want the parser to correctly interpret fields wrapped in double quotes, so that data containing commas or other special characters is treated as a single, complete value."
Idea: The enclosing double quotes are removed from the final parsed value.

2. Custom Delimiter Support
Category: Extensibility
Source: LLM 
User Story: "As a developer working with international or tab-separated data, I want to be able to specify a custom delimiter character (like a semicolon or tab), so that I can parse files that do not use the standard comma separator."
Idea: The parser function would accept an optional parameter to define the character used to separate fields. If not provided, it would default to a comma.

3. Flexible Line Endings
Category: Functionality
Source: LLM
User Story: "As a user, I want to parse files created on any operating system, so that the parser works reliably with both Windows (\r\n) and macOS/Linux (\n) line endings."
Idea: The parser correctly splits rows accounting for different line breaks.

4. Comment Character Support
Category: Functionality
Source: Me
User Story: "As a data scientist, I want the parser to automatically skip lines that begin with a specific comment character (e.g., '#'), so I can process data files containing metadata or notes without them being incorrectly treated as data rows."
Idea: The parser could be configured with a comment character. When reading the file, any line that starts with this character is ignored and not included in the final output.

    Include your notexs from above: what were your initial ideas, what did the LLM suggest, and how did the results differ by prompt? What resonated with you, and what didn’t? (3-5 sentences.) 

My initial brainstorming focused on handling common real-world data issues, such as rows with missing or extra columns and fields containing commas (e.g., "30,000"). The LLM helped expand on these ideas, suggesting the standard CSV solution of handling double-quoted fields for the comma issue and introducing the crucial, cross-platform consideration of flexible line endings (\n vs. \r\n). I found that providing the LLM with my own ideas first led to more specific, implementation-focused advice. What resonated most was how the LLM helped formalize my initial thoughts into industry-standard features though was very general and did not take niche edge cases into much consideration.


### Design Choices

### 1340 Supplement
Supplemental Challenge A JSON-encoded linked list can be represented as a series of nested objects. Each object, or "node," would contain two key-value pairs: A value property holding the data for that node (e.g., a number or string). A next property which points to the next node in the list. This property would either contain another nested node object or be null to indicate the end of the list. The Zod schema must be able to refer to itself. This is accomplished using z.lazy(). The schema below defines a Node that expects a value and a next property that can either be another Node or null. 
const NodeSchema: z.ZodType<Node> = z.object({
  value: z.string(),
  next: z.lazy(() => NodeSchema.nullable())
});

- #### 1. Correctness
To be correct the parser must always be reliable no matter the input. It must preserve fields that contain delimiters by correctly interpreting enclosing quotes, ensuring a single data value is not mistakenly split apart. 
- #### 2. Random, On-Demand Generation
Using a random CSV data generator would dramatically expand testing by creating inputs I might never design myself. This method is excellent for discovering elusive edge cases, such as how the parser handles empty fields, special characters, or unusually formatted but valid rows. 
- #### 3. Overall experience, Bugs encountered and resolved: This sprint differed from prior assignments by focusing on modifying existing code and building a flexible tool for other developers, rather than starting from a blank slate. It required more planning and design, especially when considering the needs of a future user of the parser.
#### Errors/Bugs: 
I encountered a significant bug where TypeScript couldn't resolve my function's dual return types which I fixed by typecasting the return variable depending on the schema was given or not.
#### Tests: 
Parsing fields that contain commas by being enclosed in double quotes. Handling rows with a different number of columns than expected. Correctly processing files with empty lines or empty fields.
#### How To… 
Run the parser- npm run run
Run the parser tests- npm run test

# Sprint 2: TypeScript CSV
### Step 2
I wrote six Jest tests:
1. Quoted comma – checks regex1 splits incorrectly.
2. Escaped quotes – shows 2/3/4 handle "" inside quotes.
3. Empty middle field – proves regex1 drops empty cells.
4. Trailing comma – shows regex2 misses the last empty cell.
5. Embedded newline in quotes – ensures 2/3/4 keep the whole field.
6. Whitespace around tokens – all should still find three fields.

### Step 3
regex1 – Splits inside quoted text, so "Mallory, Alice" becomes two cells.
regex2 – Often drops the final empty cell if a line ends with a comma.
regex3 – Captures the comma in a group so you need to clean up the match.
regex4 – Still needs a clean-up step to remove outer quotes and turn "" into ".

### Step 4
I asked an LLM for a CSV cell regex. It gave: ("(?:""|[^"])*"|[^,\r\n]*)(?:,|$)
Reflection: I evaluated my corectness by writing targeted tests for the tricky CSV cases like quoted commas, escaped quotes, empty middle fields, trailing empties, and embedded newlines in quotes.
### Step 5
I chose regex4 for my parser. It matched every test case, the groups are simple to use, and the clean up on the data is quick stripping the quots.

### Code Changes (Sprint 2)
- Switched parser to an async generator that yields one row at a time.
- Added header support: first non-comment logical record can be used as header; it’s not returned as data; each row includes `header`.
- Implemented robust CSV tokenization (quoted commas, "" escaping) and multi-line quoted fields.
- Added comment skipping via optional `commentChar`.
- Errors are yielded as structured objects `{ rowNumber, message, rawLine, zodError? }` instead of throwing; parsing continues after errors.
- Zod schemas are supported via `safeParse`, including `.refine()` and `.brand()`.
- Added `parseCSVFromString` for raw CSV strings, in addition to file paths.

### 1340 Supplement
1. “Give me a JavaScript/TypeScript regex that matches valid arithmetic expressions with + - * / and parentheses. Numbers can be integers or decimals. Spaces allowed. It should reject unfinished expressions and unbalanced parentheses.”

“It must compile in TypeScript and work with new RegExp().”

“No lookbehind or recursion—just standard JS regex.”

2. “Give me a JavaScript/TypeScript regex that matches valid arithmetic expressions with + - * / and parentheses. Numbers can be integers or decimals. Spaces allowed. It should reject unfinished expressions and unbalanced parentheses.”

“It must compile in TypeScript and work with new RegExp().”

“No lookbehind or recursion—just standard JS regex.”

3. 
export const ARITH_REGEX =
  /^\s*[+-]?\s*(?:\d+(?:\.\d+)?|\((?:[^()]|\([^()]*\))*\))\s*(?:[+\-*/]\s*(?:\d+(?:\.\d+)?|\((?:[^()]|\([^()]*\))*\))\s*)*$/;

  Tests:
  import { ARITH_REGEX } from "../src/arithmetic-regex"; // or inline the regex here

// Comment: helpers
const ok  = (s: string) => ARITH_REGEX.test(s);
const bad = (s: string) => !ARITH_REGEX.test(s);

describe("1340 arithmetic regex", () => {
  test("accepts simple and spaced expressions", () => {
    const good = [
      "42",
      "1+2",
      "2 - 3 * 4",
      "(2+5)*3",
      "( 2 + 5 ) * 3",
      "10 / (2 + 3*4)",
      "((1 + 2)) * 3 - 4 / (5 + 6)", // classic example
      "0.5 + .5 + 1"                  // dot-forms: note `.5` is NOT matched by this regex
    ];
    // Comment: .5 isn't matched (requires leading digit). Keep to show a miss later.
    for (const g of good.slice(0, 6)) expect(ok(g)).toBe(true);
  });

  test("rejects unfinished or garbage", () => {
    const bads = [
      "3 +",          // rhs missing
      "1 *",          // rhs missing
      "()",           // empty parens
      "( )",          // empty parens
      "a + 3",        // invalid char
      "2 + (3 * 4",   // missing ')'
      "((1 + 2)) * 3 - 4 ) / (5 + 6)", // extra ')'
    ];
    for (const b of bads) expect(bad(b)).toBe(true);
  });

  test("known limitations (documented)", () => {
    // Comment: JS regex can't truly enforce nested balance; tricky cases may slip.
    // `.5` (leading dot) isn't matched by my numeric rule. This shows a limitation.
    expect(ok(".5 + 1")).toBe(false); 
    // Very deep nesting can behave inconsistently; we assert nothing here.
  });
});

4. . It catches a lot of obvious errors but can’t guarantee balanced nesting. Allowed operator placement, allowed characters, many everyday inputs; rejects dangling operators and empty (). Missed ull parenthesis balancing and some number formats.

### Reflection
Engineering code for unknown future developers means writing clear, flexible, and well-documented components so others can safely extend or repurpose them without needing to understand every internal detail. This sprint made me focus more on readability, thorough error handling, and tests than I normally would since I thought more about how my code is used than how I want it to be used.

#### Team members and contributions (include cs logins):
raubrey
#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI): 
Gemini 2.5 Pro
#### Total estimated time it took to complete project: 
10 Hours
#### Link to GitHub Repo:  
https://github.com/cs0320-f25/typescript-csv-RyanMAubrey
