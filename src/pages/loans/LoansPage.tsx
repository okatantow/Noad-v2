import { useState } from "react";
import { Landmark, Clock, CreditCard, List, Users, DollarSign, FileText } from 'lucide-react';
import Breadcrumb from "../../components/layout/Breadcrumb";
import LoanDashboard from "./LoanDashboard";
import LoanProductConfig from "./products/LoanProductConfig";
import LoanApplicationForm from "./application/LoanApplicationForm";
import LoanApplicationsList from "./application/LoanApplicationsList";
import ActiveLoansList from "./loans/ActiveLoansList";
import LoanRepayment from "./loans/LoanRepayment";
import LoanDetails from "./loans/LoanDetails";
import LoanDisbursement from "./disbursement/LoanDisbursement";
import ApplicationDetails from "./application/ApplicationDetails";

export default function LoansPage() {
  const [currentPage, setCurrentPage] = useState("loans");
  const [selectedLoanId, setSelectedLoanId] = useState<number>(0);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number>(0);
  
  const toggleCurrentPage = (page: string) => {
    setCurrentPage(page);
    // Reset selections when changing main pages
    setSelectedLoanId(0);
    setSelectedApplicationId(0);
  };

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
  };

  const handleSetSelectedLoanId = (id: number) => {
    setSelectedLoanId(id);
  };

  const handleSetSelectedApplicationId = (id: number) => {
    setSelectedApplicationId(id);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "loans":
        return (
          <LoanDashboard 
            setCurrentPage={handleSetCurrentPage} 
            setSelectedLoanId={handleSetSelectedLoanId} 
          />
        );
      case "products":
        return <LoanProductConfig />;
      case "application":
        return <LoanApplicationForm setCurrentPage={handleSetCurrentPage} />;
      case "applications":
        return (
          <LoanApplicationsList 
            setCurrentPage={handleSetCurrentPage} 
            setSelectedApplicationId={handleSetSelectedApplicationId} 
          />
        );
        case "loan-disbursement":
  return (
    <LoanDisbursement
      setCurrentPage={handleSetCurrentPage} 
      selectedApplicationId={selectedApplicationId}  // Change this line
    />
  );
        case 'application-details':
  return (
    <ApplicationDetails 
      setCurrentPage={handleSetCurrentPage} 
      selectedApplicationId={selectedApplicationId} 
    />
  );
      case "active-loans":
        return (
          <ActiveLoansList 
            setCurrentPage={handleSetCurrentPage} 
            setSelectedLoanId={handleSetSelectedLoanId} 
          />
        );
      case "loan-repayment":
        return (
          <LoanRepayment 
            setCurrentPage={handleSetCurrentPage} 
            selectedLoanId={selectedLoanId} 
          />
        );
      case "loan-details":
        return (
          <LoanDetails 
            setCurrentPage={handleSetCurrentPage} 
            selectedLoanId={selectedLoanId} 
          />
        );
      default:
        return (
          <LoanDashboard 
            setCurrentPage={handleSetCurrentPage} 
            setSelectedLoanId={handleSetSelectedLoanId} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen text-black font-mono px-8">
      <div className='flex items-start space-x-8'>
      </div>
      <Breadcrumb items={["Loans Screen", "Loan"]} newPage={currentPage} />
      <div className="bg-white min-h-[500px] md:flex gap-3">
        <div className="md:max-h-[650px] md:min-h-[580px] w-1/4 pr-3">
          <div className="space-y-3 pt-6 pr-4 grid grid-cols-1 gap-1 my-scrollbar">
            {/* Loans Dashboard */}
            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("loans")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "loans"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <Landmark size={18} />
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Loans Dashboard</h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                Overview of loan portfolio and performance
              </p>
            </div>

            {/* Loan Products */}
            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("products")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "products"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <Clock size={18} />
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Loan Products</h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                Configure and manage loan products
              </p>
            </div>

            {/* Loan Application */}
            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("application")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "application"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <CreditCard size={18} />
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Apply for Loan</h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                Submit new loan application
              </p>
            </div>

            {/* Loan Applications List */}
            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("applications")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "applications"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <FileText size={18} />
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Applications</h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                View and manage loan applications
              </p>
            </div>

            {/* Active Loans */}
            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("active-loans")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "active-loans"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <Users size={18} />
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Active Loans</h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                Manage and monitor active loans
              </p>
            </div>

            {/* Loan Repayment */}
            <div
              style={{border:"1px solid #5ac4fe"}}
              onClick={() => toggleCurrentPage("loan-repayment")}
              className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer py-2 px-1 hover:border-y-yellow-600 ${
                currentPage == "loan-repayment"
                  ? "sublink-active"
                  : "text-gray-700 bg-[#f5f5f5] sublink-hover"
              }`}
            >
              <div className="flex items-start gap-3 my-font-family-overpass-mono">
                <DollarSign size={18} />
                <h2 className="font-semibold" style={{ fontSize: "1.2em" }}>Process Repayment</h2>
              </div>
              <p className="mt-2" style={{ fontSize: "13px", paddingLeft: "10px" }}>
                Record loan repayment transactions
              </p>
            </div>
          </div>
        </div>
        <div className="w-3/4 my-black-bg md:border-l border-blue-500 sm:p-5 rounded-l-3xl">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}