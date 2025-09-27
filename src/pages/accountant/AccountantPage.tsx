
import  Breadcrumb  from "../../components/layout/Breadcrumb";
import { useState } from "react";

export default function AccountantPage() {
 const [currentPage, setCurrentPage] = useState("batch posting");
 
   const toggleCurrentPage = (page:any) => {
     setCurrentPage(page);
   
   };
   return (
     <div className="min-h-screen  text-black font-mono px-8">
 
       <div className='flex items-start space-x-8'>
      
       </div>
       <Breadcrumb items={["Accountant", "batch posting"]} newPage={currentPage}/>
       <div className="bg-white min-h-[500px] md:flex gap-3">
           <div className=" md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3" 
           // style={{borderRight:"1px solid #4b54bb"}}
           >
             <div className="space-y-3 pt-6  pr-4 grid grid-cols-1 gap-1  my-scrollbar " >
             
               <div
                 style={{border:"1px solid #5ac4fe"}}
                 onClick={() => toggleCurrentPage("batch posting")}
                 className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                   currentPage == "batch posting"
                     ? "sublink-active"
                     : "text-gray-700 bg-[#f5f5f5] sublink-hover"
                 }`}
               >
                 <div className="flex items-start gap-3 my-font-family-overpass-mono">
                   <i
                     className="nc-icon nc-pin-3 "
                     style={{ fontSize: "18px" }}
                   />
                   <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Batch Posting: </h2>
                 </div>
                 <p
                   className=" mt-2 "
                   style={{ fontSize: "13px", paddingLeft: "10px" }}
                 >
                   For Non Cash Transaction
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
