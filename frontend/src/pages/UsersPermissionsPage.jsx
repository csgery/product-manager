import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_VALIDUSERS } from "../queries/userQueries";
import { UPDATE_PERMISSIONS } from "../mutations/userMutations";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  auth,
  addDependedPermissions,
  removeDependedPermissions,
  createNotification,
} from "../helper/helper";
import { Spinner } from "react-bootstrap";
import useCustomError from "../helper/hooks/useCustomError";
import { UITextContext } from "../components/TranslationWrapper";
import UserUpdatePermsModal from "../components/modals/UserUpdatePermsModal";

function UsersPermissionsPage() {
  const { loading, error, data } = useQuery(GET_VALIDUSERS);

  const UIText = useContext(UITextContext);

  const [
    updatePermissions,
    { data: permsData, loading: permsLoading, error: permsError },
  ] = useMutation(UPDATE_PERMISSIONS, {
    refetchQueries: [GET_VALIDUSERS],
    // variables: { arrayString },
    // update(cache, { data: { data } }) {
    //   const { validProducts } = cache.readQuery({ query: GET_VALIDPRODUCTS });
    //   console.log("addProduct:", addProduct);
    //   cache.writeQuery({
    //     query: GET_VALIDPRODUCTS,
    //     data: { validProducts: [...validProducts, addProduct] },
    //   });
    // },
  });

  const [users, setUsers] = useState([]);

  const [editMode, setEditMode] = useState(false);

  const [handleCustomError] = useCustomError();

  useEffect(() => {
    if (data?.validUsers) setUsers(data.validUsers);
  }, [data?.validUsers, editMode]);

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

  const handleChange = (e) => {
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

  const handlePermsEditCancel = () => {
    setEditMode((oldValue) => !oldValue);
    setUsers([]);
  };

  if (loading) return <Spinner />;

  if (error) {
    handleCustomError(error);
  }

  if (users && !loading && !error)
    return (
      <>
        {!editMode ? (
          <Button onClick={() => setEditMode((oldValue) => !oldValue)}>
            Edit
          </Button>
        ) : (
          <>
            <Button onClick={handlePermsEditCancel}>Cancel</Button>
            <UserUpdatePermsModal
              users={users}
              originalUsers={data.validUsers}
              setEditMode={setEditMode}
              affectedUsers={users.filter(
                (user) =>
                  !JSON.stringify(data.validUsers).includes(
                    JSON.stringify(user)
                  )
              )}
            />
          </>
        )}
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
