import { useState, useEffect } from 'react';

interface UseDeviceDetectResult {
  isMobile: boolean;
}

// Extend the Window interface to include the opera property
declare global {
  interface Window {
    opera?: string;
  }
}

export const useDeviceDetect = (): UseDeviceDetectResult => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIfMobile = (): void => {
      // Use optional chaining to safely access opera property
      const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return { isMobile };
};