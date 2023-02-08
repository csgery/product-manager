import React, { useEffect } from "react";
import { auth } from "../helper/helper";
import { useNavigate } from "react-router-dom";

function BadAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate("/login", { replace: true });
    }
  });

  return <>DONT HAVE PERMS</>;
}

export default BadAuth;
