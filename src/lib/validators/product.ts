import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  businessId: z.string(),
  categoryId: z.string(),
  isAvailable: z.boolean().optional().default(true),
});

export type ProductInput = z.infer<typeof productSchema>; 