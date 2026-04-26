import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export async function getProfile(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at, profiles(*)')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!user) throw new AppError('User not found', 404);

  return user;
}

export async function updateProfile(
  userId: string,
  data: { phone?: string; company?: string; jobTitle?: string; address?: string; bio?: string }
) {
  const updateFields: Record<string, unknown> = {};
  if (data.phone !== undefined) updateFields.phone = data.phone;
  if (data.company !== undefined) updateFields.company = data.company;
  if (data.jobTitle !== undefined) updateFields.job_title = data.jobTitle;
  if (data.address !== undefined) updateFields.address = data.address;
  if (data.bio !== undefined) updateFields.bio = data.bio;

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updateFields)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw new AppError(error.message, 500);

  return profile;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (fetchError) throw new AppError(fetchError.message, 500);

  const valid = await comparePassword(currentPassword, user.password_hash);
  if (!valid) throw new AppError('Current password is incorrect', 400);

  const password_hash = await hashPassword(newPassword);

  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('id', userId);

  if (updateError) throw new AppError(updateError.message, 500);
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  const { data: user, error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at')
    .single();

  if (error) throw new AppError(error.message, 500);

  return user;
}
