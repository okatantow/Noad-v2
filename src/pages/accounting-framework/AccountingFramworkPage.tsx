
import { useState } from "react";
import  Breadcrumb  from "../../components/layout/Breadcrumb";
import ChartOfAccountPage from "./chart-of-accounts/ChartOfAccountPage";
import { withPermissions } from '../../hooks/withPermissions';
import { usePermissions } from '../../hooks/usePermissions';


 function AccountFrameworkPage() {
  const { hasPermission, hasAnyPermission } = usePermissions();

   const [currentPage, setCurrentPage] = useState("chart of accounts");

  const toggleCurrentPage = (page:any) => {
    setCurrentPage(page);
  
  };
  return (
    <div className="min-h-screen  text-black font-mono px-8">

      <div className='flex items-start space-x-8'>
     
      </div>
      <Breadcrumb items={["Accounting Framework", "Chart of Accounts"]} newPage={currentPage} />
      <div className="bg-white min-h-[500px] md:flex gap-3">
          <div className=" md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3" 
          // style={{borderRight:"1px solid #4b54bb"}}
          >
            <div className="space-y-3 pt-6  pr-4 grid grid-cols-1 gap-1  my-scrollbar " >
            
               {hasAnyPermission(['Add Chart Account','Update Chart Account','Delete Chart Account','View Chart Accounts']) && <>
              <div
                style={{border:"1px solid #5ac4fe"}}
                onClick={() => toggleCurrentPage("chart of accounts")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "chart of accounts"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Chart of Accounts: </h2>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Manage Financial Accounts
                </p>
              </div>
               </>}
                {hasAnyPermission(['Add Role','Update Role','Delete Role','View Roles']) && <>
              <div
                style={{border:"1px solid #5ac4fe"}}
                onClick={() => toggleCurrentPage("roles")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "roles"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Roles: </h2>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Create and manage user permissions
                </p>
              </div>
                </>}
                 {hasAnyPermission(['Open Session','Close Session']) && <>
              <div
                style={{border:"1px solid #5ac4fe"}}
                onClick={() => toggleCurrentPage("session")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "session"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Bank Session: </h2>
                </div>
                
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Current Session : 23/08/2025
                </p>
              </div>
                </>}
              
              


             


            </div>
          </div>
          <div  className="w-3/4 my-black-bg bg-white md:border-l border-blue-500 sm:p-5  rounded-l-3xl">
          {/* <Example/> */}
           
           {currentPage == "chart of accounts" && <ChartOfAccountPage />}
            
          </div>
        
    </div>
    </div>
  );
}

export default withPermissions(AccountFrameworkPage, ['Update General','Add Chart Account','Add Chart Account','Update Chart Account','Delete Chart Account','View Chart Accounts','Add Role','Update Role','Delete Role','View Roles','Open Session','Close Session']);