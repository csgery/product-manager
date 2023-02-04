import React, { useContext, useEffect } from "react";
import darkModeToggleLogo from "../assets/dark-mode-toggle-icon.svg";
import lightModeToggleLogo from "../assets/light-mode-toggle-icon.svg";
import { DarkModeContext } from "../App";

function DarkModeBTNToggle({ handleDarkmodeChange }) {
  const darkMode = useContext(DarkModeContext);
  useEffect(() => {
    console.log("darkmode in toggle:", darkMode);
  });
  return (
    <img
      src={!darkMode ? lightModeToggleLogo : darkModeToggleLogo}
      alt=""
      className="btn darkmode-toggleBTN "
      onClick={handleDarkmodeChange}
    />
  );
}

export default DarkModeBTNToggle;
