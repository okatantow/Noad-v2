import { useState } from "react";
import { Landmark, Clock, CreditCard, List } from 'lucide-react'; // Import Lucide icons
import Breadcrumb from "../../components/layout/Breadcrumb";

export default function LoansPage() {
  const [currentPage, setCurrentPage] = useState("loans");
  
  const toggleCurrentPage = (page: any) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen text-black font-mono px-8">
      <div className='flex items-start space-x-8'>
      </div>
      <Breadcrumb items={["Loans Screen", "Loan"]} newPage={currentPage} />
      <div className="bg-white min-h-[500px] md:flex gap-3">
        <div className="md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3">
          <div className="space-y-3 pt-6 pr-4 grid grid-cols-1 gap-1 my-scrollbar">
            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("loan")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "loan"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <Landmark size={18} /> {/* Represents financial institution/loans */}
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Loans: </h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                For Application of Loans
              </p>
            </div>

            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("status")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "status"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <Clock size={18} /> {/* Represents status and timing */}
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Status: </h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                Status : To Be Approved / Disbursed
              </p>
            </div>

            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("repayment")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "repayment"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <CreditCard size={18} /> {/* Represents payments and repayment */}
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Repayment: </h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                For repayment of loans
              </p>
            </div>

            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("loan list")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "loan list"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <List size={18} /> {/* Represents listing and overview */}
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Loan List: </h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                List of Loans
              </p>
            </div>
          </div>
        </div>
        <div className="w-3/4 my-black-bg md:border-l border-blue-500 sm:p-5 rounded-l-3xl">
          this is the main page
        </div>
      </div>
    </div>
  );
}