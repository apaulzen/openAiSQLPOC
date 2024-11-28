import express, { Application, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateSQL } from "./services/openai";
import { createClient } from "redis";
import * as dotenv from "dotenv";
import { getCachedQuery, setCachedQuery } from "./cache";
import { connectRedis } from "./redis";
import json from "./util/json";
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
connectRedis();

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello World!");
});

// API route to handle NLQ
app.post("/query", async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    res.status(400).send({ error: "Query is required" });
  }

  try {
    // Generate SQL from NLQ
    const sql = (await generateSQL(query)) as string;

    // Check Redis cache for result
    const cachedResult = await getCachedQuery(sql);
    if (cachedResult) {
      res.send({ cached: true, data: JSON.parse(cachedResult) });
    }

    // Execute SQL query using Prisma
    const result = await prisma.$queryRawUnsafe(sql);
    // console.log(result);

    // Cache the result
    await setCachedQuery(sql, result);

    res.send(JSON.stringify(result, (key, value) => (typeof value === "bigint" ? Number(value) : value)));
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
