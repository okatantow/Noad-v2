import { useState } from "react";
import Breadcrumb from "../../components/layout/Breadcrumb";
import { withPermissions } from '../../hooks/withPermissions';
import { usePermissions } from '../../hooks/usePermissions';
import CustomerAddUpdate from "./customer-manager/CustomerAddUpdate";
import CustomerAccounts from "./accounts/CustomerAccounts";
import AccountList from "./accounts/AccountList";
import CustomerList from "./customer-manager/CustomerList";
import { User, List, Users } from "lucide-react";

function CustomerDetailPage() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const [currentPage, setCurrentPage] = useState("customer details");

  const toggleCurrentPage = (page: any) => {
    setCurrentPage(page);

  };
  return (
    <div className="min-h-screen  text-black font-mono px-8">

      <div className='flex items-start space-x-8'>

      </div>
      <Breadcrumb items={["Customer", "Details"]} newPage={currentPage} />
      <div className="bg-white min-h-[500px] md:flex gap-3">
        <div className=" md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3"
        // style={{borderRight:"1px solid #4b54bb"}}
        >
          <div className="space-y-3 pt-6  pr-4 grid grid-cols-1 gap-1  my-scrollbar " >

            {hasAnyPermission(['Add Chart Account', 'Update Chart Account', 'Delete Chart Account', 'View Chart Accounts']) && <>
              <div
                style={{ border: "1px solid #5ac4fe" }}
                onClick={() => toggleCurrentPage("customer details")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${currentPage == "customer details"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                  }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <User
                    size={18}
                  />
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Customer Details: </h2>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Add Or Update A Customer
                </p>
              </div>
            </>}
            {hasAnyPermission(['Add Role', 'Update Role', 'Delete Role', 'View Roles']) && <>
              <div
                style={{ border: "1px solid #5ac4fe" }}
                onClick={() => toggleCurrentPage("account list")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${currentPage == "account list"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                  }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <List
                    size={18}
                  />
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}> Account Lists: </h2>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                 Lists of all accounts
                </p>
              </div>
            </>}
            {hasAnyPermission(['Add Role', 'Update Role', 'Delete Role', 'View Roles']) && <>
              <div
                style={{ border: "1px solid #5ac4fe" }}
                onClick={() => toggleCurrentPage("customer list")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${currentPage == "customer list"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                  }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <Users
                    size={18}
                  />
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}> Customer List: </h2>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  List Of Customers
                </p>
              </div>
            </>}
          </div>
         
        </div>
        <div className="w-3/4 my-black-bg bg-white md:border-l border-blue-500 sm:p-5  rounded-l-3xl">
          {/* <Example/> */}

          {currentPage == "customer details" && <CustomerAddUpdate />}
          {currentPage == "account list" && <AccountList />}
          {currentPage == "customer list" && <CustomerList />}
         

        </div>

      </div>
    </div>
  );
}

export default withPermissions(CustomerDetailPage, ['Update General', 'Add Chart Account', 'Add Chart Account', 'Update Chart Account', 'Delete Chart Account', 'View Chart Accounts', 'Add Role', 'Update Role', 'Delete Role', 'View Roles', 'Open Session', 'Close Session']);