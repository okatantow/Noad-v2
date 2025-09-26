import  Breadcrumb  from "../../components/layout/Breadcrumb";
import React, { useState, useEffect } from "react";

import {  useDispatch } from "react-redux";
import SystemPage from "./SystemPage";



const SetupPage: React.FC = () => {
     const [currentPage, setCurrentPage] = useState("setup");
  
    const toggleCurrentPage = (page:any) => {
      setCurrentPage(page);
      // setCurrentTab(tab);
    };
 
  const dispatch = useDispatch();
  
 

  return (
    <div className="min-h-screen text-black font-mono px-8">
      <Breadcrumb items={["System", "Customer Details"]} newPage={currentPage}/>
      
       <div className="bg-white min-h-[500px] md:flex gap-3">
        
       
          <div className=" md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3" style={{borderRight:"1px solid #4b54bb"}}>
            <div className="space-y-3 pt-4  pr-4 grid grid-cols-1 gap-1  my-scrollbar " >
            
              <div
                style={{border:"1px solid #5ac4fe"}}
                onClick={() => toggleCurrentPage("branches")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "branches"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Branches: </h2>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Create branches
                </p>
              </div>
              <div
                style={{border:"1px solid #5ac4fe"}}
                onClick={() => toggleCurrentPage("setup")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "setup"
                    ? "sublink-active"
                    : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Setup: </h2>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Teams Associated with you
                </p>
              </div>
             
              
              


             


            </div>
          </div>
          <div  className="w-3/4 my-black-bg  rounded shadow">
           {currentPage == "setup" && <SystemPage />}
            
          </div>
        
    </div>
    </div>
  );
};

export default SetupPage;