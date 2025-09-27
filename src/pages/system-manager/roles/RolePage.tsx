import React, { useState } from "react";
import RolesList from "./RolesList";
import RoleAddUpdate from "./RoleAddUpdate";

const RolePage: React.FC = () => {
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

export default RolePage;
