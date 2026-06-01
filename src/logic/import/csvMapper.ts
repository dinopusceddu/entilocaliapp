import { FundData, AnnualData, HistoricalData, SimulatoreIncrementoInput, Ccnl2024Settings } from '../../domain/types';
import { ImportDatiGeneraliRow } from '../../schemas/importSchema';

export interface ImportPreviewRow {
    field: string;
    path: string;
    currentValue: any;
    importedValue: any;
    status: 'invariato' | 'modificato' | 'nuovo' | 'warning' | 'errore';
    message?: string;
}

/**
 * Mappa una riga CSV validata nel modello FundData dell'applicazione.
 */
export const mapCsvRowToFundData = (
    row: ImportDatiGeneraliRow,
    currentData: FundData
): { mappedData: Partial<FundData>; previewRows: ImportPreviewRow[] } => {
    const previewRows: ImportPreviewRow[] = [];

    // Helper per tracciare le modifiche e costruire l'oggetto mappato
    const trackChange = (
        fieldLabel: string,
        path: string,
        current: any,
        imported: any,
        statusOverride?: 'warning' | 'errore'
    ): any => {
        const status = statusOverride || (current === imported || (current === undefined && imported === undefined) ? 'invariato' : 'modificato');
        
        previewRows.push({
            field: fieldLabel,
            path,
            currentValue: current,
            importedValue: imported,
            status: status as any
        });
        
        return imported;
    };

    // Costruzione del nuovo oggetto (Partial)
    const newHistoricalData: Partial<HistoricalData> = {
        fondoSalarioAccessorioPersonaleNonDirEQ2016: trackChange('Fondo Personale 2016', 'historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016', currentData.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016, row.fondo_personale_2016),
        fondoElevateQualificazioni2016: trackChange('Fondo EQ 2016', 'historicalData.fondoElevateQualificazioni2016', currentData.historicalData.fondoElevateQualificazioni2016, row.fondo_eq_2016),
        fondoDirigenza2016: trackChange('Fondo Dirigenza 2016', 'historicalData.fondoDirigenza2016', currentData.historicalData.fondoDirigenza2016, row.fondo_dirigenza_2016),
        risorseSegretarioComunale2016: trackChange('Risorse Segretario 2016', 'historicalData.risorseSegretarioComunale2016', currentData.historicalData.risorseSegretarioComunale2016, row.risorse_segretario_2016),
        fondoStraordinario2016: trackChange('Fondo Straordinario 2016', 'historicalData.fondoStraordinario2016', currentData.historicalData.fondoStraordinario2016, row.fondo_straordinario_2016),
        fondoPersonaleNonDirEQ2018_Art23: trackChange('Fondo Personale 2018', 'historicalData.fondoPersonaleNonDirEQ2018_Art23', currentData.historicalData.fondoPersonaleNonDirEQ2018_Art23, row.fondo_personale_2018),
        fondoEQ2018_Art23: trackChange('Fondo EQ 2018', 'historicalData.fondoEQ2018_Art23', currentData.historicalData.fondoEQ2018_Art23, row.fondo_eq_2018),
    };

    const newSimulatoreInput: Partial<SimulatoreIncrementoInput> = {
        simStipendiTabellari2023: trackChange('Stipendi Tabellari 2023', 'annualData.simulatoreInput.simStipendiTabellari2023', currentData.annualData.simulatoreInput.simStipendiTabellari2023, row.stipendi_tabellari_2023),
        simSpesaPersonaleConsuntivo2023: trackChange('Spesa Personale 2023', 'annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023', currentData.annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023, row.spesa_personale_2023),
        simMediaEntrateCorrenti2021_2023: trackChange('Media Entrate Correnti 21-23', 'annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023', currentData.annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023, row.media_entrate_correnti),
        simTettoSpesaPersonaleL296_06: trackChange('Tetto Spesa L. 296/06', 'annualData.simulatoreInput.simTettoSpesaPersonaleL296_06', currentData.annualData.simulatoreInput.simTettoSpesaPersonaleL296_06, row.tetto_spesa_l296),
        simCostoAnnuoNuoveAssunzioniPIAO: trackChange('Costo Assunzioni PIAO', 'annualData.simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO', currentData.annualData.simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO, row.costo_assunzioni_piao),
    };

    const newCcnl2024: Partial<Ccnl2024Settings> = {
        ...currentData.annualData.ccnl2024,
        monteSalari2021: trackChange('Monte Salari 2021', 'annualData.ccnl2024.monteSalari2021', currentData.annualData.ccnl2024?.monteSalari2021, row.monte_salari_2021),
    };

    const newAnnualData: Partial<AnnualData> = {
        annoRiferimento: trackChange('Anno Riferimento', 'annualData.annoRiferimento', currentData.annualData.annoRiferimento, row.anno),
        denominazioneEnte: trackChange('Denominazione Ente', 'annualData.denominazioneEnte', currentData.annualData.denominazioneEnte, row.denominazione_ente),
        tipologiaEnte: trackChange('Tipologia Ente', 'annualData.tipologiaEnte', currentData.annualData.tipologiaEnte, row.tipologia_ente),
        numeroAbitanti: trackChange('Numero Abitanti', 'annualData.numeroAbitanti', currentData.annualData.numeroAbitanti, row.numero_abitanti),
        hasDirigenza: trackChange('Presenza Dirigenza', 'annualData.hasDirigenza', currentData.annualData.hasDirigenza, row.has_dirigenza),
        fondoLavoroStraordinario: trackChange('Fondo Straordinario 2016', 'annualData.fondoLavoroStraordinario', currentData.annualData.fondoLavoroStraordinario, row.fondo_straordinario_2016),
        manualDipendentiEquivalenti2018: trackChange('Personale FTE 2018', 'annualData.manualDipendentiEquivalenti2018', currentData.annualData.manualDipendentiEquivalenti2018, row.personale_fte_2018),
        simulatoreInput: { ...currentData.annualData.simulatoreInput, ...newSimulatoreInput },
        ccnl2024: newCcnl2024 as Ccnl2024Settings,
    };

    const mappedData: Partial<FundData> = {
        historicalData: { ...currentData.historicalData, ...newHistoricalData },
        annualData: { ...currentData.annualData, ...newAnnualData } as AnnualData,
    };

    // Aggiungiamo warning specifici post-mapping
    if (row.has_dirigenza && (!row.fondo_dirigenza_2016 || row.fondo_dirigenza_2016 === 0)) {
        const idx = previewRows.findIndex(r => r.path === 'historicalData.fondoDirigenza2016');
        if (idx !== -1) {
            previewRows[idx].status = 'warning';
            previewRows[idx].message = 'Presenza dirigenza dichiarata ma fondo 2016 assente o zero.';
        }
    }

    if (row.media_entrate_correnti && row.spesa_personale_2023 && row.media_entrate_correnti < row.spesa_personale_2023) {
        const idx = previewRows.findIndex(r => r.path === 'annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023');
        if (idx !== -1) {
            previewRows[idx].status = 'warning';
            previewRows[idx].message = 'Media entrate inferiore alla spesa personale 2023.';
        }
    }

    return { mappedData, previewRows };
};
