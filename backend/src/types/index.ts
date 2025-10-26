import { Request } from 'express';

export interface Organization {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed';
  user_id: number;
  organization_id: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  status: 'active' | 'completed';
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'completed';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    organization_id: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export type IngestionJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IngestionJob {
  id: number;
  job_id: string;
  user_id: number;
  organization_id: number;
  filename: string;
  file_type: string;
  file_size: number | null;
  status: IngestionJobStatus;
  upload_url: string | null;
  result_url: string | null;
  result_data: any;
  error_message: string | null;
  created_at: string;
  started_processing_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface CreateIngestionJobRequest {
  filename: string;
  file_type: string;
  file_size?: number;
}

export interface UpdateIngestionJobRequest {
  status?: IngestionJobStatus;
  result_url?: string;
  result_data?: any;
  error_message?: string;
}

export type BackgroundJobStatus = 'queued' | 'running' | 'completed' | 'failed';
export type BackgroundJobType = 'recompute_analytics' | 'archive_old_projects' | 'cleanup_old_jobs';

export interface BackgroundJob {
  id: number;
  job_id: string;
  job_type: BackgroundJobType;
  user_id: number;
  organization_id: number;
  status: BackgroundJobStatus;
  progress_percentage: number;
  current_step: string | null;
  result_data: any;
  error_message: string | null;
  estimated_time_seconds: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface CreateBackgroundJobRequest {
  job_type: BackgroundJobType;
  options?: any;
}

export interface UpdateBackgroundJobRequest {
  status?: BackgroundJobStatus;
  progress_percentage?: number;
  current_step?: string;
  result_data?: any;
  error_message?: string;
}
