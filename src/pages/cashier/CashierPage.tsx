import { useState } from "react";
import { Calculator, BookOpen, Receipt } from 'lucide-react'; // Import Lucide icons
import Breadcrumb from "../../components/layout/Breadcrumb";
import CashierScreen from "./cashier-screen/CashierScreen";

export default function CashierPage() {
  const [currentPage, setCurrentPage] = useState("cashier");
  
  const toggleCurrentPage = (page: any) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen text-black font-mono px-8">
      <div className='flex items-start space-x-8'>
      </div>
      <Breadcrumb items={["Cashier Screen", "Cashier"]} newPage={currentPage} />
      <div className="bg-white min-h-[500px] md:flex gap-3">
        <div className="md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3">
          <div className="space-y-3 pt-6 pr-4 grid grid-cols-1 gap-1 my-scrollbar">
            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("cashier")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "cashier"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <Calculator size={18} /> {/* Cashier operations icon */}
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Cashier: </h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                For Deposits And Withdrawals of Customers
              </p>
            </div>

            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("daybook")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "daybook"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <BookOpen size={18} /> {/* Daily record keeping icon */}
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Daybook: </h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                Cashier's Dailybook For Daily Transactions and Balancing
              </p>
            </div>

            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("nominal voucher")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "nominal voucher"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <Receipt size={18} /> {/* Voucher/document icon */}
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Nominal Voucher: </h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                For Cash Affected Nominal Transactions
              </p>
            </div>
          </div>
        </div>
        <div className="w-3/4 my-black-bg md:border-l border-blue-500 sm:p-5 rounded-l-3xl">
          {currentPage == "cashier" && <CashierScreen />}
        </div>
      </div>
    </div>
  );
}