import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  image: z.instanceof(File, { message: "Main image is required" }),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  businessId: z.string(),
  categoryId: z.string(),
  isAvailable: z.boolean().optional().default(true),
  images: z.instanceof(File).array().optional(),
  videos: z.instanceof(File).array().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;