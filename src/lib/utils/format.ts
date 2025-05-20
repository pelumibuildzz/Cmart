export const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};