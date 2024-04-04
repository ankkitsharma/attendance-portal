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

app.post("/api/refresh", (req, res) => {
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
      expiresIn: "60s",
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

//login user
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );
    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    } else {
      const accessToken = generateAccessToken(user.rows[0]);
      const refreshToken = generateRefreshToken(user.rows[0]);
      refreshTokens.push(refreshToken);
      res.status(200).json({
        message: "Login successful",
        user: user.rows[0],
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
});

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
        message: "User already exists",
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

//delete user
app.delete("/api/users/:userId", verify, async (req, res) => {
  try {
    console.log(typeof req.user.id);
    console.log(typeof req.params.userId);
    if (req.user.id == req.params.userId || req.user.isAdmin) {
      res.status(200).json("User has been deleted...");
    } else {
      res.status(403).json("You are not allowed to delete this user!");
    }
  } catch (error) {
    console.err("Error deleting user:", error);
  }
});

// logout user
app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json({
    message: "Logged out successfully",
  });
});

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
