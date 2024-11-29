import { prisma } from "../lib";

const getDatabaseSchema = async () => {
  const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`;

  const schema: Record<string, any> = {};

  for (const table of tables as any) {
    const columns = await prisma.$queryRaw`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = ${table.table_name}`;
    schema[table.table_name] = columns;
  }

  return schema;
};

export default getDatabaseSchema;
