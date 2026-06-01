import React from 'react';
import { Info, BookOpen } from 'lucide-react';

export interface Wizard2026InfoBoxProps {
  title: string;
  description: string | React.ReactNode;
  norma?: string;
  variant?: 'info' | 'warning' | 'success' | 'purple' | 'cgil';
}

export const Wizard2026InfoBox: React.FC<Wizard2026InfoBoxProps> = ({
  title,
  description,
  norma,
  variant = 'info',
}) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    cgil: 'bg-[#fff7f5] border-[#f3c7bf] text-[#6b1d14]',
  }[variant];

  const iconColors = {
    info: 'text-blue-600',
    warning: 'text-amber-600',
    success: 'text-green-600',
    purple: 'text-purple-600',
    cgil: 'text-[#cc4331]',
  }[variant];

  return (
    <div className={`border rounded-lg p-4 mb-6 shadow-sm ${styles}`}>
      <div className="flex items-start gap-3">
        <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors}`} />
        <div className="flex-1">
          <h4 className="font-semibold text-base mb-1">{title}</h4>
          <div className="text-sm leading-relaxed mb-2 opacity-90">{description}</div>
          {norma && (
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-75 pt-2 border-t border-black/10">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Riferimento normativo: {norma}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
