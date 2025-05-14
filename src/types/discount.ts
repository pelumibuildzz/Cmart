export enum DiscountTier {
  NONE = "NONE",      // 0-4 orders
  BRONZE = "BRONZE",  // 5-9 orders: 10% discount
//   SILVER = "SILVER", // 10-19 orders: 10% discount
//   GOLD = "GOLD"      // 20+ orders: 15% discount
}

export const DISCOUNT_RULES = {
  [DiscountTier.NONE]: {
    minOrders: 0,
    percentage: 0
  },
  [DiscountTier.BRONZE]: {
    minOrders: 5,
    percentage: 10
  },
//   [DiscountTier.SILVER]: {
//     minOrders: 10,
//     percentage: 10
//   },
//   [DiscountTier.GOLD]: {
//     minOrders: 20,
//     percentage: 15
//   }
};