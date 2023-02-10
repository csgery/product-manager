import React, { useContext } from "react";
import { DarkModeContext } from "../App";

export default function SpinnerCustom() {
  const darkMode = useContext(DarkModeContext);
  return (
    <div
      className={
        "d-flex justify-content-center mx-auto " + (darkMode && "text-light ")
      }
    >
      <div className="spinner-border " role="status">
        <span className="sr-only"></span>
      </div>
    </div>
  );
}
