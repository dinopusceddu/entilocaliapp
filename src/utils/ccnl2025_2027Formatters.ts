export const euro = (n: number, digits = 2): string => n.toLocaleString('it-IT', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits,
});
