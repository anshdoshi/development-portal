import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';

// Append end-of-day time so the filter includes the entire end date
function endOfDay(dateStr: string): string {
  return `${dateStr}T23:59:59.999Z`;
}

export async function getReportData(params: {
  type?: 'projects' | 'users' | 'activity';
  startDate?: string;
  endDate?: string;
}) {
  const type = params.type ?? 'projects';

  if (type === 'projects') {
    let query = supabase
      .from('projects')
      .select('*, client:users!client_id(id, first_name, last_name, email)');

    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', endOfDay(params.endDate));
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  if (type === 'users') {
    let query = supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, created_at, updated_at');

    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', endOfDay(params.endDate));
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  if (type === 'activity') {
    let query = supabase
      .from('activity_logs')
      .select('*, user:users(id, first_name, last_name, email)');

    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', endOfDay(params.endDate));
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  throw new AppError(`Invalid report type: ${type}`, 400);
}

export function exportCsv(
  data: Record<string, unknown>[],
  columns: { key: string; label: string }[]
): string {
  const header = columns.map((c) => `"${c.label}"`).join(',');

  const rows = data.map((row) =>
    columns
      .map((c) => {
        const value = row[c.key];
        if (value === null || value === undefined) return '""';
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}
