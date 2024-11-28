import { createClient } from "redis";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize Redis client
const redis = createClient({
  url: process.env.REDIS_URL, // Use environment variable for Redis URL
});

// Handle Redis client errors
redis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

// Connect to Redis
async function connectRedis() {
  if (!redis.isOpen) {
    try {
      await redis.connect();
      console.log("Redis connected");
    } catch (error) {
      console.error("Error connecting to Redis:", error);
    }
  }
}

// Export Redis client and connect function
export { redis, connectRedis };
