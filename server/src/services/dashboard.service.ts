import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';

export async function getAdminDashboard() {
  const [usersRes, clientsRes, projectsRes, statusRes, activityRes, recentProjectsRes] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('status'),
      supabase
        .from('activity_logs')
        .select('*, user:users(id, first_name, last_name, email)')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('projects')
        .select('*, client:users!client_id(id, first_name, last_name, email)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  if (usersRes.error) throw new AppError(usersRes.error.message, 500);
  if (clientsRes.error) throw new AppError(clientsRes.error.message, 500);
  if (projectsRes.error) throw new AppError(projectsRes.error.message, 500);
  if (statusRes.error) throw new AppError(statusRes.error.message, 500);
  if (activityRes.error) throw new AppError(activityRes.error.message, 500);
  if (recentProjectsRes.error) throw new AppError(recentProjectsRes.error.message, 500);

  // Group projects by status
  const projectsByStatus: Record<string, number> = {};
  for (const row of statusRes.data ?? []) {
    projectsByStatus[row.status] = (projectsByStatus[row.status] ?? 0) + 1;
  }

  return {
    totalUsers: usersRes.count ?? 0,
    totalClients: clientsRes.count ?? 0,
    totalProjects: projectsRes.count ?? 0,
    projectsByStatus,
    recentActivity: activityRes.data ?? [],
    recentProjects: recentProjectsRes.data ?? [],
  };
}

export async function getClientDashboard(clientId: string) {
  const [projectsRes, statusRes, recentRes, notifRes] = await Promise.all([
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId),
    supabase.from('projects').select('status').eq('client_id', clientId),
    supabase
      .from('projects')
      .select('*, client:users!client_id(id, first_name, last_name, email)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', clientId)
      .eq('is_read', false),
  ]);

  if (projectsRes.error) throw new AppError(projectsRes.error.message, 500);
  if (statusRes.error) throw new AppError(statusRes.error.message, 500);
  if (recentRes.error) throw new AppError(recentRes.error.message, 500);
  if (notifRes.error) throw new AppError(notifRes.error.message, 500);

  const projectsByStatus: Record<string, number> = {};
  for (const row of statusRes.data ?? []) {
    projectsByStatus[row.status] = (projectsByStatus[row.status] ?? 0) + 1;
  }

  return {
    totalProjects: projectsRes.count ?? 0,
    projectsByStatus,
    recentProjects: recentRes.data ?? [],
    unreadNotifications: notifRes.count ?? 0,
  };
}

export async function getUserDashboard(userId: string) {
  // Get assigned project IDs
  const { data: assignments, error: assignError } = await supabase
    .from('project_assignments')
    .select('project_id')
    .eq('user_id', userId);

  if (assignError) throw new AppError(assignError.message, 500);

  const projectIds = (assignments ?? []).map((a) => a.project_id);

  if (projectIds.length === 0) {
    return {
      assignedProjects: 0,
      projectsByStatus: {},
      recentProjects: [],
    };
  }

  const [statusRes, recentRes] = await Promise.all([
    supabase.from('projects').select('status').in('id', projectIds),
    supabase
      .from('projects')
      .select('*, client:users!client_id(id, first_name, last_name, email)')
      .in('id', projectIds)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (statusRes.error) throw new AppError(statusRes.error.message, 500);
  if (recentRes.error) throw new AppError(recentRes.error.message, 500);

  const projectsByStatus: Record<string, number> = {};
  for (const row of statusRes.data ?? []) {
    projectsByStatus[row.status] = (projectsByStatus[row.status] ?? 0) + 1;
  }

  return {
    assignedProjects: projectIds.length,
    projectsByStatus,
    recentProjects: recentRes.data ?? [],
  };
}
