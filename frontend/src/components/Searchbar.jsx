import React, { useEffect, useState, useContext } from "react";
import { UITextContext } from "./TranslationWrapper";
import { Store } from "react-notifications-component";

function Searchbar({ setItemsToView, allItemsFromDB }) {
  const [searchbarValue, setSearchbarValue] = useState("");
  const [searchTypeBTN, setSearchTypeBTN] = useState(
    localStorage.getItem("searchTypeBTN") || "wholeWord"
  );

  const UIText = useContext(UITextContext);

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
  }, [searchTypeBTN]);

  const handleSearchTypeBTNClick = (e) => {
    localStorage.setItem("searchTypeBTN", e.target.value);
    setSearchTypeBTN(e.target.value);
  };

  const handleSearchChange = (value) => {
    // characters that cause regex error: [ ] \ ( ) * +
    const validationPattern = new RegExp(/[\[\]\\\(\)*+]/gi);
    if (validationPattern.test(value)) {
      const wrongCharacter = value[value.length - 1];
      Store.addNotification({
        title: `${UIText.wrongCharacter}: ` + wrongCharacter,
        message: `${UIText.wrongCharacters}: ` + "[ ] ( ) * +",
        type: "warning",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
      value = value.replace(validationPattern, "");
    }
    setSearchbarValue(() => value);
    const fieldToSearchIn = "name"; // later implement: name or shortId

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
        placeholder="Search"
        aria-label="Search"
        onChange={(e) => handleSearchChange(e.target.value)}
        value={searchbarValue}
      />
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
    </div>
  );
}

export default Searchbar;
