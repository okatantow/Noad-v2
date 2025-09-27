import React, { useState } from "react";
import UsersList from "./UsersList";
import UserAddUpdate from "./UserAddUpdate";

const UserPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("list");
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

  return (
    <>
      {currentPage === "list" && (
        <UsersList
          setCurrentPage={setCurrentPage}
          setSelectedUserId={setSelectedUserId}
        />
      )}

      {currentPage === "add" && (
        <UserAddUpdate
          userId={selectedUserId}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  );
};

export default UserPage;