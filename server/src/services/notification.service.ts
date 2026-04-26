import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';

export async function getNotifications(
  userId: string,
  params: { page?: number; limit?: number }
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new AppError(error.message, 500);

  return { data: data ?? [], total: count ?? 0, page, limit };
}

export async function markAsRead(id: string, userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw new AppError(error.message, 500);

  return data;
}

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw new AppError(error.message, 500);
}

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw new AppError(error.message, 500);

  return count ?? 0;
}
