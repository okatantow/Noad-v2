import  Breadcrumb  from "../../components/layout/Breadcrumb";
import { useState } from "react";

export default function CustomerDetailsPage() {
 const [currentPage, setCurrentPage] = useState("accounts");
 
   const toggleCurrentPage = (page:any) => {
     setCurrentPage(page);
   
   };
   return (
     <div className="min-h-screen  text-black font-mono px-8">
 
       <div className='flex items-start space-x-8'>
      
       </div>
       <Breadcrumb items={["Customer", "Customer Details"]} newPage={currentPage} />
       <div className="bg-white min-h-[500px] md:flex gap-3">
           <div className=" md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3" 
           // style={{borderRight:"1px solid #4b54bb"}}
           >
             <div className="space-y-3 pt-6  pr-4 grid grid-cols-1 gap-1  my-scrollbar " >
             
               <div
                 style={{border:"1px solid #5ac4fe"}}
                 onClick={() => toggleCurrentPage("customer details")}
                 className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                   currentPage == "customer details"
                     ? "sublink-active"
                     : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                 }`}
               >
                 <div className="flex items-start gap-3 my-font-family-overpass-mono">
                   <i
                     className="nc-icon nc-pin-3 "
                     style={{ fontSize: "18px" }}
                   />
                   <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Customer Details: </h2>
                 </div>
                 <p
                   className=" mt-2 "
                   style={{ fontSize: "13px", paddingLeft: "10px" }}
                 >
                   Add Or Update a customer
                 </p>
               </div>
               <div
                 style={{border:"1px solid #5ac4fe"}}
                 onClick={() => toggleCurrentPage("accounts")}
                 className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                   currentPage == "accounts"
                     ? "sublink-active"
                     : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                 }`}
               >
                 <div className="flex items-start gap-3 my-font-family-overpass-mono">
                   <i
                     className="nc-icon nc-pin-3 "
                     style={{ fontSize: "18px" }}
                   />
                   <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Customer Accounts: </h2>
                 </div>
                 <p
                   className=" mt-2 "
                   style={{ fontSize: "13px", paddingLeft: "10px" }}
                 >
                   Add Or Update A Customer Account
                 </p>
               </div>
               <div
                 style={{border:"1px solid #5ac4fe"}}
                 onClick={() => toggleCurrentPage("accounts list")}
                 className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                   currentPage == "accounts list"
                     ? "sublink-active"
                     : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                 }`}
               >
                 <div className="flex items-start gap-3 my-font-family-overpass-mono">
                   <i
                     className="nc-icon nc-pin-3 "
                     style={{ fontSize: "18px" }}
                   />
                   <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Account List: </h2>
                 </div>
                 <p
                   className=" mt-2 "
                   style={{ fontSize: "13px", paddingLeft: "10px" }}
                 >
                   List Of All Account
                 </p>
               </div>
               <div
                 style={{border:"1px solid #5ac4fe"}}
                 onClick={() => toggleCurrentPage("customer list")}
                 className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                   currentPage == "customer list"
                     ? "sublink-active"
                     : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                 }`}
               >
                 <div className="flex items-start gap-3 my-font-family-overpass-mono">
                   <i
                     className="nc-icon nc-pin-3 "
                     style={{ fontSize: "18px" }}
                   />
                   <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Customer List: </h2>
                 </div>
                 
                 <p
                   className=" mt-2 "
                   style={{ fontSize: "13px", paddingLeft: "10px" }}
                 >
                   Lists Of Cutomers
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
