import { DataSource } from "typeorm";

export const datasource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: false,
});
