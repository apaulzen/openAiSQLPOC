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
import { marked } from "marked";

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

const historyPrompt: any[] = [];

export const getSystemPrompt = async (question: string) => {
  const executeQuery = new QuerySqlTool(db);
  const tableNames = db.allTables.map((t) => t.tableName).join("\n");
  // to do add limit: Limit fetched data to maximum 10 rows.
  const queryPrompt = PromptTemplate.fromTemplate(`
    Make sure to always return names of user village and other entities. ALWAYS OMIT \"imagebase64\" COLUMN FROM SELECT STATEMENTS. ALWAYS OMIT \"relationship_json\" COLUMN FROM SELECT STATEMENTS. 
    {input}.
    If the query contains the words "COUNT", "Number of", or any other indication of aggregation (e.g., "total", "how many", "counting"), always generate a SQL query that returns a count of the relevant rows or entities.
    Put the column names in quote in the query.
    
        The top_k is set to {top_k}.
    the table info is {table_info}. {table_names}. {table_names_to_query}.
    
    table schema is:

    generator: client -> provider: "prisma-client-js"

datasource: db -> provider: "postgresql", url: env("DATABASE_URL")

enum: Relation -> father, mother, husband, wife, son, daughter, brother, sister, friend, cousin, spouse, child, sibling, parent, relative

enum: RelationCategory -> dependants, nonDependants

model: NodeDetails -> id (String), node_id (String, unique), n_name (String?), n_lat (Float?), n_long (Float?), village_id (String), node_description (String?), relations: village (relation to VillageDetails with fields: [village_id], references: [village_id]), villageEntryExits (relation to VillageEntryExit).

model: UserInfo -> id (String, default uuid, unique), user_id (String, unique), f_name (String?), l_name (String?), gender (String?), contact (String?), dob (DateTime?), age (Int?), image_ref (String?), thumb_ref (String?), address (String?), uploaded_at (DateTime?), updated_at (DateTime?), created_at (DateTime?), user_created_at (DateTime?), user_updated_at (DateTime?), city (String?), state (String?), pincode (String?), aadhar (String?), country (String?), village_id (String), wanted (Boolean?), imagebase64 (Bytes?), category (String?), category_remarks (String?), vehicle_type (String?), vehicle_number (String?), vehicle_make_model (String?), vehicle_remarks (String?), remarks (Json?), religion (String?), alias_name (String?), profession (String?), profession_remarks (String?), mail_id (String?), social_media (String?), education_info (String?), qualification (String?), qualification_remarks (String?), school (String?), documents (String[]), relations: village (relation to VillageDetails with fields: [village_id], references: [village_id]), villageEntryExits (relation to VillageEntryExit), userFingerprints (relation to UserFingerprint), user_relationship_id (String?), userRelationships (relation to UserRelationship with fields: [user_relationship_id], references: [user_id]), userRelations (relation to UserRelations with relation name "relations"), userReverseRelations (relation to UserRelations with relation name "reverseRelations"), anomalies (relation to anomaly with relation name "UserAnomalies").

model: UserRelationship -> id (String, default cuid()), user_id (String, unique), relationship_json (Json), relations: user (relation to UserInfo).

model: UserRelations -> user_id (String), relative_id (String), relation (Relation), reverse_relation (Relation), relation_type (RelationCategory?), updated_at (DateTime?), relations: user (relation to UserInfo with fields: [user_id], references: [user_id], onDelete: Cascade), relative (relation to UserInfo with fields: [relative_id], references: [user_id], onDelete: Cascade).

model: VillageDetails -> id (String), village_id (String, unique), v_name (String?), v_pincode (String?), v_code (String?), v_district (String?), v_state (String?), v_lat (Float?), v_long (Float?), relations: nodeDetails (relation to NodeDetails), users (relation to UserInfo), villageEntryExits (relation to VillageEntryExit).

model: VillageEntryExit -> id (String), reason (String?), entry_or_exit_at (DateTime), entry_or_exit (String?), user_id (String), village_id (String), node_id (String), imagebase64 (Bytes?), category (String?), category_remarks (String?), vehicle_type (String?), vehicle_number (String?), vehicle_make_model (String?), vehicle_remarks (String?), purpose_of_visit (String?), remarks1 (String?), remarks2 (String?), remarks3 (String?), remarks4 (String?), remarks (Json?), relations: userInfo (relation to UserInfo with fields: [user_id], references: [user_id]), village (relation to VillageDetails with fields: [village_id], references: [village_id]), nodeDetails (relation to NodeDetails with fields: [node_id], references: [node_id]).

model: UserFingerprint -> id (String), user_id (String, unique), fingerprints (String[]), bitmap (String?), iso (String?), relations: userInfo (relation to UserInfo with fields: [user_id], references: [user_id]).

model: deletedUser -> deletedUserId (String, id), reason (String), reconciledUserId (String?), createdAt (DateTime, default now()).

model: cdrData -> id (String, default uuid), record_id (String, unique), calling (BigInt?), called (BigInt?), duration (Float?), date_time (String?), call_type (String?), cell_tower1 (String?), cell_tower2 (Float?), imei (BigInt?), imsi (String?), smsc (String?), network (String?).

model: UserCredentials -> username (String, id, unique), password (String), passwordPlain (String), authUserId (String?), reason (String?), relations: authUser (relation to AuthUsers with fields: [authUserId], references: [id]).

model: AuthUsers -> id (String, default uuid), name (String), email (String), relations: userCredentials (relation to UserCredentials).

enum: AnomalyType -> LOCATION_CHANGES_CDR, ABNORMAL_DURATION_CDR, ABNORMAL_CALL_FREQUENCY_CDR, UNUSUAL_CALL_TIMINGS_CDR, TOO_MANY_DEVICE_CDR, CONTACTED_CRIMINALS_CDR, DUPLICATE_AADHAAR, VEHICLE_DETAILS_DEVIATION, SUSPICIOUS_CONNECTION, WANTED_DETECTED, SUSPECT_DETECTED

enum: AlertType -> CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL

enum: AnomalyStatus -> ASSIGNED, OPEN, CLOSED, IN_PROGRESS

model: anomaly -> id (String, default uuid), user_id (String?), phone_number (String?), anomalyType (AnomalyType), alertType (AlertType), description (Json), status (AnomalyStatus, default OPEN), assignedTo (String?), detectedAt (DateTime, default now()), createdAt (DateTime, default now()), closeTime (DateTime?), imageBase64 (Bytes?), resolutionRemarks (String[]), relations: user (relation to UserInfo with fields: [user_id], references: [user_id], name: "UserAnomalies").

model: faces -> id (String, db.Text, id), encoding (Bytes?), reconciled (Boolean, default false).

model: SyncLogger -> id (String, default uuid), syncedAt (DateTime).
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
  

  const answerPrompt = PromptTemplate.fromTemplate(
    `
    Given the following user question, corresponding SQL query, and SQL result, answer the user question. Giver proper explanations.
    If the question is related to previous data or does not require querying, provide an answer from context.
    Your users will be non-technical and will ask questions about the data in the database, 
    OMIT technical details like column names, table names, id's, etc while answering the question.
    ALWAYS RETURN FULL NAMES INSTEAD OF ID. Also use markdown for formatting.
  
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

        // return await fullChain.invoke({
        //   question: `${formattedQuestion}
        //   `,
        // });

        return await queryChain.invoke({
          question: formattedQuestion,
          table_names: tableNames,
          table_names_to_query: 'Any tables required, see schema',
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
        console.log(result);

        console.log("Result size:", result.length);

        return result;
      },
    }),
    answerChain,
  ]);

  const mdresponse  = (await finalChain.invoke({ question: question }));

  const response = marked(mdresponse);

  console.log(response, "response");

  historyPrompt.push([question, mdresponse]);

  // Log the history size after updating
  console.log("Updated historyPrompt size:", historyPrompt.length);
  console.log("Updated historyPrompt:", historyPrompt);

  return response;
};
