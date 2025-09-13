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

#### Team members and contributions (include cs logins):
raubrey
#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI): 
Gemini 2.5 Pro
#### Total estimated time it took to complete project: 
4 Hours
#### Link to GitHub Repo:  
https://github.com/cs0320-f25/typescript-csv-RyanMAubrey
