import { useState, useEffect } from "react";

interface BreadcrumbProps {
  items: string[];
  newPage: any;
}

export default function Breadcrumb({ items, newPage }: BreadcrumbProps) {
  const [currentPage, setCurrentPage] = useState(items[1]);
  // const [displayPage, setDisplayPage] = useState(items[1]);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (newPage !== currentPage) {
      // Update the current page immediately
      setCurrentPage(newPage);
      // Trigger re-render for animation
      setAnimationKey(prev => prev + 1);
    }
  }, [newPage, currentPage]);

  return (
    <nav className="text-sm text-gray-600 mb-0 flex items-start">
      <div className="bg-blue-100  p-2 mt-2 capitalize">
        <span className=" text-blue-800">{items[0]}</span>
        <span className="mx-2">›</span>
        <span 
          key={animationKey}
          className="inline-block animate-fadeIn font-semibold text-blue-900"
        >
          {currentPage}
        </span>
      </div>
      
      <style >{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </nav>
  );
}