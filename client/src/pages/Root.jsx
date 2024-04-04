import React, { useContext, useEffect } from "react";
import UserContext from "../context/Usercontext";

export default function root() {
  const { user } = useContext(UserContext);
  useEffect(() => {
    console.log("Inside Root: ", user);
  }, []);
  return <div>Hello {user?.user.username}</div>;
}
