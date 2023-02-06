import React, { useEffect, useState, useContext } from "react";
import { UITextContext } from "./TranslationWrapper";

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
    setSearchbarValue(() => value);
    const fieldToSearchIn = "name"; // later implement: name or shortId
    // console.log("value:", value);
    // console.log("searchTypeBTN:", searchTypeBTN);
    if (value === "") {
      setItemsToView(allItemsFromDB);
    } else if (value) {
      // if whole text vs if pattern matching (from a button)
      // const searchedData = data.validProducts.filter((item) =>
      //   item.name./*toLowerCase().*/ includes(value)
      // );
      const regex =
        searchTypeBTN === "wholeWord"
          ? new RegExp(`^${value}`)
          : new RegExp(`${value}`);
      // console.log("regex", regex);
      // console.log("searchbarValue state", searchbarValue);
      const searchedData = allItemsFromDB.filter((item) =>
        regex.test(item[fieldToSearchIn].toLowerCase())
      );
      // console.log("searchedData:", searchedData);
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
