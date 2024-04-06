import React, { useContext } from "react";
import styles from "./Navbar.module.css";
import UserContext from "../context/Usercontext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(async (config) => {
    const currentDate = new Date();
    const decodedToken = jwtDecode(user.accessToken);
    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      const response = await axios.post(
        "http://localhost:3000/api/refresh",
        { token: user.refreshToken },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      config.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
      setUser({
        ...user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
    }
    return config;
  });

  async function handleLogout() {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      };
      const body = { token: user.refreshToken };
      const response = await axiosJWT.post(
        "http://localhost:3000/api/logout",
        body,
        config
      );
      console.log(response.data);
      window.localStorage.removeItem("user");
      setUser(null);
      navigate("/signIn");
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.logo} onClick={() => navigate("/")}>
        Attendance Portal
      </h1>
      <ul className={styles.links}>
        <li className={styles.link}>
          <a href="https://github.com/ankkitsharma/attendance-portal">
            © ankkitsharma 2024
          </a>
        </li>
        {user ? (
          <li className={styles.link} onClick={handleLogout}>
            logout
          </li>
        ) : (
          <li className={styles.link} onClick={() => navigate("/signIn")}>
            login
          </li>
        )}
      </ul>
    </nav>
  );
};
