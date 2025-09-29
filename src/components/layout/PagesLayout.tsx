import React, { useEffect, useState} from "react";
import type { ReactElement } from "react";
import {  Routes, Route } from "react-router-dom";

import Sidebar from "./Sidebar";
import { MobileRestrictedRoute } from '../MobileRestrictedRoute';
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toggleToaster, selectToasterData, selectToasterStatus } from '../../provider/features/helperSlice';

import routes from "../../routes";
import sidebarImage from "../../assets/img/sidebar-3.jpg";
import Dashboard from "../../pages/Dashboard";
import { Navbar } from "./Navbar";

// Define route interface
interface AppRoute {
  layout: string;
  path: string;
  component: React.ComponentType<any>;
  mobileRestricted?: boolean;
  name?: string;
  icon?: string;
}




interface AppLayoutProps {
  // Keep it empty or remove if not needed
}

export const PagesLayout: React.FC<AppLayoutProps> = () => {
  const [image] = useState<string>(sidebarImage);
  const [color] = useState<string>("black");
  const [hasImage] = useState<boolean>(true);

  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  const [userLogin] = useState<string>('');

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const dispatch = useDispatch();
  const onToast = useSelector(selectToasterStatus);
  const toastData = useSelector(selectToasterData);

  const callToast = (type: string, msg: string): void => {
    switch (type) {
      case 'success':
        toast.success(msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        break;
      case 'error':
        toast.error(msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        break;
      case 'warning':
        toast.warn(msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        break;
      case 'info':
        toast.info(msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        break;
      default:
        toast(msg);
    }
    dispatch(toggleToaster({ isOpen: false, toasterData: { type: "", msg: "" } }));
  };

  useEffect(() => {
    callToast(toastData.type, toastData.msg);
  }, [onToast]);

  const getRoutes = (routes: AppRoute[]): ReactElement[] => {
    return routes.map((prop: AppRoute, key: number) => {
      if (prop.layout === "/pages") {
        const Component = prop.component;
        return (
          <Route
            key={key}
            path={prop.path.startsWith("/") ? prop.path.slice(1) : prop.path} // Remove leading slash for nested routes
            element={
              prop.mobileRestricted ? (
                <MobileRestrictedRoute>
                  <Component />
                </MobileRestrictedRoute>
              ) : (
                <Component />
              )
            }
          />
        );
      } else {
        return <React.Fragment key={key} />;
      }
    });
  };

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover 
      />

      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          user={null} 
          deployment={null}
          isLogin={userLogin} 
          color={color} 
          image={hasImage ? image : ""} 
          routes={routes} 
        />
        
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
            onClick={toggleSidebar}
          />
        )}

        <div className="flex-1 lg:ml-64 overflow-auto">
          <div className="flex lg:flex lg:items-end justify-between my-black-bg">
            <div className="p-4 lg:hidden">
              <button
                onClick={toggleSidebar}
                className="text-gray-300 hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            {/* <PagesLayoutNavbar user={user} isLogin={userLogin} /> */}
             
<Navbar />
      
            
          </div>

          <div className="pb-[120px] lg:pb-0 overflow-auto bg-white text-black pt-2 lg:pt-0">
            <AnimatePresence mode='wait'>
        <motion.div
          // key={pathname}
          initial="initialState"
          animate="animateState"
          exit="exitState"
          transition={{
            duration: 0.75,
          }}
          variants={{

          }}
          // className="base-page-size"
        >
            <Routes>
              {getRoutes(routes)}
              {/* Add a default route for /pages */}
              <Route   index element={<Dashboard/>} />
           
            </Routes>
              </motion.div>
        </AnimatePresence>
          </div>
        </div>
        
        {/* <NavBottom 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          user={user} 
          deployment={deployment} 
          isLogin={userLogin} 
          routes={routes} 
        /> */}
      </div>
    </>
  );
}

export default PagesLayout;