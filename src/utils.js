const { URL } = require('url');

function formatAmount(amountCents, currency) {
  if (!Number.isFinite(amountCents)) {
    return '';
  }
  const normalized = (amountCents / 100).toFixed(2);
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(Number(normalized));
  } catch (error) {
    return `${normalized} ${currency.toUpperCase()}`;
  }
}

function safeUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch (error) {
    return null;
  }
}

module.exports = {
  formatAmount,
  safeUrl
};
