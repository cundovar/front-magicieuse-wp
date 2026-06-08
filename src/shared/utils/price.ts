/**
 * Formate un prix WooCommerce (montant en unites mineures) en chaine localisee.
 * WooCommerce renvoie les montants en centimes : "1500" = 15,00 EUR.
 */
export function formatWooPrice(
  amount: string,
  minorUnit: number,
  currencyCode: string,
): string {
  const value = parseInt(amount, 10) / 10 ** minorUnit
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  }).format(value)
}
