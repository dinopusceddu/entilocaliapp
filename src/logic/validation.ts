// src/logic/validation.ts
import { FundDataSchema } from '../schemas/fundDataSchemas.ts';
import { FundData } from '../domain';
import { z, ZodIssue } from 'zod';
import { resolveArt33AnnualDataPolicy } from './shared/art33ApplicationPolicy';
import { calculateArt23Fte } from './shared/art23Fte';

const getPath = (path: (string | number | symbol)[]): string => {
    return path.map(String).join('.');
};

export const validateFundData = (fundData: FundData): Record<string, string> => {
    
    const refinedSchema = FundDataSchema.superRefine((data, ctx) => {

        // --- General validations (always required) ---
        if (!data.annualData.denominazioneEnte || data.annualData.denominazioneEnte.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La denominazione dell'ente è obbligatoria.",
                path: ["annualData", "denominazioneEnte"],
            });
        }
        if (
            data.annualData.tipologiaEnte === undefined &&
            !data.annualData.entityClassification?.entityType
        ) {
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

        const art33Policy = resolveArt33AnnualDataPolicy(data.annualData);

        if (art33Policy.action === 'BLOCK') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "L'applicabilità dell'adeguamento Art. 33 richiede una verifica manuale. Completa la classificazione dell'ente e indica se applicare o non applicare l'adeguamento prima di procedere al calcolo.",
                path: ["annualData", "art33ManualDecision"],
            });
        }

        // Adeguamento Limite Fondo 2016 fields: obbligatorio solo se l'adeguamento Art. 33 è da applicare (APPLY)
        if (art33Policy.action === 'APPLY') {
            if (data.historicalData.fondoPersonaleNonDirEQ2018_Art23 === undefined) {
                 ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Campo obbligatorio per il calcolo dell'adeguamento Art. 33.",
                    path: ["historicalData", "fondoPersonaleNonDirEQ2018_Art23"],
                });
            }
        }

        // --- Validazione FTE Art. 23 canonica per il personale analitico selezionato ---
        const globalPersonnelManualMode =
            !!data.personaleServizio?.isManualMode;

        const isArt23FteManualMode =
            data.annualData.isArt23FteManualMode
            ?? globalPersonnelManualMode;

        // Validazione lista analitica 2018 se è la sorgente effettiva
        if (
            (!isArt23FteManualMode || data.annualData.manualDipendentiEquivalenti2018 === undefined) &&
            data.annualData.personale2018PerArt23
        ) {
            const fte2018Result = calculateArt23Fte(data.annualData.personale2018PerArt23, 'REFERENCE_2018');
            fte2018Result.issues.forEach((issue) => {
                if (issue.code === 'INVALID_PART_TIME') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "La percentuale part-time deve essere maggiore di 0 e non superiore a 100.",
                        path: ["annualData", "personale2018PerArt23", issue.index, "partTimePercentage"],
                    });
                }
            });
        }

        // Validazione lista analitica corrente se è la sorgente effettiva
        const manualCurrentFte =
            data.annualData.manualDipendentiEquivalentiAnnoRif
            ?? data.personaleServizio?.manualDipendentiEquivalenti;

        if (
            (!isArt23FteManualMode || manualCurrentFte === undefined) &&
            data.annualData.personaleAnnoRifPerArt23
        ) {
            const fteCurrResult = calculateArt23Fte(data.annualData.personaleAnnoRifPerArt23, 'CURRENT_YEAR');
            fteCurrResult.issues.forEach((issue) => {
                if (issue.code === 'INVALID_PART_TIME') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "La percentuale part-time deve essere maggiore di 0 e non superiore a 100.",
                        path: ["annualData", "personaleAnnoRifPerArt23", issue.index, "partTimePercentage"],
                    });
                } else if (issue.code === 'INVALID_CEDOLINI') {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Il numero di cedolini deve essere un intero compreso tra 1 e 12.",
                        path: ["annualData", "personaleAnnoRifPerArt23", issue.index, "cedoliniEmessi"],
                    });
                }
            });
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
