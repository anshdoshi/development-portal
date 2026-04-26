import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';

export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('key', { ascending: true });

  if (error) throw new AppError(error.message, 500);

  return data ?? [];
}

export async function updateSettings(
  settings: { key: string; value: unknown }[]
) {
  for (const setting of settings) {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: setting.key, value: setting.value }, { onConflict: 'key' });

    if (error) throw new AppError(error.message, 500);
  }

  return getSettings();
}
