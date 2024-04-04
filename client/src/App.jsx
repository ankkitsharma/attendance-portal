import React, { useEffect, useState } from "react";
import styles from "./App.module.css";
import { Navbar } from "./components/Navbar";
import { Outlet } from "react-router-dom";
import UserContext from "./context/Usercontext";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) {
      console.log(user);
      window.localStorage.setItem("user", JSON.stringify(user));
    } else {
      setUser(JSON.parse(window.localStorage.getItem("user")));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Navbar />
      <Outlet />
    </UserContext.Provider>
  );
}

export default App;
