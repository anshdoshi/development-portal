import { z } from 'zod';

export const updateProfileSchema = z.object({
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
