import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './provider/contexts/AuthContext';
import ReduxProvider from './provider/redux/ReduxProvider';
import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import "./App.css";
// import CustomerDetailsPage from './pages/customer/CustomerDetailPage';
import PagesLayout from './components/layout/PagesLayout';

const App: React.FC = () => {
  return (
    <ReduxProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Main pages route - all /pages/* routes will be handled by PagesLayout */}
              <Route 
                path="/pages/*" 
                element={
                  <ProtectedRoute>
                    <PagesLayout />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect root to /pages */}
              <Route path="/" element={<Navigate to="/pages" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/pages" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ReduxProvider>
  );
};

export default App;