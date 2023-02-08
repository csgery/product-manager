import { /*React,*/ useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../mutations/userMutations";
import Spinner from "../components/Spinner";
import { auth } from "../helper/helper";

export default function LoginPage({
  setAccessTokenStorage,
  setRefreshTokenStorage,
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signinUser, { error, loading, data }] = useMutation(LOGIN_USER, {
    variables: { email, password },
    onCompleted(data) {
      localStorage.clear();
      localStorage.removeItem("accesstoken");
      localStorage.removeItem("refreshtoken");
      localStorage.setItem("accesstoken", data.login[0]);
      localStorage.setItem("refreshtoken", data.login[1]);
      setAccessTokenStorage(localStorage.getItem("accesstoken"));
      setRefreshTokenStorage(localStorage.getItem("refreshtoken"));

      const id = auth.getUserId();
      navigate(`/viewer/${id}`, { replace: true });
    },
  });

  // useEffect();

  if (loading) return <Spinner />;

  const handleSubmit = (e) => {
    e.preventDefault();

    // because every request has checked at backend before gave to the backend's resolvers
    // the tokens'll be checked too
    // to prevent backends tokenvalidation errors if the token is invalid(if someone modified it inside localstorage)
    // remove everything before send login request
    localStorage.clear();
    setAccessTokenStorage(null);
    setRefreshTokenStorage(null);

    signinUser(email, password);
  };

  return (
    <div className="card">
      {error && <div className="red card-panel">{error.message}</div>}
      <h5>Login!!</h5>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn #673ab7 deep-purple" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
