import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { VIEWER } from "../queries/userQueries";
import Spinner from "../components/Spinner";
import UserPermissions from "../components/user/UserPermissions";

export default function ViewerPage() {
  const { id } = useParams();

  // if (!id) {
  //   return <></>;
  // }

  const { loading, error, data } = useQuery(VIEWER, {
    variables: { id },
  });

  if (loading) return <Spinner />;

  if (error) return <div>Something went wrong {error.message}</div>;

  //TODO: the viewerpage and the admin's' user checking page inside the users page should be the same so it is a good idea to use the same component like UserData

  return (
    !loading &&
    !error &&
    data && (
      <>
        {/* {console.log(data)} */}
        <h1>Username: {data.viewer.username}</h1>
        <h3>
          Registered at:{" "}
          {new Date(Number(data.viewer.createdAt)).toDateString()}
        </h3>
        <UserPermissions permissions={data.viewer.permissions} />
      </>
    )
  );
}
