import { redis } from "../redis";

const setCachedQuery = async (key: string, value: any, ttl = 3600) => {
  await redis.set(
    key,
    JSON.stringify(value, (key, value) => (typeof value === "bigint" ? Number(value) : value)),
    {
      EX: ttl, // Expiry time in seconds
    }
  );
};

// Function to get cached result
const getCachedQuery = async (key: string) => {
  const cachedValue = await redis.get(key);
  return cachedValue ? JSON.parse(cachedValue) : null;
};

export { setCachedQuery, getCachedQuery };
