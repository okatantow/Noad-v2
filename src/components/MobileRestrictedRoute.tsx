import  { useEffect } from 'react';
import type {ReactNode } from 'react';
import {  useNavigate,  } from "react-router-dom";
import { useDeviceDetect } from '../hooks/useDeviceDetect';
import { Alert, Button } from 'react-bootstrap';

interface MobileRestrictedRouteProps {
  children: ReactNode;
}

export const MobileRestrictedRoute = ({ children }: MobileRestrictedRouteProps) => {
  const { isMobile } = useDeviceDetect();
  const navigate = useNavigate();


  useEffect(() => {
    if (isMobile) {
      navigate('/deployment/mobile-not-allowed');
    }
  }, [isMobile, navigate]);

  if (isMobile) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <Alert.Heading>Access Restricted</Alert.Heading>
          <p>This page is not available on mobile devices.</p>
          <Button 
            onClick={() => navigate('/deployment/dashboard')} 
            style={{ backgroundColor: "#165b44", borderRadius: 0 }}
            className="text-white bg-yellow-500 hover:bg-yellow-600 font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Return to Dashboard
          </Button>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};