import React, { useState } from "react";
import { Form } from "react-router-dom";
import styles from "./login.module.css";
import axios from "axios";

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        username,
        password,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error.response.data);
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
