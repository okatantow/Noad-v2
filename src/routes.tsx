import MobileNotAllowed from "../src/pages/mobile-not-allowed/MobileNotAllowed";
import AdminNotFound from "../src/pages/notfound/AdminNotFound";
// import CustomerDetailsPage from "../src/pages/customer/CustomerDetailPage";
import Login from "../src/pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerDetailsPage from "./pages/customer/CustomerDetailPage";
import CashierPage from "./pages/cashier/CashierPage";
import LoansPage from "./pages/loans/LoansPage";
import AccountantPage from "./pages/accountant/AccountantPage";
import AccountingPage from "./pages/accounting/AccountingPage";
import SystemManagerPage from "./pages/system-manager/SystemManagerPage";
import OverDraftPage from "./pages/overdraft/OverdraftPage";
import BankTransactionPage from "./pages/bank-transactions/BankTransactionPage";
import TreasuryPage from "./pages/treasury/TreasuryPage";
// import SystemPage from "./pages/system/SystemPage";
import SetupPage from "./pages/system/SetupPage";
import AccountingFrameworkPage from "./pages/accounting-framework/AccountingFramworkPage";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashbaord",
    icon: "nc-icon nc-pin-3",
    component: Dashboard,
    layout: "/pages",
    mobileRestricted: true,
  },
  {
    path: "/customer",
    name: "Customer",
    icon: "nc-icon nc-pin-3",
    component: CustomerDetailsPage,
    layout: "/pages",
    mobileRestricted: true,
  },
 {
    path: "/cashier",
    name: "Cashier",
    icon: "nc-icon nc-pin-3",
    component: CashierPage,
    layout: "/pages",
    mobileRestricted: true,
  },
   {
    path: "/loans",
    name: "Loans",
    icon: "nc-icon nc-pin-3",
    component: LoansPage,
    layout: "/pages",
    mobileRestricted: true,
  },
   {
    path: "/accountant",
    name: "Accountant",
    icon: "nc-icon nc-pin-3",
    component: AccountantPage,
    layout: "/pages",
    mobileRestricted: true,
  },
   {
    path: "/financial-reports",
    name: "Financial Reports",
    icon: "nc-icon nc-pin-3",
    component: AccountingPage,
    layout: "/pages",
    mobileRestricted: true,
  },
   {
    path: "/system-manager",
    name: "System Manager",
    icon: "nc-icon nc-pin-3",
    component: SystemManagerPage,
    layout: "/pages",
    mobileRestricted: true,
  },
   {
    path: "/accounting-framework",
    name: "Accounting Framework",
    icon: "nc-icon nc-pin-3",
    component: AccountingFrameworkPage,
    layout: "/pages",
    mobileRestricted: true,
  },
   {
    path: "/overdraft",
    name: "Overdraft",
    icon: "nc-icon nc-pin-3",
    component: OverDraftPage,
    layout: "/pages",
    mobileRestricted: true,
  },
   {
    path: "/treasury",
    name: "Treasury",
    icon: "nc-icon nc-pin-3",
    component: TreasuryPage,
    layout: "/pages",
    mobileRestricted: true,
  },
   {
    path: "/bank-transaction",
    name: "Bank Transaction",
    icon: "nc-icon nc-pin-3",
    component: BankTransactionPage,
    layout: "/pages",
    mobileRestricted: true,
  },
  {
    path: "/setup",
    name: "Setup",
    icon: "nc-icon nc-pin-3",
    component: SetupPage,
    layout: "/pages",
    mobileRestricted: true,
  },
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-bell-55",
    component: Login,
    layout: "/pages",
  },
  // {
  //   path: "/verify-email",
  //   name: "Email Verification",
  //   icon: "nc-icon nc-bell-55",
  //   component: EmailVerificationPage,
  //   layout: "/pages",
  // },
  {
    path: "/mobile-not-allowed",
    name: "Mobile Restricted",
    component: MobileNotAllowed,
    layout: "/deployment"
  },
  
  {
    path: "*",
    name: "Not Found",
    icon: "nc-icon nc-bell-55",
    component: AdminNotFound,
    layout: "/pages",
  }

  // {
  //   path: "/maptest",
  //   name: "MapTest",
  //   icon: "nc-icon nc-bell-55",
  //   component: MapTest,
  //   layout: "/deployment"
  // }
];

export default dashboardRoutes;
