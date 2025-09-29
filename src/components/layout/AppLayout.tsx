// import  Sidebar  from "./Sidebar";
import { Header } from "./Header";
// import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Routes, Route } from "react-router-dom";
import routes from "../../routes";

// interface AppLayoutProps {
//   children: ReactNode;
// }

interface RouteProps {
  layout: string;
  path: string;
  component: React.ComponentType<any>;
}

export const AppLayout = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const getRoutes = (routes: RouteProps[]) => {
    return routes.map((prop: RouteProps, key: number) => {
      if (prop.layout === "/pages") {
        return (
          <Route
            key={key}
            path={prop.layout + prop.path}
            element={<prop.component />}
          />
        );
      } else {
        return null;
      }
    });
  };

  return (
    <>
      {/* <AnimatePresence mode='wait'>
        <motion.div
          key={pathname}
          initial="initialState"
          animate="animateState"
          exit="exitState"
          transition={{
            duration: 0.75,
          }}
          variants={{}}
        >
          <Routes>
            {getRoutes(routes)}
          </Routes>
        </motion.div>
      </AnimatePresence> */}
      
      {/* Uncomment this section if you want to use the layout with sidebar and header */}
      
      <div className="w-screen h-screen flex overflow-hidden bg-gray-100">
        {/* <Sidebar /> */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          {/* <main className="flex-1 overflow-y-auto p-4">{children}</main> */}
          <AnimatePresence mode='wait'>
        <motion.div
          key={pathname}
          initial="initialState"
          animate="animateState"
          exit="exitState"
          transition={{
            duration: 0.75,
          }}
          variants={{}}
        >
          <Routes>
            {getRoutes(routes)}
          </Routes>
        </motion.div>
      </AnimatePresence>
        </div>
      </div>
     
    </>
  );
};