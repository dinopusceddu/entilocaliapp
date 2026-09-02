// src/logic/validation.ts
import { FundDataSchema } from '../schemas/fundDataSchemas.ts';
import { FundData } from '../domain';
import { z, ZodIssue } from 'zod';
import { resolveArt33AnnualDataPolicy } from './shared/art33ApplicationPolicy';

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
