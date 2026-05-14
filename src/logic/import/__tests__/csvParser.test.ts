import { describe, it, expect } from 'vitest';
import { parseCsv, parseItalianNumber, parseBoolean } from '../csvParser.ts';

describe('csvParser', () => {
    describe('parseCsv', () => {
        it('should parse a basic CSV string with semicolon delimiter', () => {
            const csv = 'col1;col2\nval1;val2';
            const result = parseCsv(csv);
            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toEqual({ col1: 'val1', col2: 'val2' });
            expect(result.headers).toEqual(['col1', 'col2']);
        });

        it('should trim headers and values', () => {
            const csv = ' col1 ; col2 \n val1 ; val2 ';
            const result = parseCsv(csv);
            expect(result.data[0]).toEqual({ col1: 'val1', col2: 'val2' });
        });

        it('should handle empty lines', () => {
            const csv = 'col1;col2\n\nval1;val2\n\n';
            const result = parseCsv(csv);
            expect(result.data).toHaveLength(1);
        });

        it('should report column count mismatch', () => {
            const csv = 'col1;col2\nval1;val2;val3';
            const result = parseCsv(csv);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain('Numero di colonne non corrispondente');
        });
    });

    describe('parseItalianNumber', () => {
        it('should parse standard decimal points', () => {
            expect(parseItalianNumber('1234.56')).toBe(1234.56);
        });

        it('should parse Italian comma decimals', () => {
            expect(parseItalianNumber('1234,56')).toBe(1234.56);
        });

        it('should parse Italian thousands separator with comma decimal', () => {
            expect(parseItalianNumber('1.234,56')).toBe(1234.56);
        });

        it('should parse values with spaces', () => {
            expect(parseItalianNumber(' 1 234,56 ')).toBe(1234.56);
        });

        it('should return undefined for invalid strings', () => {
            expect(parseItalianNumber('test')).toBeUndefined();
            expect(parseItalianNumber('')).toBeUndefined();
        });
    });

    describe('parseBoolean', () => {
        it('should handle standard true/false', () => {
            expect(parseBoolean('true')).toBe(true);
            expect(parseBoolean('false')).toBe(false);
            expect(parseBoolean('1')).toBe(true);
            expect(parseBoolean('0')).toBe(false);
        });

        it('should handle Italian terms', () => {
            expect(parseBoolean('Sì')).toBe(true);
            expect(parseBoolean('si')).toBe(true);
            expect(parseBoolean('No')).toBe(false);
        });

        it('should return undefined for unknown strings', () => {
            expect(parseBoolean('maybe')).toBeUndefined();
        });
    });
});
