import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import * as dotenv from "dotenv";
import { extractSQL } from "../util/extractSql";
import llm from "../llm";
import { prisma } from "../lib";

dotenv.config();

const prompt = ChatPromptTemplate.fromTemplate(`
  You are a helpful assistant and an analyst with high proficiency with postgresql that converts natural language into SQL queries for an e-commerce database. 
  The database schema includes:
generator client {{
  provider = "prisma-client-js"
}}

datasource db {{
  provider = "postgresql"
  url      = env("DATABASE_URL")
}}

enum gender {{
  male
  female
  unisex
}}

enum category {{
  Apparel
  Footwear
}}

model articles {{
  id                Int               @id @default(autoincrement())
  productid         Int?
  ean               String?
  colorid           Int?
  size              Int?
  description       String?
  originalprice     Decimal?          @db.Money
  reducedprice      Decimal?          @db.Money
  taxrate           Decimal?          @db.Decimal
  discountinpercent Int?
  currentlyactive   Boolean?
  created           DateTime?         @default(now()) @db.Timestamptz(6)
  updated           DateTime?         @db.Timestamptz(6)
  colors            colors?           @relation(fields: [colorid], references: [id], onDelete: NoAction, onUpdate: NoAction)
  order_positions   order_positions[]
  stock             stock[]

  @@index([productid])
  @@index([colorid])
  @@index([size])
  @@index([created])
}}

/// This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
model colors {{
  id       Int        @id @default(autoincrement())
  name     String?
  rgb      String?
  articles articles[]

  @@index([name])
}}

/// This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
model customer {{
  id          Int       @id(map: "customer_pkey1") @default(autoincrement())
  firstname   String?
  lastname    String?
  gender      gender?
  email       String?
  dateofbirth DateTime? @db.Date
  address1    String?
  address2    String?
  city        String?
  zip         String?
  order       order[]
  created     DateTime? @default(now()) @db.Timestamptz(6)
  updated     DateTime? @db.Timestamptz(6)

  @@index([email])
  @@index([dateofbirth])
  @@index([created])
  @@index([updated])
  @@index([gender])
}}

/// This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
model order {{
  id              Int               @id @default(autoincrement())
  customerId      Int?
  ordertimestamp  DateTime?         @default(now()) @db.Timestamptz(6)
  total           Decimal?          @db.Money
  shippingcost    Decimal?          @db.Money
  created         DateTime?         @default(now()) @db.Timestamptz(6)
  updated         DateTime?         @db.Timestamptz(6)
  customer        customer?         @relation(fields: [customerId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  order_positions order_positions[]

  @@index([ordertimestamp])
  @@index([total])
}}

/// This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
model order_positions {{
  id        Int       @id @default(autoincrement())
  orderid   Int?
  articleid Int?
  amount    Int?      @db.SmallInt
  price     Decimal?  @db.Money
  created   DateTime? @default(now()) @db.Timestamptz(6)
  updated   DateTime? @db.Timestamptz(6)
  articles  articles? @relation(fields: [articleid], references: [id], onDelete: NoAction, onUpdate: NoAction)
  order     order?    @relation(fields: [orderid], references: [id], onDelete: NoAction, onUpdate: NoAction)

  @@index([created])
}}
  
/// This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
model sizes {{
  id       Int       @id @default(autoincrement())
  gender   gender?
  category category?
  size     String?
  size_us  Int?
  size_uk  Int?
  size_eu  Int?

  @@index([size])
  @@index([gender])
  @@index([category])
}}

/// This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
model stock {{
  id        Int       @id @default(autoincrement())
  articleid Int?
  count     Int?
  created   DateTime? @default(now()) @db.Timestamptz(6)
  updated   DateTime? @db.Timestamptz(6)
  articles  articles? @relation(fields: [articleid], references: [id], onDelete: NoAction, onUpdate: NoAction)

  @@index([articleid])
  @@index([count])
}}


Follow these rules:
1. Always use double quotes for column and table names.
2. Avoid using reserved SQL keywords unless properly escaped with double quotes.
3. Use explicit type casting where necessary. For example:
   - To compare a "money" column with a number, cast the "money" value to numeric using ""column_name"::numeric".
4. Ensure the query is syntactically valid for PostgreSQL.
5. If there is a question, query the database for all the tables you need and based on that that you are going to asnwer the question. So always query the database before answering the question.

Given the following query, return only the SQL query without any explanation or extra text:

{query}`);

// Create the LLM chain
const chain = prompt.pipe(llm);

export const generateSQL = async (query: string) => {
  const response = await chain.invoke({ query });
  const sqlQuery = extractSQL(response.content.toString());

  console.log("LLM Response:", sqlQuery);

  try {
    const result = await prisma.$queryRawUnsafe(sqlQuery);

    // const response = await llm.invoke(
    //   `
    //   Given the following user question, corresponding SQL query, and SQL result, answer the user question.

    //  Question: {question}
    //  SQL Query: {query}
    //  SQL Result: {result}
    //  Answer:
    //  `
    //     .replace("{question}", query)
    //     .replace("{query}", sqlQuery)
    //     .replace(
    //       "{result}",
    //       JSON.stringify(result, (key, value) => (typeof value === "bigint" ? Number(value) : value))
    //     )
    // );

    // console.log("LLM Response2:", response.content);

    return result;
  } catch (error) {
    return response.content.toString();
  }
};
