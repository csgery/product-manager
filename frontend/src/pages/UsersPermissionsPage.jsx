import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_VALIDUSERS } from "../queries/userQueries";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import {
  auth,
  addDependedPermissions,
  removeDependedPermissions,
} from "../helper/helper";
import { Spinner } from "react-bootstrap";
import useCustomError from "../helper/hooks/useCustomError";

function UsersPermissionsPage() {
  let { data, loading, error } = useQuery(GET_VALIDUSERS);

  const [users, setUsers] = useState([]);

  const [editMode, setEditMode] = useState(false);

  const [handleCustomError] = useCustomError();

  useEffect(() => {
    if (data?.validUsers) setUsers(data.validUsers);
  }, [data?.validUsers]);

  const formatRight = (right) => {
    if (right.includes("_")) {
      const result = right.split("_");
      if (result[0].toLowerCase().includes("updateuser")) {
        return result[0].toLowerCase().replace("updateuser", "updateperms");
      }
      return result[0].toLowerCase().replace("read", "");
    } else {
      return right.toLowerCase();
    }
  };

  const productPermsCount = Object.keys(auth.PERMS).filter((item) =>
    item.toLowerCase().includes("product")
  ).length;
  const usersPermsCount = Object.keys(auth.PERMS).filter(
    (item) =>
      item.toLowerCase().includes("user") ||
      item.toLowerCase().includes("protected")
  ).length;

  const productPermsReadCount = Object.keys(auth.PERMS).filter(
    (item) =>
      item.toLowerCase().includes("product") &&
      item.toLowerCase().includes("read")
  ).length;

  const usersPermsReadCount = Object.keys(auth.PERMS).filter(
    (item) =>
      item.toLowerCase().includes("user") && item.toLowerCase().includes("read")
  ).length;

  // console.log(Object.keys(auth.PERMS).length);
  // console.log(productPermsCount);
  // console.log(usersPermsCount);
  // console.log("read in products:", productPermsReadCount);
  // console.log("read in users:", usersPermsReadCount);

  //const handleClick = (e) => {};

  const handleChange = (e) => {
    //console.log(`user: ${e.target.value} perm: ${e.target.name}`);
    console.log("users:", users);
    const userIdFromEdit = e.target.value;
    const permFromEdit = e.target.name;
    let usersDeepCopy = structuredClone(users);
    console.log("usersDeepCopy:", usersDeepCopy);
    let user = usersDeepCopy.find((user) => user.id === userIdFromEdit);

    console.log("user BEFORE click:", user);
    console.log(user);

    if (user.permissions.includes(permFromEdit)) {
      // console.log(
      //   validatePermissions(
      //     user.permissions.filter((perm) => perm !== permFromEdit)
      //   )
      // );
      user.permissions = removeDependedPermissions(
        user.permissions.filter((perm) => perm !== permFromEdit)
      );
    } else {
      user.permissions = addDependedPermissions([
        ...user.permissions,
        permFromEdit,
      ]);
    }
    setUsers(usersDeepCopy);
    console.log("user after click:", user);
  };

  if (loading) return <Spinner />;

  if (error) return handleCustomError(error);

  if (users && !loading && !error)
    return (
      <>
        <Button onClick={() => setEditMode((oldValue) => !oldValue)}>
          Edit
        </Button>
        <Table responsive>
          <thead>
            <tr>
              <th></th>
              <th
                colSpan={productPermsCount}
                className={"bg-light text-center"}
              >
                products
              </th>
              <th
                colSpan={usersPermsCount}
                className={"bg-success text-center"}
              >
                users
              </th>
            </tr>
            <tr>
              <th></th>
              <th
                colSpan={productPermsReadCount}
                className={"bg-primary text-center"}
              >
                read
              </th>
              <th
                colSpan={productPermsCount - productPermsReadCount}
                className={"bg-secondary text-center"}
              >
                modify
              </th>
              <th
                colSpan={usersPermsReadCount}
                className={"bg-primary text-center"}
              >
                read
              </th>
              <th
                colSpan={usersPermsCount - usersPermsReadCount - 1}
                className={"bg-secondary text-center"}
              >
                modify
              </th>
            </tr>
            <tr>
              <th>#</th>
              {Object.keys(auth.PERMS).map((item, index) => (
                <th key={index}>{formatRight(item)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((validUser, i) => {
              console.log(validUser);
              return (
                <tr>
                  <td className={"text-center"}>{validUser.username}</td>
                  {Object.keys(auth.PERMS).map((permKey) => {
                    return (
                      <td
                        className={"text-center"}
                        //onClick={(e) => handleClick(e)}
                      >
                        <input
                          type="checkbox"
                          // defaultChecked={validUser.permissions.includes(
                          //   auth.PERMS[permKey]
                          // )}
                          name={auth.PERMS[permKey]}
                          value={validUser.id}
                          onChange={(e) => handleChange(e)}
                          disabled={!editMode}
                          checked={validUser.permissions.includes(
                            auth.PERMS[permKey]
                          )}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );
}

export default UsersPermissionsPage;
