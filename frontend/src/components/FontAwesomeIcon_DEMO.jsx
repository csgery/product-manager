import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

export default function FAIDemo() {
  return (
    <div>
      <FontAwesomeIcon
        icon={faEnvelope}
        style={{ color: "red", background: "black" }}
        className="mt-2"
      />
      OK
    </div>
  );
}
