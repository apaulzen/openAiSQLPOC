import { createSqlQueryChain } from "langchain/chains/sql_db";
import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";
import { QuerySqlTool } from "langchain/tools/sql";
import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv";
import llm from "../llm";

// Load environment variables
dotenv.config();

let db: SqlDatabase;
let writeQuery: RunnableSequence<Record<string, unknown>, string>;
let executeQuery: QuerySqlTool;

export const initDatabase = async () => {
  const datasource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
  });
  await datasource.initialize();

  db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });

  writeQuery = await createSqlQueryChain({
    llm,
    db,
    dialect: "postgres",
  });

  executeQuery = new QuerySqlTool(db);
};

const parser = new StringOutputParser();

const answerPrompt = PromptTemplate.fromTemplate(
  `
  Given the following user question, corresponding SQL query, and SQL result, answer the user question. Giver proper explanations and summarizations.
  If the question is related to previous data or does not require querying, provide an answer from context.
  Your users will be non technical and will ask questions about the data in the database, Omit technical details like column names, table names, id's, etc while answering the question.

  Question: {question}
  SQL Query: {query}
  SQL Result: {result}
  Answer:
`
);

const historyPrompt: any[] = [];

const answerChain = answerPrompt.pipe(llm).pipe(parser);

const chain = RunnableSequence.from([
  RunnablePassthrough.assign({
    query: async (input: { question: string; schemaInfo: string }) => {
      console.log("Input to query generation:", input);

      const formattedHistory = historyPrompt
        .map((entry, index) => (index % 2 === 0 ? `I asked: ${entry}` : `you replied:${entry}`))
        .join(", ");

      const formattedQuestion = formattedHistory
        ? `${formattedHistory}, question:${input.question}`
        : `question:${input.question}`;

      return await writeQuery.invoke({
        question: `${formattedQuestion}. Limit fetched data to maximum 10 rows.`,
        schemaInfo: input.schemaInfo,
      });
    },
  }),
  RunnablePassthrough.assign({
    result: async (input: { query: string }) => {
      console.log("Input to execute query:", input);
      return await executeQuery.invoke(input.query);
    },
  }),
  answerChain,
]);

export const contextAwareQnA = async (question: string) => {
  const schemaInfo = `
    These are my tables:
    ${db.allTables}
    These are my tableInfo:
    ${JSON.stringify(await db.getTableInfo(db.allTables.map((table) => table.tableName)))}
    `;

  const context = {
    question,
    schemaInfo,
  };

  const response = await chain.invoke(context);

  console.log(response, "response");

  historyPrompt.push([question, response]);

  return response;
};
