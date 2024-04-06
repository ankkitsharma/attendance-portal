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
  const [todayAttendances, setTodayAttendances] = useState(false);
  const axiosJWT = axios.create();
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");

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
    if (user?.user.isadmin) {
      getAllUsers();
    } else {
      fetchAttendances();
    }
  }, [user]);

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

      const today = new Date();
      const todayAttendance = dates.some(
        (date) => date.toDateString() === today.toDateString()
      );
      setTodayAttendances(todayAttendance);
    } catch (error) {
      console.error(error);
    }
  };

  const setAttendanceForToday = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      };
      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 10);
      const response = await axiosJWT.post(
        `http://localhost:3000/api/attendance/${user.user.id}`,
        {
          date: formattedDate,
        },
        config
      );
      console.log(response.data);
      setTodayAttendances(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllUsers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      };
      const response = await axiosJWT.get(
        "http://localhost:3000/api/users",
        config
      );
      console.log(response.data.users);
      setUsers(response.data.users);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectUser = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      };
      // const id = userId;
      const response = await axiosJWT.get(
        `http://localhost:3000/api/attendance/${id}`,
        config
      );
      const dates = response.data.attendances.map((attendance) => {
        return new Date(attendance.date);
      });
      setAttendances(dates);
      console.log("dates for the selected user", dates);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.title}>
        {user ? (
          user.user.isadmin ? (
            "Hello Admin " + user.user.username
          ) : (
            "Hello " + user.user.username
          )
        ) : (
          <span>
            You are not logged in{" "}
            <button onClick={() => navigate("/signIn")}>Log in</button>
          </span>
        )}
      </div>
      {!user?.user.isadmin ? (
        <div className={styles.content}>
          <DatePicker
            inline
            selected={todayAttendances ? new Date() : null}
            highlightDates={attendances}
          />
          <div className={styles.attendance}>
            <div className={styles.attendanceTitle}>
              {todayAttendances
                ? "You have set today's attendance"
                : "Set your attendance"}
            </div>
            <button
              onClick={!todayAttendances ? setAttendanceForToday : null}
              className={
                todayAttendances
                  ? styles.attendanceButtonActive +
                    " " +
                    styles.attendanceButton
                  : styles.attendanceButton
              }
            >
              {todayAttendances ? (
                <div>I am Present today</div>
              ) : (
                <div>Click Here</div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.userSelect}>
            <label htmlFor="user-select">
              Select a user for showing their attendance:
            </label>
            <select
              id="user-select"
              onChange={(event) => {
                setUserId(event.target.value);
                const option = event.target.selectedOptions[0];
                if (option) {
                  const userId = option.value;
                  handleSelectUser(userId);
                }
              }}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <DatePicker
            inline
            disabledKeyboardNavigation
            highlightDates={[...attendances]}
          />
        </div>
      )}
    </div>
  );
}
