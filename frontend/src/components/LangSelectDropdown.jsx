import React, { useContext, useCallback, useState, useEffect } from "react";
import darkModeToggleLogo from "../assets/dark-mode-toggle-icon.svg";
import lightModeToggleLogo from "../assets/light-mode-toggle-icon.svg";
import { DarkModeContext, LangContext } from "../App";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { UITextContext } from "./TranslationWrapper";

function LangSelectDropdown({ handleLangChange }) {
  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);
  // const lang = useContext(LangContext);
  // const getMoreText = useCallback(async (textsObject) => {
  //   return await translateMore(textsObject, lang);
  // });
  // const [UIText, setUIText] = useState({});

  // useEffect(() => {
  //   const UITextToTranslate = {
  //     language: "Language",
  //   };
  //   const fetchMoreData = async () => {
  //     console.log(await getMoreText(UITextToTranslate));
  //     return await getMoreText(UITextToTranslate);
  //   };
  //   fetchMoreData().then((res) => setUIText(res));
  // }, [lang]);

  return (
    <NavDropdown title={UIText.language} id="collasible-nav-dropdown">
      <NavDropdown.Item
        onClick={() => handleLangChange("en")}
        className="navlink"
      >
        en
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={() => handleLangChange("hu")}
        className="navlink"
      >
        hu
      </NavDropdown.Item>
    </NavDropdown>
  );
}

export default LangSelectDropdown;
