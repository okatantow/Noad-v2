import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTachometerAlt, 
  faCashRegister, 
  faUsers, 
  faHandHoldingUsd, 
  faCalculator,
  faCogs,
  faBook,
  faPiggyBank,
  faCreditCard,
  faExchangeAlt,
  faChartBar
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../../provider/contexts/AuthContext';

interface Deployment {
  display_name: string;
}

interface User {
  name: string;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  color?: string;
  image?: string;
  routes?: any[];
  deployment?: Deployment | null;
  user?: User | null;
  isLogin: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const activeRoute = (routeName: string): string => {
    return location.pathname.includes(routeName) ? " my-red-bg border-r-4 border-[#5ac4fe]" : "text-black";
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 w-64 z-[1800] my-sidebar-bg text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
        style={{ borderRight: "1px solid gray" }}
      >
        <div className="flex flex-col items-center mb-6 bg-[#4b54bb] py-4 " style={{ borderBottom: "5px solid #5ac4fe" }}>
          <div className="w-16 h-16 bg-white rounded-full  flex items-center justify-center text-[#5ac4fe] text-2xl font-bold">
            <span className='text-[#4b54bb]'>N</span>
            <span>B</span>
          </div>
          <div>
            <span className="italic">
              logged in as:
            </span>
            <span className="pl-2">
              {user?.first_name}
            </span>
          </div>
        </div>

        <div className='px-3 text-black'>
          <NavLink
            to='/pages/dashboard'
            className={`
              ${activeRoute('pages/dashboard')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faTachometerAlt} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Dashboard
            </span>
          </NavLink>
          <NavLink
            to='/pages/cashier'
            className={`
              ${activeRoute('pages/cashier')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faCashRegister} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Cashier
            </span>
          </NavLink>
          <NavLink
            to='/pages/customer'
            className={`
              ${activeRoute('pages/customer')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faUsers} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Customer
            </span>
          </NavLink>
          <NavLink
            to='/pages/loans'
            className={`
              ${activeRoute('pages/loans')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faHandHoldingUsd} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Loans
            </span>
          </NavLink>
          <NavLink
            to='/pages/accountant'
            className={`
              ${activeRoute('pages/accountant')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faCalculator} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Accountant
            </span>
          </NavLink>
          <NavLink
            to='/pages/system-manager'
            className={`
              ${activeRoute('pages/system-manager')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faCogs} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              System Manager
            </span>
          </NavLink>
          <NavLink
            to='/pages/nominal-ledger'
            className={`
              ${activeRoute('pages/nominal-ledger')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faBook} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Nominal Ledger
            </span>
          </NavLink>
          <NavLink
            to='/pages/treasury'
            className={`
              ${activeRoute('pages/treasury')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faPiggyBank} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Treasury
            </span>
          </NavLink>
          <NavLink
            to='/pages/overdraft'
            className={`
              ${activeRoute('pages/overdraft')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faCreditCard} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Overdraft
            </span>
          </NavLink>
          <NavLink
            to='/pages/bank-transaction'
            className={`
              ${activeRoute('pages/bank-transaction')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faExchangeAlt} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Bank Transactions
            </span>
          </NavLink>
          <NavLink
            to='/pages/accounting'
            className={`
              ${activeRoute('pages/accounting')}
              group mt-1 hidden md:flex items-start bg-[#fff] border-gray-700 px-3 py-2  shadow hover:my-red-bg hover:no-underline
            `}
            onClick={toggleSidebar}
            style={{ textDecoration: "none" }}
          >
            <div className="mr-2 transition-colors">
              <FontAwesomeIcon icon={faChartBar} className="h-7 w-7 text-[#5ac4fe] font-bold" />
            </div>
            <span className=' my-sidebar-link  transition-colors my-font-family-overpass-mono'>
              Accounting
            </span>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Sidebar;