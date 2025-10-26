export interface Organization {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
  user_id: number;
  organization_id: number;
  completed_at: string | null;
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

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
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
