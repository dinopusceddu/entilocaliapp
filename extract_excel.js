import XLSX from 'xlsx';

const filePath = 'C:\\Users\\pusceddud\\Documents\\salarioaccessorio08092025\\fileprogetto\\Nuovi-Fondi-Salario-Accessorio-Funzioni-Locali-2026.xls';

try {
    const workbook = XLSX.readFile(filePath);

    const sheetNamesToCheck = ['comparto', 'eq', 'segretario', 'dirigenza'];

    for (const sheetName of sheetNamesToCheck) {
        console.log(`\n\n================================`);
        console.log(`SHEET: ${sheetName}`);
        console.log(`================================`);
        const worksheet = workbook.Sheets[sheetName];
        // Get data and formulas
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            // Only print rows that seem to have some text in the first columns
            if (row && row.length > 0) {
                const hasContent = row.some(cell => cell && cell.toString().trim() !== '');
                if (hasContent) {
                    console.log(`Row ${i + 1}:`, row);
                }
            }
        }
    }

} catch (error) {
    console.error("Error reading excel file:", error);
}
