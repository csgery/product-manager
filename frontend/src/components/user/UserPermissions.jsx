export default function UserPermissions({ permissions }) {
  return (
    <>
      Permissions:
      {permissions && permissions.length > 0 && (
        <ul>
          {/* {console.log(permissions)} */}
          {permissions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {(!permissions || permissions.length < 1) && <h3>No Permissions</h3>}
    </>
  );
}
