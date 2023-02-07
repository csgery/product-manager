import React, { useEffect, useState, useContext } from "react";
import { UITextContext } from "./TranslationWrapper";
import { IconModeContext } from "../App";
import { Store } from "react-notifications-component";
import Dropdown from "react-bootstrap/Dropdown";
import { BsGear } from "react-icons/bs";
import { createNotification, validateProductInput } from "../helper/helper";

function Searchbar({
  setItemsToView,
  allItemsFromDB,
  searchbarBind /*product or user*/,
}) {
  const [searchbarValue, setSearchbarValue] = useState("");
  const [searchTypeBTN, setSearchTypeBTN] = useState(() => {
    if (searchbarBind === "product") {
      return localStorage.getItem("searchTypeProductBTN") || "wholeWord";
    } else if (searchbarBind === "user") {
      return localStorage.getItem("searchTypeUserBTN") || "wholeWord";
    }
  });
  const [searchInBTN, setSearchInBTN] = useState(() => {
    if (searchbarBind === "product") {
      return localStorage.getItem("searchInProductBTN") || "name";
    } else if (searchbarBind === "user") {
      return localStorage.getItem("searchInUserBTN") || "username";
    }
  });

  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);

  useEffect(() => {
    if (allItemsFromDB) {
      // After a product is deleted clear the searchbar
      setSearchbarValue("");
    }
  }, [allItemsFromDB]);

  useEffect(() => {
    if (allItemsFromDB) {
      handleSearchChange(searchbarValue);
    }
  }, [searchTypeBTN, searchInBTN]);

  const handleSearchTypeBTNClick = (e) => {
    e.preventDefault(); // prevents changing to the URL of the link href
    e.stopPropagation(); // prevents the link click from bubbling
    if (searchbarBind === "product") {
      localStorage.setItem("searchTypeProductBTN", e.target.value);
    } else if (searchbarBind === "user") {
      localStorage.setItem("searchTypeUserBTN", e.target.value);
    }
    setSearchTypeBTN(e.target.value);
  };

  const handleSearchInBTNClick = (e) => {
    e.preventDefault(); // prevents changing to the URL of the link href
    e.stopPropagation(); // prevents the link click from bubbling
    if (searchbarBind === "product") {
      localStorage.setItem("searchInProductBTN", e.target.value);
    } else if (searchbarBind === "user") {
      localStorage.setItem("searchInUserBTN", e.target.value);
    }
    setSearchInBTN(e.target.value);
  };

  const handleSearchChange = (value) => {
    // characters that cause regex error: [ ] \ ( ) * +
    value = validateProductInput(value, UIText);
    setSearchbarValue(() => value);
    const fieldToSearchIn = searchInBTN; // later implement: name or shortId

    if (value === "") {
      setItemsToView(allItemsFromDB);
    } else if (value) {
      // if whole text vs if pattern matching (from a button)

      const regex =
        searchTypeBTN === "wholeWord"
          ? new RegExp(`^${value}`)
          : new RegExp(`${value}`);

      const searchedData = allItemsFromDB.filter((item) =>
        regex.test(item[fieldToSearchIn].toLowerCase())
      );
      if (searchedData) {
        setItemsToView(searchedData);
      } else {
        setItemsToView([]);
      }
    }
  };

  return (
    <div className="d-flex" role="search">
      <input
        className="form-control me-2 ms-1"
        type="search"
        placeholder={UIText.search}
        aria-label={UIText.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        value={searchbarValue}
      />
      <Dropdown>
        <Dropdown.Toggle variant="light" id="dropdown-basic">
          {iconMode ? (
            <BsGear style={{ fontSize: "2rem" }} />
          ) : (
            UIText.searchbarSettings
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="lightmode">
          <Dropdown.Item className="lightmode">
            <button
              className={
                (searchTypeBTN === "wholeWord"
                  ? "btn btn-light "
                  : "btn btn-outline-light ") + "me-1"
              }
              value="wholeWord"
              onClick={(e) => handleSearchTypeBTNClick(e)}
            >
              {UIText.wholeWordButtonText}
            </button>
            <button
              className={
                searchTypeBTN === "matchCase"
                  ? "btn btn-light "
                  : "btn btn-outline-light "
              }
              value="matchCase"
              onClick={(e) => handleSearchTypeBTNClick(e)}
            >
              {UIText.matchCaseButtonText}
            </button>
          </Dropdown.Item>
          <Dropdown.Item className="lightmode">
            <button
              className={
                (searchInBTN === "name" || searchInBTN === "username"
                  ? "btn btn-light "
                  : "btn btn-outline-light ") + "me-1"
              }
              value={searchbarBind === "product" ? "name" : "username"}
              onClick={(e) => handleSearchInBTNClick(e)}
            >
              {searchbarBind === "product" ? UIText.name : UIText.username}
            </button>
            <button
              className={
                searchInBTN === "shortId" || searchInBTN === "email"
                  ? "btn btn-light "
                  : "btn btn-outline-light "
              }
              value={searchbarBind === "product" ? "shortId" : "email"}
              onClick={(e) => handleSearchInBTNClick(e)}
            >
              {searchbarBind === "product" ? UIText.shortID : "Email"}
            </button>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default Searchbar;
