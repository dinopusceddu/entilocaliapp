// src/logic/validation.ts
import { FundDataSchema } from '../schemas/fundDataSchemas.ts';
import { FundData, TipologiaEnte } from '../domain';
import { z, ZodIssue } from 'zod';

const getPath = (path: (string | number | symbol)[]): string => {
    return path.map(String).join('.');
};

export const validateFundData = (fundData: FundData): Record<string, string> => {
    
    const refinedSchema = FundDataSchema.superRefine((data, ctx) => {
        const isComuneOrProvincia = data.annualData.tipologiaEnte === TipologiaEnte.COMUNE || data.annualData.tipologiaEnte === TipologiaEnte.PROVINCIA;

        // --- General validations (always required) ---
        if (!data.annualData.denominazioneEnte || data.annualData.denominazioneEnte.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La denominazione dell'ente è obbligatoria.",
                path: ["annualData", "denominazioneEnte"],
            });
        }
        if (data.annualData.tipologiaEnte === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La tipologia di ente è obbligatoria.",
                path: ["annualData", "tipologiaEnte"],
            });
        }
        if (data.annualData.hasDirigenza === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Specificare se l'ente ha personale dirigente.",
                path: ["annualData", "hasDirigenza"],
            });
        }
        if (data.historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 === undefined) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Questo campo è obbligatorio per definire il limite storico.",
                path: ["historicalData", "fondoSalarioAccessorioPersonaleNonDirEQ2016"],
            });
        }

        // --- Conditional validations for Comune or Provincia ---
        if (isComuneOrProvincia) {
            // Rimosso controllo bloccante su numero abitanti su richiesta utente. Un avviso non bloccante è mostrato nell'interfaccia.

            // Adeguamento Limite Fondo 2016 fields
            if (data.historicalData.fondoPersonaleNonDirEQ2018_Art23 === undefined) {
                 ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Campo obbligatorio per Comuni e Province per il calcolo dell'adeguamento.",
                    path: ["historicalData", "fondoPersonaleNonDirEQ2018_Art23"],
                });
            }
        }
    });

    const result = refinedSchema.safeParse(fundData);
    
    if (result.success) {
        return {};
    } else {
        return result.error.issues.reduce((acc: Record<string, string>, issue: ZodIssue) => {
            const pathKey = `fundData.${getPath(issue.path)}`;
            if(pathKey) {
                acc[pathKey] = issue.message;
            }
            return acc;
        }, {});
    }
};
