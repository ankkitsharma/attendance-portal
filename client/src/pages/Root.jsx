import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/Usercontext";
import styles from "./Root.module.css";
import DatePicker from "react-datepicker";
import "../../node_modules/react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function root() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [todayAttendances, setTodayAttendances] = useState([]);
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

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        };
        const response = await axiosJWT.get(
          `http://localhost:3000/api/attendance/${user.user.id}`,
          config
        );
        const dates = response.data.attendances.map((attendance) => {
          return new Date(attendance.date);
        });
        setAttendances(dates);
        // console.log(dates);
        // console.log(response.data.attendances);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAttendances();
  }, [axiosJWT, user]);

  return (
    <div className={styles.root}>
      <div className={styles.title}>
        {user ? (
          "Hello " + user.user.username
        ) : (
          <span>
            You are not logged in{" "}
            <button onClick={() => navigate("/signIn")}>Log in</button>
          </span>
        )}
      </div>
      <div className={styles.content}>
        <DatePicker inline selected={new Date()} highlightDates={attendances} />
        <div className={styles.attendance}>
          <div className={styles.attendanceTitle}>Set Attendance for today</div>
          <button className={styles.attendanceButton}>
            I am Present today
          </button>
        </div>
      </div>
    </div>
  );
}
