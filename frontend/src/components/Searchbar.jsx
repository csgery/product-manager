import React, { useEffect, useState, useContext } from "react";
import { UITextContext } from "./TranslationWrapper";
import { IconModeContext } from "../App";
import { Store } from "react-notifications-component";
import Dropdown from "react-bootstrap/Dropdown";
import { BsGear } from "react-icons/bs";
import { createNotification, validateInput } from "../helper/helper";

function Searchbar({ setItemsToView, allItemsFromDB }) {
  const [searchbarValue, setSearchbarValue] = useState("");
  const [searchTypeBTN, setSearchTypeBTN] = useState(
    localStorage.getItem("searchTypeBTN") || "wholeWord"
  );
  const [searchInBTN, setSearchInBTN] = useState(
    localStorage.getItem("searchInBTN") || "name"
  );

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
    localStorage.setItem("searchTypeBTN", e.target.value);
    setSearchTypeBTN(e.target.value);
  };

  const handleSearchInBTNClick = (e) => {
    e.preventDefault(); // prevents changing to the URL of the link href
    e.stopPropagation(); // prevents the link click from bubbling
    localStorage.setItem("searchInBTN", e.target.value);
    setSearchInBTN(e.target.value);
  };

  const handleSearchChange = (value) => {
    // characters that cause regex error: [ ] \ ( ) * +
    value = validateInput(value, UIText);
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
                (searchInBTN === "name"
                  ? "btn btn-light "
                  : "btn btn-outline-light ") + "me-1"
              }
              value="name"
              onClick={(e) => handleSearchInBTNClick(e)}
            >
              {UIText.name}
            </button>
            <button
              className={
                searchInBTN === "shortId"
                  ? "btn btn-light "
                  : "btn btn-outline-light "
              }
              value="shortId"
              onClick={(e) => handleSearchInBTNClick(e)}
            >
              {UIText.shortID}
            </button>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default Searchbar;
