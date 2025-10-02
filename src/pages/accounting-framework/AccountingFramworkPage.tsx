import { useState } from "react";
import { BookOpen, Layout } from 'lucide-react'; // Import Lucide icons
import Breadcrumb from "../../components/layout/Breadcrumb";
import ChartOfAccountPage from "./chart-of-accounts/ChartOfAccountPage";
import { withPermissions } from '../../hooks/withPermissions';
import { usePermissions } from '../../hooks/usePermissions';
import NominalLedgerLayout from "./ledger-layout/NominalLedgerLayout";

function AccountFrameworkPage() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const [currentPage, setCurrentPage] = useState("chart of accounts");

  const toggleCurrentPage = (page: any) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen text-black font-mono px-8">
      <div className='flex items-start space-x-8'>
      </div>
      <Breadcrumb items={["Accounting Framework", "Chart of Accounts"]} newPage={currentPage} />
      <div className="bg-white min-h-[500px] md:flex gap-3">
        <div className="md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3">
          <div className="space-y-3 pt-6 pr-4 grid grid-cols-1 gap-1 my-scrollbar">
            {hasAnyPermission(['Add Chart Account', 'Update Chart Account', 'Delete Chart Account', 'View Chart Accounts']) && <>
              <div
                style={{ border: "1px solid #5ac4fe" }}
                onClick={() => toggleCurrentPage("chart of accounts")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                  currentPage == "chart of accounts"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <BookOpen size={18} /> {/* Replaced icon with BookOpen */}
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Chart of Accounts:</h2>
                </div>
                <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                  Manage Financial Accounts
                </p>
              </div>
            </>}
            {hasAnyPermission(['Add Role', 'Update Role', 'Delete Role', 'View Roles']) && <>
              <div
                style={{ border: "1px solid #5ac4fe" }}
                onClick={() => toggleCurrentPage("nominal ledger layout")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                  currentPage == "nominal ledger layout"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <Layout size={18} /> {/* Replaced icon with Layout */}
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Nominal Ledger Layout:</h2>
                </div>
                <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                  Nominal Ledger Layout
                </p>
              </div>
            </>}
            {hasAnyPermission(['Add Role', 'Update Role', 'Delete Role', 'View Roles']) && <>
              <div
                style={{ border: "1px solid #5ac4fe" }}
                onClick={() => toggleCurrentPage("general ledger")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                  currentPage == "general ledger"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <Layout size={18} /> {/* Replaced icon with Layout */}
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>General Ledger:</h2>
                </div>
                <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                  General Ledger
                </p>
              </div>
            </>}
          </div>
        </div>
        <div className="w-3/4 my-black-bg bg-white md:border-l border-blue-500 sm:p-5 rounded-l-3xl">
          {currentPage == "chart of accounts" && <ChartOfAccountPage />}
          {currentPage == "nominal ledger layout" && <NominalLedgerLayout />}
        </div>
      </div>
    </div>
  );
}

export default withPermissions(AccountFrameworkPage, ['Update General', 'Add Chart Account', 'Add Chart Account', 'Update Chart Account', 'Delete Chart Account', 'View Chart Accounts', 'Add Role', 'Update Role', 'Delete Role', 'View Roles', 'Open Session', 'Close Session']);