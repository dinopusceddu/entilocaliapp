import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from './Button.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { generateExcelTemplate, parseExcelData } from '../../services/excelService.ts';

export const ExcelTools: React.FC = () => {
  const { state, dispatch, saveState } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

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
      
      // Dispatch the imported data
      dispatch({ type: 'IMPORT_FUND_DATA', payload: importedData });
      
      // Trigger a save to persist the imported data
      setTimeout(async () => {
        await saveState();
        alert('Dati importati e salvati con successo!');
      }, 100);

    } catch (error) {
      console.error('Error importing Excel:', error);
      alert('Errore durante l\'importazione del file Excel. Assicurati che il formato sia corretto.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900">Strumenti Excel</h4>
          <p className="text-xs text-blue-700">Scarica il modello, compilalo e ricaricalo per un inserimento rapido.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleExport}
          className="bg-white hover:bg-gray-50 text-blue-700 border-blue-200"
        >
          <Download size={16} className="mr-2" />
          Scarica Modello
        </Button>
        
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleImportClick}
          isLoading={isImporting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload size={16} className="mr-2" />
          Carica Dati
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx, .xls" 
          className="hidden" 
        />
      </div>
    </div>
  );
};
