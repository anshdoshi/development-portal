export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'client' | 'user';
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Profile {
  id: string;
  user_id: string;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  address: string | null;
  bio: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  client_id: string | null;
  created_by: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  client?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
  assignments?: ProjectAssignment[];
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  user_id: string;
  assigned_at: string;
  user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: Pick<User, 'id' | 'first_name' | 'last_name'>;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalUsers?: number;
  totalClients?: number;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  recentActivity?: ActivityLog[];
  recentProjects?: Project[];
  unreadNotifications?: number;
  assignedProjects?: number;
}
