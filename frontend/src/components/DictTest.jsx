import React, { useState } from "react";
import { getDict, createDict } from "../helper/helper";

function DictTest() {
  const [getHash, setGetHash] = useState("");
  const [getLang, setGetLang] = useState("");
  const [getResult, setGetResult] = useState("");

  const [setHash, setSetHash] = useState("");
  const [setLang, setSetLang] = useState("");
  const [setText, setSetText] = useState("");
  const [setResult, setSetResult] = useState("");

  const handleGet = async () => {
    if (isNaN(Number(getHash))) {
      alert("ERROR: The hash must be a number!");
      console.log("ERROR: The hash must be a number!");
    } else {
      setGetResult(await getDict({ hash: getHash, lang: getLang }));
    }
  };
  const handleCreate = async () => {
    if (isNaN(Number(setHash))) {
      alert("ERROR: The hash must be a number!");
      console.log("ERROR: The hash must be a number!");
    } else {
      setSetResult(
        await createDict({ hash: setHash, lang: setLang, text: setText })
      );
    }
  };
  return (
    <>
      <div className="mt-2">
        <div>
          <label htmlFor="hash">Hash</label>
          <input
            type="text"
            name="hash"
            onChange={(e) => setGetHash(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="lang">Lang</label>
          <input
            type="text"
            name="lang"
            onChange={(e) => setGetLang(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleGet}>
          Get
        </button>
        {getResult && (
          <div>
            <h3>Result: {getResult.data.getDict}</h3>
          </div>
        )}
      </div>
      <div className="mt-5">
        <div>
          <label htmlFor="hash">Hash</label>
          <input
            type="text"
            name="hash"
            onChange={(e) => setSetHash(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="lang">Lang</label>
          <input
            type="text"
            name="lang"
            onChange={(e) => setSetLang(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="text">Text</label>
          <input
            type="text"
            name="text"
            onChange={(e) => setSetText(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          Create
        </button>
        {setResult && (
          <div>
            <h3>Result: {setResult.data.createDict}</h3>
          </div>
        )}
      </div>
    </>
  );
}

export default DictTest;
