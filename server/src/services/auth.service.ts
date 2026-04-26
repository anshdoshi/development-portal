import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';
import { hashPassword, comparePassword } from '../utils/password.js';

async function getSettingValue(key: string): Promise<unknown> {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return data?.value ?? null;
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  // Check if registration is allowed
  const allowRegistration = await getSettingValue('allow_registration');
  if (allowRegistration === false) {
    throw new AppError('Registration is currently disabled.', 403);
  }

  const email = data.email.trim().toLowerCase();

  // Check if email already exists
  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (lookupError) throw new AppError(lookupError.message, 500);
  if (existing) throw new AppError('Email already in use', 409);

  // Get default role from settings
  const defaultRole = await getSettingValue('default_role');
  const role = (defaultRole === 'client' || defaultRole === 'user') ? defaultRole : 'user';

  const password_hash = await hashPassword(data.password);

  const { data: user, error: insertError } = await supabase
    .from('users')
    .insert({
      email,
      password_hash,
      first_name: data.firstName,
      last_name: data.lastName,
      role,
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

export async function login(data: { email: string; password: string }) {
  const email = data.email.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.is_active) throw new AppError('Account is deactivated', 403);

  const valid = await comparePassword(data.password, user.password_hash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getMe(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, avatar_url, created_at, updated_at, profiles(*)')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!user) throw new AppError('User not found', 404);

  return user;
}
