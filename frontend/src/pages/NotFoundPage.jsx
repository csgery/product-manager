import React, { useContext } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { UITextContext } from "../components/TranslationWrapper";

export default function NotFoundPage() {
  const UIText = useContext(UITextContext);
  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5">
      <FaExclamationTriangle className="text-danger" size="5em" />
      <h1>404</h1>
      <p className="lead">{UIText.pageNotFoundText}</p>
      <Link to="/products" className="btn btn-primary">
        {UIText.goBackBTNText}
      </Link>
    </div>
  );
}
