import React from 'react';

export interface Wizard2026LayoutProps {
  stepper: React.ReactNode;
  summaryPanel: React.ReactNode;
  children: React.ReactNode;
}

export const Wizard2026Layout: React.FC<Wizard2026LayoutProps> = ({
  stepper,
  summaryPanel,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Intestazione modulo attivo */}
      <div className="bg-slate-850 text-slate-200 px-4 py-2 sm:py-2.5 shadow-inner border-b border-slate-950 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="hidden sm:inline">
          Flusso 2026 attivo — Compilazione guidata per la raccolta dati dell’Ente e la determinazione dei fondi incentivanti.
        </span>
        <span className="inline sm:hidden">
          Flusso 2026 attivo — Raccolta dati.
        </span>
      </div>

      {/* Stepper di navigazione in alto */}
      <div className="sticky top-0 z-30 shadow-sm">
        {stepper}
      </div>

      {/* Corpo principale */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <main className="w-full flex-1 bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm min-h-[450px] sm:min-h-[600px] flex flex-col justify-between overflow-x-hidden">
          {children}
        </main>
        <aside className="w-full lg:w-96 flex-shrink-0 lg:sticky lg:top-36">
          {summaryPanel}
        </aside>
      </div>
    </div>
  );
};
