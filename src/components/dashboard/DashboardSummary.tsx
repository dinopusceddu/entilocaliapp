import { presentArt23Verification } from '../../domain/art23Verification';
import React from 'react';
import { CalculationResult } from '../../domain';
import { Card } from '../shared/Card.tsx';
import { TEXTS_UI } from '../../constants.ts';

interface DashboardSummaryProps {
  calculationResult?: CalculationResult;
  annoRiferimento: number;
}

import { formatCurrency } from '../../utils/formatters.ts';

const TrendIndicator: React.FC<{ current: number, previous?: number }> = ({ current, previous }) => {
  if (previous === undefined || previous === null || previous === 0) {
    return null;
  }
  const change = ((current - previous) / previous) * 100;
  if (isNaN(change)) return null;

  const isPositive = change >= 0;
  const colorClass = isPositive ? 'text-green-600' : 'text-[#c02128]';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <span className={`text-sm font-semibold ml-2 ${colorClass} inline-flex items-center`}>
      {arrow} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

const SummaryItem: React.FC<{ label: string; value?: number | null; previousValue?: number; isAlert?: boolean; className?: string; valueClassName?: string }> = ({ label, value, previousValue, isAlert = false, className = '', valueClassName = '' }) => {
  return (
    <div className={`p-4 rounded-lg border ${className}`}>
      <h4 className="text-sm font-medium text-[#5f5252] flex items-center">
        {label}
        {previousValue !== undefined && value !== undefined && value !== null && <TrendIndicator current={value} previous={previousValue} />}
      </h4>
      <p className={`text-2xl font-bold ${valueClassName} ${isAlert ? 'text-[#c02128]' : 'text-[#1b0e0e]'}`}>
        {value === null || value === undefined ? 'Non determinabile' : formatCurrency(value)}
      </p>
    </div>
  )
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ calculationResult, annoRiferimento }) => {
  if (!calculationResult) {
    return (
      <Card title={`Riepilogo Fondo ${annoRiferimento}`}>
        <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} Effettuare prima il calcolo dalla sezione "Dati Costituzione Fondo".</p>
      </Card>
    );
  }

  const { canonicalFund, compliance } = calculationResult;
  const art23 = compliance.art23c2;
  const art23View = presentArt23Verification(calculationResult);

  return (
    <Card title={`Ammontare del fondo del personale dipendente nel ${annoRiferimento}`} className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryItem
          label="Totale Parte Stabile"
          value={canonicalFund.stableTotal}
          className="bg-[#fcf8f8] border-[#f3e7e8]"
        />
        <SummaryItem
          label="Totale Parte Variabile"
          value={canonicalFund.variableTotal}
          className="bg-[#fcf8f8] border-[#f3e7e8]"
        />
        <SummaryItem
          label={`Totale Fondo ${annoRiferimento}`}
          value={canonicalFund.total}
          className="bg-[#f3e7e8] border-[#d1c0c1]"
          valueClassName="text-[#ea2832]"
        />
        {!art23View.ready && <p role="status">Verifica Art. 23: {art23View.label}. Completare i prerequisiti.</p>}
        {art23View.isOverLimit && (
          <SummaryItem
            label="Superamento Limite 2016"
            value={Math.abs(art23.delta)}
            isAlert={true}
            className="md:col-span-3 bg-[#fef2f2] border-[#fecaca]"
          />
        )}
      </div>
    </Card>
  );
};
