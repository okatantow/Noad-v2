import  { useState } from "react";
import RolesList from "./RolesList";
import RoleAddUpdate from "./RoleAddUpdate";
import { withPermissions } from '../../../hooks/withPermissions';
// import { usePermissions } from '../../../hooks/usePermissions';

function RolePage () {
  const [currentPage, setCurrentPage] = useState<string>("list");
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);

  return (
    <>
      {currentPage === "list" && (
        <RolesList
          setCurrentPage={setCurrentPage}
          setSelectedRoleId={setSelectedRoleId}
        />
      )}

      {currentPage === "add" && (
        <RoleAddUpdate
          roleId={selectedRoleId}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  );
};

// export default RolePage;
export default withPermissions(RolePage, ['Add Role','Update Role','Delete Role','View Roles']);
