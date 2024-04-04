import React, { useState } from "react";
import LogIn from "../components/LogIn";
import Register from "../components/Register";
import styles from "./SignIn.module.css";

export default function signIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [select, setSelect] = useState("login");
  return (
    <div className={styles.signIn}>
      {isLoggedIn ? (
        <h1 className={styles.loggedIn}>You are logged in</h1>
      ) : (
        <h1>You are not logged in</h1>
      )}
      <div className={styles.buttons}>
        <button className={styles.button} onClick={() => setSelect("login")}>
          Log in
        </button>{" "}
        or{" "}
        <button className={styles.button} onClick={() => setSelect("register")}>
          Register
        </button>
      </div>
      {select === "login" ? <LogIn /> : <Register />}
    </div>
  );
}
