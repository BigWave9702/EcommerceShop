import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_DATABASE_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 5000),
});

redis.on("error", (error) => {
  console.error("[redis] connection error:", error.message);
});

export default redis;
