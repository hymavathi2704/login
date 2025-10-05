import React, { createContext, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Create a context to hold the breadcrumb state
const BreadcrumbContext = createContext(null);

// Custom hook to easily access the breadcrumb context
export const useBreadcrumb = () => useContext(BreadcrumbContext);

// Provider component that will wrap our layout
export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumb, setBreadcrumb] = useState([]);
  return (
    <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

const BreadcrumbNavigation = () => {
  // Consume the context to get the current breadcrumb
  const { breadcrumb } = useBreadcrumb() || { breadcrumb: [] };

  if (!breadcrumb || breadcrumb.length === 0) {
    return null;
  }

  return (
    <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex items-center space-x-2">
        {breadcrumb.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight size={16} className="mx-2 text-gray-400" />}
            {item.path ? (
              <Link to={item.path} className="hover:text-blue-600 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;