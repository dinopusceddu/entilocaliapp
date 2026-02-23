// src/components/shared/Alert.tsx
import React from 'react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string | React.ReactNode;
  className?: string;
}

const typeStyles = {
  info: {
    container: 'bg-[#eff6ff] border-[#bfdbfe]',
    title: 'text-[#1e40af]',
    message: 'text-[#1d4ed8]',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    title: 'text-green-800',
    message: 'text-green-700',
  },
  warning: {
    container: 'bg-[#fffbeb] border-[#fde68a]',
    title: 'text-[#92400e]',
    message: 'text-[#b45309]',
  },
  error: {
    container: 'bg-[#fef2f2] border-[#fecaca]',
    title: 'text-[#991b1b]',
    message: 'text-[#b91c1c]',
  },
};

export const Alert: React.FC<AlertProps> = ({ type, title, message, className = '' }) => {
  const styles = typeStyles[type];

  return (
    <div className={`p-4 border-l-4 rounded-md ${styles.container} ${className}`} role="alert">
      <div className="flex">
        <div className="flex-1">
          <p className={`font-bold ${styles.title}`}>{title}</p>
          <div className={`text-sm ${styles.message}`}>{message}</div>
        </div>
      </div>
    </div>
  );
};
