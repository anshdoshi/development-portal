import { z } from 'zod';

const statusEnum = z.enum([
  'not_started',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
]);

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: statusEnum.default('not_started'),
  clientId: z.string().uuid('Invalid client ID').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const assignUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AssignUserInput = z.infer<typeof assignUserSchema>;
