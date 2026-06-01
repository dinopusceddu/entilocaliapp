import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface Wizard2026FieldHelpProps {
  label: string;
  helpText: string;
  norma?: string;
}

export const Wizard2026FieldHelp: React.FC<Wizard2026FieldHelpProps> = ({ helpText, norma }) => {
  return (
    <div className="mt-1 text-xs text-slate-500 flex items-start gap-1">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <span>{helpText}</span>
        {norma && <span className="font-medium text-slate-600 ml-1">({norma})</span>}
      </div>
    </div>
  );
};
