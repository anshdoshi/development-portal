import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';
import { hashPassword } from '../utils/password.js';

export async function getClients(params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at', { count: 'exact' })
    .eq('role', 'client');

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

export async function getClientById(id: string) {
  const { data: client, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at, profiles(*)')
    .eq('id', id)
    .eq('role', 'client')
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!client) throw new AppError('Client not found', 404);

  return client;
}

export async function createClient(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const email = data.email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (existing) throw new AppError('Email already in use', 409);

  const password_hash = await hashPassword(data.password);

  const { data: client, error: insertError } = await supabase
    .from('users')
    .insert({
      email,
      password_hash,
      first_name: data.firstName,
      last_name: data.lastName,
      role: 'client',
    })
    .select('id, email, first_name, last_name, role, is_active, created_at, updated_at')
    .single();

  if (insertError) throw new AppError(insertError.message, 500);

  // Create empty profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ user_id: client.id });

  if (profileError) throw new AppError(profileError.message, 500);

  return client;
}

export async function updateClient(
  id: string,
  data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
  }
) {
  // Verify the user is a client
  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .eq('role', 'client')
    .maybeSingle();

  if (lookupError) throw new AppError(lookupError.message, 500);
  if (!existing) throw new AppError('Client not found', 404);

  // If email is being changed, check uniqueness
  if (data.email) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const { data: emailExists, error: emailError } = await supabase
      .from('users')
      .select('id')
      .ilike('email', normalizedEmail)
      .neq('id', id)
      .maybeSingle();

    if (emailError) throw new AppError(emailError.message, 500);
    if (emailExists) throw new AppError('Email already in use', 409);
  }

  const updateFields: Record<string, unknown> = {};
  if (data.email !== undefined) updateFields.email = data.email.trim().toLowerCase();
  if (data.firstName !== undefined) updateFields.first_name = data.firstName;
  if (data.lastName !== undefined) updateFields.last_name = data.lastName;
  if (data.isActive !== undefined) updateFields.is_active = data.isActive;

  const { data: client, error } = await supabase
    .from('users')
    .update(updateFields)
    .eq('id', id)
    .eq('role', 'client')
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at')
    .single();

  if (error) throw new AppError(error.message, 500);

  return client;
}

export async function deactivateClient(id: string) {
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', id)
    .eq('role', 'client');

  if (error) throw new AppError(error.message, 500);
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('role', 'client');

  if (error) throw new AppError(error.message, 500);
}
