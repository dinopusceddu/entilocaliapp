import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { mapToTabella15 } from '../logic/calculation/tabella15Mapper';
import { useNormativeData } from '../hooks/useNormativeData';
import { Card } from '../components/shared/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/shared/Table';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Alert } from '../components/shared/Alert';
import { HelpCircle } from 'lucide-react';

export const Tabella15Page: React.FC = () => {
  const { state } = useAppContext();
  const { data: normativeData, isLoading: isNormativeLoading } = useNormativeData();
  const { calculationResult, isLoading: isAppLoading } = state;

  const tabella15Res = useMemo(() => {
    if (calculationResult && normativeData) {
      return mapToTabella15(calculationResult, normativeData);
    }
    return null;
  }, [calculationResult, normativeData]);

  if (isAppLoading || isNormativeLoading) {
    return <LoadingSpinner text="Generazione anteprima Tabella 15..." />;
  }

  if (!tabella15Res) {
    return (
      <Alert 
        type="warning" 
        title="Dati mancanti" 
        message="Esegui prima il calcolo del fondo per visualizzare l'anteprima della Tabella 15." 
      />
    );
  }

  const renderSection = (section: any) => (
    <div className="space-y-4 mb-8">
      <h3 className="text-xl font-bold text-primary flex items-center gap-2">
        {section.title}
        <span className="text-sm font-normal text-gray-400">(Totale: € {section.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })})</span>
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Colonna</TableHead>
            <TableHead>Descrizione Voce</TableHead>
            <TableHead className="text-right">Importo (€)</TableHead>
            <TableHead className="hidden md:table-cell">Provenienza</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {section.entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-400 italic">
                Nessuna voce mappata per questa sezione.
              </TableCell>
            </TableRow>
          ) : (
            section.entries.map((entry: any) => (
              <TableRow key={entry.key} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-bold text-primary">{entry.columnCode}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right font-mono">
                  {entry.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-gray-500 italic">
                  {entry.source}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-[#1b0e0e]">Anteprima Tabella 15</h1>
        <p className="text-gray-500 mt-2">
          Mapping istituzionale delle voci del fondo verso il Conto Annuale per l'anno {tabella15Res.year}.
        </p>
      </div>

      <Alert 
        type="info"
        title="Tracciabilità Canonica"
        message="I valori esposti derivano direttamente dal motore unico di calcolo. La Tabella 15 è un riflesso della costituzione del fondo e non introduce ricalcoli manuali."
      />

      <div className="grid grid-cols-1 gap-8">
        <Card className="p-6">
          {renderSection(tabella15Res.sections.stabile)}
          {renderSection(tabella15Res.sections.variabile)}
          
          <div className="mt-8 pt-6 border-t flex justify-between items-center bg-gray-50 -m-6 p-6 rounded-b-xl">
            <div className="flex items-center gap-2 text-gray-600">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm italic">Il totale Tabella 15 deve coincidere con il totale della costituzione del fondo.</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Totale Generale Tabella 15</p>
              <p className="text-4xl font-bold text-primary">€ {tabella15Res.grandTotal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
