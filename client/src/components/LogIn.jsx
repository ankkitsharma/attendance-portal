import React, { useState, useContext } from "react";
import { Form } from "react-router-dom";
import styles from "./login.module.css";
import axios from "axios";
import UserContext from "../context/Usercontext";
import { useNavigate } from "react-router-dom";

export default function LogIn() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post(
        "https://attendance-portal-server-nine.vercel.app/api/login",
        {
          username,
          password,
        }
      );
      console.log(response.data);
      response.data.user && setUser(response.data);
      // setUsername("");
      // setPassword("");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.signIn}>
      <h2 className={styles.title}>LogIn</h2>
      <form className={styles.form}>
        <label htmlFor="username" className={styles.label}>
          Username
        </label>
        <input
          type="username"
          id="username"
          name="username"
          required
          className={styles.input}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className={styles.input}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button onClick={handleSubmit} className={styles.button}>
          LogIn
        </button>
      </form>
    </div>
  );
}
