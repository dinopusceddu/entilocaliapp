// components/shared/Card.tsx
import React, { useState } from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  footer?: React.ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = React.memo(({
  title,
  children,
  className = '',
  titleClassName = '',
  footer,
  isCollapsible = false,
  defaultCollapsed = false,
  style
}) => {
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible ? defaultCollapsed : false);
  const contentId = React.useId();
  const triggerId = React.useId();

  const toggleCollapse = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-[#f3e7e8] ${className}`} style={style}>
      {title && (
        <div
          className={`px-6 py-4 border-b border-[#f3e7e8] flex justify-between items-center ${isCollapsible ? 'cursor-pointer hover:bg-[#fcf8f8]' : ''} ${titleClassName}`}
        >
          <h3 className="text-lg font-bold text-[#1b0e0e] leading-tight w-full">
          {isCollapsible ? (
            <button id={triggerId} onClick={toggleCollapse} aria-expanded={!isCollapsed} aria-controls={contentId}
              type="button"
              className="w-full flex items-center justify-between gap-3 text-left hover:text-[#ea2832] rounded focus:outline-none focus:ring-1 focus:ring-[#ea2832]"
            >
              <span>{title}</span><span aria-hidden="true">{isCollapsed ? '▼' : '▲'}</span>
            </button>
          ) : title}</h3>
        </div>
      )}
        <div id={isCollapsible ? contentId : undefined} hidden={isCollapsed} role={isCollapsible ? 'region' : undefined} aria-labelledby={isCollapsible ? triggerId : undefined}>
          <div className="p-6">
            {children}
          </div>
          {footer && (
            <div className="px-6 py-4 bg-[#fcf8f8] border-t border-[#f3e7e8] rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
    </div>
  );
});
