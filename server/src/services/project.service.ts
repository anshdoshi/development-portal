import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';

export async function getProjects(params: {
  page?: number;
  limit?: number;
  status?: string;
  clientId?: string;
  search?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('projects')
    .select('*, client:users!client_id(id, first_name, last_name, email)', { count: 'exact' });

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.clientId) {
    query = query.eq('client_id', params.clientId);
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new AppError(error.message, 500);

  return { data: data ?? [], total: count ?? 0, page, limit };
}

export async function getProjectById(id: string) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, client:users!client_id(id, first_name, last_name, email)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!project) throw new AppError('Project not found', 404);

  // Get assignments with user info
  const { data: assignments, error: assignError } = await supabase
    .from('project_assignments')
    .select('*, user:users(id, first_name, last_name, email, role)')
    .eq('project_id', id);

  if (assignError) throw new AppError(assignError.message, 500);

  return { ...project, assignments: assignments ?? [] };
}

export async function getProjectsByClientId(
  clientId: string,
  params: { page?: number; limit?: number; status?: string; search?: string }
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('projects')
    .select('*, client:users!client_id(id, first_name, last_name, email)', { count: 'exact' })
    .eq('client_id', clientId);

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new AppError(error.message, 500);

  return { data: data ?? [], total: count ?? 0, page, limit };
}

export async function getProjectsByUserId(
  userId: string,
  params: { page?: number; limit?: number; status?: string; search?: string }
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  // Get project IDs from assignments
  const { data: assignments, error: assignError } = await supabase
    .from('project_assignments')
    .select('project_id')
    .eq('user_id', userId);

  if (assignError) throw new AppError(assignError.message, 500);

  const projectIds = (assignments ?? []).map((a) => a.project_id);

  if (projectIds.length === 0) {
    return { data: [], total: 0, page, limit };
  }

  let query = supabase
    .from('projects')
    .select('*, client:users!client_id(id, first_name, last_name, email)', { count: 'exact' })
    .in('id', projectIds);

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new AppError(error.message, 500);

  return { data: data ?? [], total: count ?? 0, page, limit };
}

export async function createProject(
  data: {
    title: string;
    description?: string;
    clientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  },
  createdBy: string
) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: data.title,
      description: data.description,
      client_id: data.clientId,
      status: data.status ?? 'not_started',
      start_date: data.startDate,
      end_date: data.endDate,
      created_by: createdBy,
    })
    .select('*, client:users!client_id(id, first_name, last_name, email)')
    .single();

  if (error) throw new AppError(error.message, 500);

  return project;
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    description?: string;
    clientId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const updateFields: Record<string, unknown> = {};
  if (data.title !== undefined) updateFields.title = data.title;
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.clientId !== undefined) updateFields.client_id = data.clientId;
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.startDate !== undefined) updateFields.start_date = data.startDate;
  if (data.endDate !== undefined) updateFields.end_date = data.endDate;

  const { data: project, error } = await supabase
    .from('projects')
    .update(updateFields)
    .eq('id', id)
    .select('*, client:users!client_id(id, first_name, last_name, email)')
    .single();

  if (error) throw new AppError(error.message, 500);

  return project;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) throw new AppError(error.message, 500);
}

export async function assignUser(projectId: string, userId: string) {
  const { data, error } = await supabase
    .from('project_assignments')
    .insert({ project_id: projectId, user_id: userId })
    .select('*')
    .single();

  if (error) throw new AppError(error.message, 500);

  return data;
}

export async function unassignUser(projectId: string, userId: string) {
  const { error } = await supabase
    .from('project_assignments')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (error) throw new AppError(error.message, 500);
}
