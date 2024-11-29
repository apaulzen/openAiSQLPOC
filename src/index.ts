import express, { Application, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// import { generateSQL } from "./util/generateSql";
import { createClient } from "redis";
import * as dotenv from "dotenv";
import { getCachedQuery, setCachedQuery } from "./cache";
import { connectRedis } from "./redis";
import json from "./util/json";
import cors from "cors";
import { extractSQL } from "./util/extractSql";
import { generateSQL } from "./services/openai";
import { generateSQLWithAgent } from "./util/generateSql";
import { contextAwareQnA, initDatabase } from "./services/openai2";
// import { contextAwareQnA, initDatabase } from "./services/openai2";
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
connectRedis();

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello World!");
});

// API route to handle NLQ
app.post("/query", async (req: Request, res: Response) => {
  const { query } = req.body;

  await initDatabase();

  if (!query) {
    res.status(400).send({ error: "Query is required" });
  }

  try {
    // Generate response from LLM
    console.log("here");

    const llmResponse = await contextAwareQnA(query);

    // Check if the LLM response contains a valid SQL query

    // If no SQL query is returned, treat the LLM response as a direct answer
    res.send({ answer: llmResponse });
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
