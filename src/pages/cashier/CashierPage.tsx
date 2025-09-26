
import  Breadcrumb  from "../../components/layout/Breadcrumb";
import { useState } from "react";

export default function CashierPage() {
  const [currentPage, setCurrentPage] = useState("users");
  
    const toggleCurrentPage = (page:any) => {
      setCurrentPage(page);
    
    };
    return (
      <div className="min-h-screen  text-black font-mono px-8">
  
        <div className='flex items-start space-x-8'>
       
        </div>
        <Breadcrumb items={["System Manager", "Customer Details"]} newPage={currentPage} />
        <div className="bg-white min-h-[500px] md:flex gap-3">
            <div className=" md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3" 
            // style={{borderRight:"1px solid #4b54bb"}}
            >
              <div className="space-y-3 pt-6  pr-4 grid grid-cols-1 gap-1  my-scrollbar " >
              
                <div
                  style={{border:"1px solid #5ac4fe"}}
                  onClick={() => toggleCurrentPage("general")}
                  className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                    currentPage == "general"
                      ? "sublink-active"
                      : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                  }`}
                >
                  <div className="flex items-start gap-3 my-font-family-overpass-mono">
                    <i
                      className="nc-icon nc-pin-3 "
                      style={{ fontSize: "18px" }}
                    />
                    <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>General: </h2>
                  </div>
                  <p
                    className=" mt-2 "
                    style={{ fontSize: "13px", paddingLeft: "10px" }}
                  >
                    Change your deployment name, description, logo and other
                    details
                  </p>
                </div>
                <div
                  style={{border:"1px solid #5ac4fe"}}
                  onClick={() => toggleCurrentPage("users")}
                  className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                    currentPage == "users"
                      ? "sublink-active"
                      : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                  }`}
                >
                  <div className="flex items-start gap-3 my-font-family-overpass-mono">
                    <i
                      className="nc-icon nc-pin-3 "
                      style={{ fontSize: "18px" }}
                    />
                    <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Users: </h2>
                  </div>
                  <p
                    className=" mt-2 "
                    style={{ fontSize: "13px", paddingLeft: "10px" }}
                  >
                    Teams Associated with you
                  </p>
                </div>
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
                
                
  
  
               
  
  
              </div>
            </div>
            <div  className="w-3/4 my-black-bg  md:border-l border-blue-500 sm:p-5  rounded-l-3xl">
             this is the main page
              
            </div>
          
      </div>
      </div>
    );
}
