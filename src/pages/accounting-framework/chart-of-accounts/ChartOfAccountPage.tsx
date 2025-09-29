import React, { useState } from "react";
import ChartsOfAccountsList from "./ChartOfAccountsList";
import ChartOfAccountAddUpdate from "./ChartOfAccountAddUpdate";
import { withPermissions } from '../../../hooks/withPermissions';

const ChartOfAccountsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("list");
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(undefined);

  return (
    <>
      {currentPage === "list" && (
        <ChartsOfAccountsList
          setCurrentPage={setCurrentPage}
          setSelectedAccountId={setSelectedAccountId}
        />
      )}

      {currentPage === "add" && (
        <ChartOfAccountAddUpdate
          accountId={selectedAccountId}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  );
};

export default withPermissions(ChartOfAccountsPage, ['Add Chart Account','Update Chart Account','Delete Chart Account','View Chart Accounts']);