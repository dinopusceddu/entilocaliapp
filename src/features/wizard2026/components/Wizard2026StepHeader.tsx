import React from 'react';

export interface Wizard2026StepHeaderProps {
  title: string;
  stepNumber: number;
  description?: string;
  subtitle?: string;
}

export const Wizard2026StepHeader: React.FC<Wizard2026StepHeaderProps> = ({
  title,
  stepNumber,
  description,
  subtitle,
}) => {
  return (
    <div className="border-b pb-6 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-sm border border-blue-200 shadow-sm">
          {stepNumber}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      {subtitle && <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-700 mb-2">{subtitle}</h3>}
      {description && <p className="text-slate-600 text-base leading-relaxed max-w-3xl">{description}</p>}
    </div>
  );
};
