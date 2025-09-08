// pages/CompliancePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card } from '../components/shared/Card';
import { TEXTS_UI } from '../constants';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Button } from '../components/shared/Button';
import { ComplianceCheck } from '../types';

const getIconForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return '❌';
  if (gravita === 'warning') return '⚠️';
  return 'ℹ️';
};

const getStylesForGravita = (gravita: 'info' | 'warning' | 'error'): { card: string; title: string; iconText: string } => {
  if (gravita === 'error') return { 
    card: 'bg-[#fef2f2] border-[#fecaca]',
    title: 'text-[#991b1b]',
    iconText: 'text-[#ef4444]'
  };
  if (gravita === 'warning') return { 
    card: 'bg-[#fffbeb] border-[#fde68a]',
    title: 'text-[#92400e]',
    iconText: 'text-[#f59e0b]'
  };
  return { 
    card: 'bg-[#eff6ff] border-[#bfdbfe]',
    title: 'text-[#1e40af]',
    iconText: 'text-[#3b82f6]'
  };
};

export const CompliancePage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { complianceChecks, isLoading } = state;

  if (isLoading && (!complianceChecks || complianceChecks.length === 0)) {
    return <LoadingSpinner text="Caricamento controlli di conformità..." />;
  }

  if (!complianceChecks || complianceChecks.length === 0) {
    return (
      <Card title="Controllo dei limiti">
        <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} Nessun controllo di conformità eseguito o dati non disponibili. Effettuare il calcolo del fondo.</p>
      </Card>
    );
  }

  const criticalIssues = complianceChecks.filter(c => c.gravita === 'error');
  const warnings = complianceChecks.filter(c => c.gravita === 'warning');
  const infos = complianceChecks.filter(c => c.gravita === 'info');

  const renderCheck = (check: ComplianceCheck) => (
    <div key={check.id} className={`p-4 mb-3 border rounded-lg ${getStylesForGravita(check.gravita).card}`}>
      <div className="flex items-start">
        <span className={`text-2xl mr-3 ${getStylesForGravita(check.gravita).iconText}`}>
          {getIconForGravita(check.gravita)}
        </span>
        <div className="flex-1">
          <h5 className={`font-semibold ${getStylesForGravita(check.gravita).title}`}>
            {check.descrizione}
          </h5>
          <p className="text-sm text-[#1b0e0e]">{check.messaggio}</p>
          <p className="text-xs text-[#5f5252] mt-1">
            Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}
          </p>
          {check.relatedPage && check.gravita !== 'info' && (
            <div className="mt-2">
                <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs"
                    onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: check.relatedPage! })}
                >
                    Vai alla correzione →
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Controllo dei limiti</h2>
      
      {(criticalIssues.length > 0) && (
        <Card title="Criticità Rilevate" className="border-l-4 border-[#ea2832]">
            {criticalIssues.map(renderCheck)}
        </Card>
      )}

      {(warnings.length > 0) && (
        <Card title="Avvisi da Verificare" className="border-l-4 border-amber-500">
            {warnings.map(renderCheck)}
        </Card>
      )}

      {(infos.length > 0) && (
        <Card title="Informazioni" className="border-l-4 border-blue-500">
            {infos.map(renderCheck)}
        </Card>
      )}
    </div>
  );
};