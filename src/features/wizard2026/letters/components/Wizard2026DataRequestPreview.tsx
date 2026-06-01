import React from 'react';

interface Wizard2026DataRequestPreviewProps {
  markdown: string;
}

export const Wizard2026DataRequestPreview: React.FC<Wizard2026DataRequestPreviewProps> = ({ markdown }) => {
  return (
    <div className="border border-slate-200 rounded-lg bg-slate-50 p-4 max-h-96 overflow-y-auto select-text">
      <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed">
        {markdown}
      </pre>
    </div>
  );
};
