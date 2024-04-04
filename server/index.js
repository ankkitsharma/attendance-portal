import express from "express";
import cors from "cors";
import env from "dotenv";
import jwt from "jsonwebtoken";
import pg from "pg";

const app = express();

env.config();
const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.use(cors());
app.use(express.json());

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to PostgreSQL database:", err);
  } else {
    console.log("Connected to PostgreSQL database at:", res.rows[0].now);
  }
});

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
