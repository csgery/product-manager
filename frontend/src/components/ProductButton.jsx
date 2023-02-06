import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";

export default function ProductButton({ type = "edit" }) {
  let icon;
  if (type === "edit") {
    icon = faPenToSquare;
  } else if (type === "remove") {
    icon = faTrashCan;
  }
  return (
    <button
      type="button"
      className="btn btn-light p-2 "
      // data-bs-toggle="modal"
      // data-bs-target="#createProductModal"
    >
      <FontAwesomeIcon icon={icon} style={{ fontSize: "1.4rem" }} />
    </button>
  );
}
