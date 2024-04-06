import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/Usercontext";
import styles from "./Root.module.css";

export default function root() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  return (
    <div className={styles.title}>
      Hello{" "}
      {user ? (
        user.user.username
      ) : (
        <div>
          You are not logged in{" "}
          <button onClick={() => navigate("/signIn")}>Log in</button>
        </div>
      )}
    </div>
  );
}
