import { z } from 'zod';

export const userSignUpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  universityId: z.string().min(2),
});

export type UserSignUpInput = z.infer<typeof userSignUpSchema>;

export const userSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type UserSignInInput = z.infer<typeof userSignInSchema>;