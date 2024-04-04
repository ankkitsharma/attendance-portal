import express from "express";
import cors from "cors";
import env from "dotenv";
import jwt from "jsonwebtoken";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

env.config();

//create database pool
const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

//test the database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to PostgreSQL database:", err);
  } else {
    console.log("Connected to PostgreSQL database at:", res.rows[0].now);
  }
});

//generate new refresh token and access token
let refreshTokens = [];
app.post("api/refresh", (req, res) => {
  //take the refresh token from the user
  const refreshToken = req.body.token;
  //send error if there is no token or it's invalid
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json("Refresh token is not valid!");

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  //if everything is ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15s",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.REFRESH_TOKEN_SECRET
  );
};

//verify token
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

//register user
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    const emailCheckQuery = {
      text: "SELECT * FROM users WHERE username = $1",
      values: [username],
    };
    const emailCheckResult = await pool.query(emailCheckQuery);
    if (emailCheckResult.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    const insertUserQuery = {
      text: "INSERT INTO users (username, password, isAdmin) VALUES ($1, $2, $3) RETURNING *",
      values: [username, password, isAdmin],
    };
    const newUser = await pool.query(insertUserQuery);
    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error signing up:", error);
  }
});

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
