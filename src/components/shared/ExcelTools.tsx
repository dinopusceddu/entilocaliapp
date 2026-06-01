import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, FileDown, FileText } from 'lucide-react';
import { Button } from './Button.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { generateExcelTemplate, parseExcelData } from '../../services/excelService.ts';
import { CsvImportModal } from '../import/CsvImportModal.tsx';
import { RequestDataLetterModal } from '../letters/RequestDataLetterModal.tsx';

export interface ExcelToolsProps {
  onImportCsv?: (mappedData: any) => void;
  onImportExcel?: (importedData: any) => void;
}

export const ExcelTools: React.FC<ExcelToolsProps> = ({ onImportCsv, onImportExcel }) => {
  const { state, dispatch, saveState } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);


  const handleExport = () => {
    generateExcelTemplate(state.fundData);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedData = await parseExcelData(file);
      
      if (onImportExcel) {
        onImportExcel(importedData);
      } else {
        // Default behavior: Dispatch the imported data to global state
        dispatch({ type: 'IMPORT_FUND_DATA', payload: importedData });
        
        // Trigger a save to persist the imported data
        setTimeout(async () => {
          await saveState();
          alert('Dati importati e salvati con successo!');
        }, 100);
      }

    } catch (error) {
      console.error('Error importing Excel:', error);
      alert('Errore durante l\'importazione del file Excel. Assicurati che il formato sia corretto.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadCsvTemplate = () => {
    const header = "anno;denominazione_ente;tipologia_ente;numero_abitanti;has_dirigenza;monte_salari_2021;fondo_personale_2016;fondo_eq_2016;fondo_dirigenza_2016;risorse_segretario_2016;fondo_straordinario_2016;fondo_personale_2018;fondo_eq_2018;personale_fte_2018;stipendi_tabellari_2023;spesa_personale_2023;media_entrate_correnti;tetto_spesa_l296;costo_assunzioni_piao";
    const example = "2026;Comune di Esempio;COMUNE;15000;false;5000000.00;120000.00;15000.00;0.00;12000.00;10000.00;115000.00;14000.00;12.5;1500000.00;2000000.00;8000000.00;1800000.00;70000.00";
    const csvContent = `${header}\n${example}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_dati_generali.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">Strumenti import/export</h4>
          <p className="text-xs text-blue-700">Genera la lettera di richiesta dati, importa i dati iniziali da CSV o gestisci il backup completo in Excel.</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setIsLetterModalOpen(true)}
          className="bg-white hover:bg-gray-50 text-blue-700 border-blue-200"
        >
          <FileText size={16} className="mr-2" />
          Genera lettera richiesta dati
        </Button>

        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleExport}
          className="bg-white hover:bg-gray-50 text-blue-700 border-blue-200"
        >
          <Download size={16} className="mr-2" />
          Scarica backup Excel completo
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={downloadCsvTemplate}
          className="bg-white hover:bg-gray-50 text-blue-700 border-blue-200"
        >
          <FileDown size={16} className="mr-2" />
          Scarica template CSV dati ente
        </Button>

        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setIsCsvModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload size={16} className="mr-2" />
          Importa CSV dati ente
        </Button>

        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleImportClick}
          isLoading={isImporting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload size={16} className="mr-2" />
          Carica backup Excel completo
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx, .xls" 
          className="hidden" 
        />
      </div>

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        currentFundData={state.fundData}
        selectedYear={state.fundData.annualData.annoRiferimento}
        onImportConfirmed={(mappedData) => {
          if (onImportCsv) {
            onImportCsv(mappedData);
          } else {
            dispatch({ type: 'IMPORT_DATI_GENERALI_CSV', payload: mappedData });
          }
        }}
      />

      <RequestDataLetterModal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
      />
    </div>
  );
};
