import React, { createContext, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Create a context to hold the breadcrumb state
const BreadcrumbContext = createContext(null);

// Custom hook to easily access the breadcrumb context
export const useBreadcrumb = () => useContext(BreadcrumbContext);

// Provider component that will wrap our layout
export const BreadcrumbProvider = ({ children }) => {
  // Initialize state to an array to match the expected structure
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
  
  // FIX: Normalize the breadcrumb state into a mappable array of objects
  let items = [];
  
  if (Array.isArray(breadcrumb)) {
      items = breadcrumb;
  } else if (typeof breadcrumb === 'object' && breadcrumb !== null && breadcrumb.parent) {
      // Handle the object structure used by ExploreCoaches: { parent, current, onBack }
      items = [
          { label: breadcrumb.parent, onBack: breadcrumb.onBack }, // Parent is a clickable back action
          { label: breadcrumb.current, current: true }             // Current page is just a label
      ];
  }

  // Check if the normalized array is empty
  if (items.length === 0) {
    return null;
  }

  return (
    // FIX: Removed unnecessary wrapper div, moved margin/text size to the nav/ol elements
    <nav aria-label="Breadcrumb">
      {/* FIX: Ensure items-center is present on the ol for vertical alignment */}
      <ol className="list-none p-0 inline-flex items-center space-x-2 text-sm text-gray-500">
        {items.map((item, index) => (
          // FIX: Ensure each list item is a flex container for the chevron
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
            {/* Render a button for onBack action, Link for path, or span for current page */}
            {item.onBack ? (
              <button 
                onClick={item.onBack} 
                // Removed the extra flex items-center from here, as the parent <li> handles it
                className="hover:text-blue-600 hover:underline"
              >
                {item.label}
              </button>
            ) : item.path ? (
              <Link to={item.path} className="hover:text-blue-600 hover:underline">
                {item.label}
              </Link>
            ) : (
              // Current item should have the correct font styling
              <span className="font-medium text-gray-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;