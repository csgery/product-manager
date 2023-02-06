import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function LogoutPage({
  setAccessTokenStorage,
  setRefreshTokenStorage,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    setAccessTokenStorage(null);
    setRefreshTokenStorage(null);
    navigate("/login", { replace: true });
    // navigate(0);
  });
  return <></>;
}
