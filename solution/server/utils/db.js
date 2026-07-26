import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionPool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/techup_blog_studio",
});

connectionPool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export default connectionPool;
