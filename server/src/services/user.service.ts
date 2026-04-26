import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';
import { hashPassword } from '../utils/password.js';

export async function getUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at', { count: 'exact' });

  if (params.role) {
    query = query.eq('role', params.role);
  }

  if (params.isActive !== undefined) {
    query = query.eq('is_active', params.isActive);
  }

  if (params.search) {
    query = query.or(
      `email.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`
    );
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new AppError(error.message, 500);

  return { data: data ?? [], total: count ?? 0, page, limit };
}

export async function getUserById(id: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at, profiles(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!user) throw new AppError('User not found', 404);

  return user;
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  const email = data.email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (existing) throw new AppError('Email already in use', 409);

  const password_hash = await hashPassword(data.password);

  const { data: user, error: insertError } = await supabase
    .from('users')
    .insert({
      email,
      password_hash,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
    })
    .select('id, email, first_name, last_name, role, is_active, created_at, updated_at')
    .single();

  if (insertError) throw new AppError(insertError.message, 500);

  // Create empty profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ user_id: user.id });

  if (profileError) throw new AppError(profileError.message, 500);

  return user;
}

export async function updateUser(
  id: string,
  data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
  }
) {
  // If email is being changed, check uniqueness
  if (data.email) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const { data: existing, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .ilike('email', normalizedEmail)
      .neq('id', id)
      .maybeSingle();

    if (lookupError) throw new AppError(lookupError.message, 500);
    if (existing) throw new AppError('Email already in use', 409);
  }

  // Map camelCase to snake_case
  const updateFields: Record<string, unknown> = {};
  if (data.email !== undefined) updateFields.email = data.email.trim().toLowerCase();
  if (data.firstName !== undefined) updateFields.first_name = data.firstName;
  if (data.lastName !== undefined) updateFields.last_name = data.lastName;
  if (data.role !== undefined) updateFields.role = data.role;
  if (data.isActive !== undefined) updateFields.is_active = data.isActive;

  const { data: user, error } = await supabase
    .from('users')
    .update(updateFields)
    .eq('id', id)
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at')
    .single();

  if (error) throw new AppError(error.message, 500);

  return user;
}

export async function deactivateUser(id: string) {
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
}

export async function deleteUser(id: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw new AppError(error.message, 500);
}
