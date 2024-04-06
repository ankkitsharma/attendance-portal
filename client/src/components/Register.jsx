import React, { useState } from "react";
import { Form } from "react-router-dom";
import styles from "./login.module.css";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post(
        "https://attendance-portal-server-nine.vercel.app/api/register",
        {
          username,
          password,
          isAdmin,
        }
      );
      console.log(response.data);
      alert("Registered successfully, Please log in");
      setUsername("");
      setPassword("");
      setIsAdmin(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles.signIn}>
      <h2 className={styles.title}>Register</h2>
      <form className={styles.form}>
        <label htmlFor="username" className={styles.label}>
          Username
        </label>
        <input
          type="username"
          id="username"
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
          required
          className={styles.input}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <label htmlFor="isAdmin" className={styles.label}>
          Are you Admin?
        </label>
        <select
          id="isAdmin"
          value={isAdmin}
          onChange={(event) => setIsAdmin(event.target.value)}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <button onClick={handleSubmit} className={styles.button}>
          Register
        </button>
      </form>
    </div>
  );
}
