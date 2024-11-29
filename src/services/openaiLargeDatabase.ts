import { SqlDatabase } from "langchain/sql_db";
import { datasource } from "../lib/dataSource";
import { z } from "zod";
import { BasePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import llm from "../llm";
import { createSqlQueryChain } from "langchain/chains/sql_db";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { QuerySqlTool } from "langchain/tools/sql";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BasePromptValue } from "@langchain/core/prompt_values";
import { extractSQL } from "../util/extractSql";
import { prisma } from "../lib";

let db: SqlDatabase;

export const initDatabase = async () => {
  await datasource.initialize();
  db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
    sampleRowsInTableInfo: 0,
  });
};

const Table = z.object({
  names: z.array(z.string()).describe("Names of tables in SQL database"),
});

export const getSystemPrompt = async (question: string) => {
  const executeQuery = new QuerySqlTool(db);
  const tableNames = db.allTables.map((t) => t.tableName).join("\n");

  const queryPrompt = PromptTemplate.fromTemplate(`
    Limit fetched data to maximum 10 rows. Make sure to always return names of user village and other entities. ALWAYS OMIT \"imagebase64\" COLUMN FROM SELECT STATEMENTS.
    {input}.
    The top_k is set to {top_k}.
    the table info is {table_info}.
    the table names are {table_names}.
    The tables to query are {table_names_to_query}.
    `);

  const prompt2 = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Return the names of the SQL tables that are relevant to the user question.
    The tables are:
  
    ${tableNames}
`,
    ],
    ["human", "{input}"],
  ]);

  const categoryChain = prompt2.pipe(llm.withStructuredOutput(Table));

  const queryChain = await createSqlQueryChain({
    llm,
    db,
    dialect: "postgres",
    prompt: queryPrompt,
    k: 1,
  });

  const tableChain3 = RunnableSequence.from([
    {
      input: (i: { question: string }) => i.question,
    },
    categoryChain,
  ]);

  // The problem lies here, trying with custom prompt

  const fullChain = RunnablePassthrough.assign({
    tableNamesToUse: tableChain3,
  }).pipe(async (input) => {
    console.log("Input to queryChain:", input);
    return await queryChain.invoke({
      question: input,
      table_names: tableNames,
      table_names_to_query: input.tableNamesToUse,
    });
  });
  const historyPrompt: any[] = [];

  const answerPrompt = PromptTemplate.fromTemplate(
    `
    Given the following user question, corresponding SQL query, and SQL result, answer the user question. Giver proper explanations.
    If the question is related to previous data or does not require querying, provide an answer from context.
    Your users will be non-technical and will ask questions about the data in the database, 
    OMIT technical details like column names, table names, id's, etc while answering the question.
    ALWAYS RETURN FULL NAMES INSTEAD OF ID.
  
    Question: {question}
    SQL Query: {query}
    SQL Result: {result}
    Answer:
  `
  );

  const parser = new StringOutputParser();

  const answerChain = answerPrompt.pipe(llm).pipe(parser);

  const finalChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      query: async (input: { question: string }) => {
        console.log("Input to query generation:", input);

        const formattedHistory = historyPrompt
          .map((entry, index) => (index % 2 === 0 ? `I asked: ${entry}` : `you replied:${entry}`))
          .join(", ");

        console.log("Formatted history:", formattedHistory);
        console.log("Formatted history length:", formattedHistory.length);

        const formattedQuestion = formattedHistory
          ? `${formattedHistory}, question:${input.question}`
          : `question:${input.question}`;

        console.log("Formatted question:", formattedQuestion);
        console.log("Formatted question length:", formattedQuestion.length);

        // Log full prompt size before sending
        console.log("Sending query to OpenAI:", formattedQuestion);

        return await fullChain.invoke({
          question: `${formattedQuestion}
          `,
        });
      },
    }),
    RunnablePassthrough.assign({
      result: async (input: { query: string }) => {
        console.log("Input to execute query:", input);
        console.log(extractSQL(input.query));

        let result: string = ""; // Initialize result as an empty string.

        const sqlQueries = extractSQL(input.query);
        if (Array.isArray(sqlQueries)) {
          // Use a for...of loop to handle async correctly.
          for (const sqlQuery of sqlQueries) {
            result += await executeQuery.invoke(sqlQuery);
          }
        } else {
          result = await executeQuery.invoke(sqlQueries);
        }

        // Log the result size to see if it's too large
        console.log("Result size:", result.length);

        return result;
      },
    }),
    answerChain,
  ]);

  const response = await finalChain.invoke({ question: question });

  console.log(response, "response");

  historyPrompt.push([question, response]);

  // Log the history size after updating
  console.log("Updated historyPrompt size:", historyPrompt.length);
  console.log("Updated historyPrompt:", historyPrompt);

  return response;
};
