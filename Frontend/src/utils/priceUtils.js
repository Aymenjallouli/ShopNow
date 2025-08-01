/**
 * Utilitaires pour la gestion des prix et des montants
 */

export const formatPrice = (price, currency = 'USD') => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price || 0);
  return numPrice.toFixed(2);
};

export const formatPriceWithCurrency = (price, currency = 'USD') => {
  const formatted = formatPrice(price);
  
  switch (currency) {
    case 'TND':
      return `${formatted} TND`;
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    default:
      return `${formatted} ${currency}`;
  }
};

export const calculateTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
    const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
    return total + (price * quantity);
  }, 0);
};

export const addDeliveryFee = (subtotal, deliveryFee) => {
  const numSubtotal = typeof subtotal === 'number' ? subtotal : parseFloat(subtotal || 0);
  const numDeliveryFee = typeof deliveryFee === 'number' ? deliveryFee : parseFloat(deliveryFee || 0);
  return numSubtotal + numDeliveryFee;
};

export const calculateTax = (amount, taxRate = 0.18) => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  const numTaxRate = typeof taxRate === 'number' ? taxRate : parseFloat(taxRate || 0);
  return numAmount * numTaxRate;
};

export const calculateDiscount = (amount, discountPercent) => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  const numDiscount = typeof discountPercent === 'number' ? discountPercent : parseFloat(discountPercent || 0);
  return numAmount * (numDiscount / 100);
};

export const isValidPrice = (price) => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0;
};

export const safeParseFloat = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};
