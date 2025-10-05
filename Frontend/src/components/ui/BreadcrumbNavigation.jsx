import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbNavigation = ({ 
  previousSearch = null, 
  coachName = '', 
  onReturn = null,
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleReturn = () => {
    if (onReturn) {
      onReturn();
    } else if (previousSearch) {
      navigate('/enhanced-explore-coaches', { 
        state: { 
          preservedFilters: previousSearch?.filters,
          preservedSearch: previousSearch?.searchTerm,
          preservedScroll: previousSearch?.scrollPosition 
        } 
      });
    } else {
      navigate('/enhanced-explore-coaches');
    }
  };

  const truncateCoachName = (name, maxLength = 30) => {
    if (!name || name?.length <= maxLength) return name;
    return `${name?.substring(0, maxLength)}...`;
  };

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <button
            onClick={handleReturn}
            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-smooth group"
            aria-label="Return to coach exploration"
          >
            <Icon 
              name="ArrowLeft" 
              size={16} 
              className="group-hover:-translate-x-0.5 transition-transform duration-200" 
            />
            <span className="font-medium">Explore Coaches</span>
          </button>
        </li>
        
        {coachName && (
          <>
            <li>
              <Icon name="ChevronRight" size={16} className="text-border" />
            </li>
            <li>
              <span 
                className="text-foreground font-medium"
                title={coachName}
              >
                {truncateCoachName(coachName)}
              </span>
            </li>
          </>
        )}
      </ol>
      {previousSearch?.searchTerm && (
        <div className="hidden sm:flex items-center ml-4 px-2 py-1 bg-muted rounded-soft">
          <Icon name="Search" size={14} className="text-muted-foreground mr-1" />
          <span className="text-xs text-muted-foreground">
            Search: "{previousSearch?.searchTerm}"
          </span>
        </div>
      )}
    </nav>
  );
};

export default BreadcrumbNavigation;