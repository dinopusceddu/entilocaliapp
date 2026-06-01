import React from 'react';

interface Wizard2026YesNoFieldProps {
  label: string;
  value: boolean | undefined;
  onChange: (val: boolean) => void;
  description?: string | React.ReactNode;
  infoAction?: React.ReactNode;
  className?: string;
  testId?: string;
}

export const Wizard2026YesNoField: React.FC<Wizard2026YesNoFieldProps> = ({
  label,
  value,
  onChange,
  description,
  infoAction,
  className = '',
  testId,
}) => {
  return (
    <div className={`p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 ${className}`} data-testid={testId}>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-bold text-slate-800 leading-tight">
            {label}
          </label>
          {infoAction}
        </div>
        {description && (
          <div className="text-xs text-slate-500 leading-relaxed pr-2">
            {description}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 w-full mt-auto">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 h-11 min-h-[44px] px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500/40 flex items-center justify-center ${
            value === true
              ? 'bg-slate-800 text-white border border-slate-800 shadow-sm'
              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
          data-testid={`${testId || 'yesno'}-yes`}
        >
          Sì
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 h-11 min-h-[44px] px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500/40 flex items-center justify-center ${
            value === false
              ? 'bg-slate-800 text-white border border-slate-800 shadow-sm'
              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
          data-testid={`${testId || 'yesno'}-no`}
        >
          No
        </button>
      </div>
    </div>
  );
};
