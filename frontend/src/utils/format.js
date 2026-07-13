export function formatPrice(value) {
  if (!value && value !== 0) return '-';
  const num = Number(value);
  if (isNaN(num)) return value;
  return Math.round(num).toLocaleString('fr-FR');
}
