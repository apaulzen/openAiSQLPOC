import { chainWithHistory, chatHistory, messages } from "../lib";
import { extractSQL } from "./extractSql";
import getDatabaseSchema from "./getDatabaseSchema";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import utils from "util";

const schemaPromptTemplate = `
  You are a smart assistant that can analyze and query a PostgreSQL database.
  The database schema includes the following tables and columns:
  {schema}

  You will answer questions based on the data from these tables. If the question requires retrieving data, generate the appropriate SQL query.
  If the question is related to previous data or does not require querying, provide an answer from context.

  User Query: {query}
`;

export const generateSQLWithAgent = async (query: string) => {
  // Retrieve the latest schema from the database
  const schema = await getDatabaseSchema();

  delete schema._prisma_migrations;

  // Convert schema to a string with double curly braces
  const transformedSchema = JSON.stringify(schema, null, 2).replace(/{/g, "{{").replace(/}/g, "}}");

  // Create the prompt with schema and context
  const prompt = schemaPromptTemplate.replace("{schema}", transformedSchema);

  console.log("Prompt:", prompt.replace("{query}", query));

  console.log(
    utils.inspect(new SystemMessage(prompt.toString().replace("{query}", query)).content.toLocaleString(), {
      depth: null,
      colors: true,
    })
  );

  // Pass the prompt to the LLM chain
  const response = await chainWithHistory.invoke([new HumanMessage(prompt.toString().replace("{query}", query))], {
    configurable: { sessionId: "1" },
  });

  console.log("LLM Response:", response.content);
  if (response.content.toString()) {
    const aiMessage = response.content.toString();
    messages.push(new AIMessage(aiMessage));
  }
  const sqlQuery = extractSQL(response.content.toString());

  return sqlQuery;
};
