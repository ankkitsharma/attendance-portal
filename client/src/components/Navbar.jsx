import React from "react";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.logo}>Attendance Portal</h1>
      <ul className={styles.links}>
        <li className={styles.link}>About</li>
        <li className={styles.link}>User</li>
      </ul>
    </nav>
  );
};
