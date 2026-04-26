import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';

export async function logActivity(data: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const { data: log, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: data.userId,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      metadata: data.metadata,
    })
    .select('*')
    .single();

  if (error) throw new AppError(error.message, 500);

  return log;
}
