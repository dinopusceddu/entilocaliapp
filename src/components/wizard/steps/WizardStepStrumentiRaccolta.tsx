import React from 'react';
import { Card } from '../../shared/Card';
import { ExcelTools } from '../../shared/ExcelTools';
import { FundData } from '../../../domain/types';
import { FileText, FileSpreadsheet, Info } from 'lucide-react';

interface WizardStepStrumentiRaccoltaProps {
  onImportCsv: (mappedData: Partial<FundData>) => void;
  onImportExcel: (importedData: FundData) => void;
}

export const WizardStepStrumentiRaccolta: React.FC<WizardStepStrumentiRaccoltaProps> = ({ 
  onImportCsv, 
  onImportExcel 
}) => {
  return (
    <div className="space-y-6">
      <Card title="Strumenti di Raccolta Dati">
        <p className="text-sm text-gray-600 mb-6">
          Utilizza questi strumenti per pre-compilare i dati dell'ente in modo rapido. 
          Puoi importare un file CSV con i dati generali o caricare un backup Excel completo se lo hai già a disposizione.
        </p>
        
        <ExcelTools 
          onImportCsv={onImportCsv}
          onImportExcel={onImportExcel}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold">
              <FileText size={18} />
              <span>CSV Dati Ente</span>
            </div>
            <p className="text-xs text-gray-500">
              Ideale per la <strong>configurazione iniziale rapida</strong>. Contiene solo i campi relativi alla sezione Dati Generali.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2 text-green-700 font-bold">
              <FileSpreadsheet size={18} />
              <span>Backup Excel Completo</span>
            </div>
            <p className="text-xs text-gray-500">
              Utilizzato per il <strong>ripristino totale</strong> dello stato del fondo, inclusi tutti i calcoli e le distribuzioni.
            </p>
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
        <Info className="text-blue-500 shrink-0" size={20} />
        <div className="text-sm text-blue-800">
          <strong>Suggerimento:</strong> Se non hai ancora i dati sottomano, usa il pulsante 
          <span className="font-semibold"> "Genera lettera richiesta dati"</span> per creare un documento da inviare agli uffici competenti.
        </div>
      </div>
    </div>
  );
};
