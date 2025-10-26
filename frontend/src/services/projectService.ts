import api from './api';
import { Project, CreateProjectRequest, UpdateProjectRequest, ApiResponse } from '../types';

export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: {
    projects: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: Project;
  };
}

export interface StatsResponse {
  success: boolean;
  message: string;
  data: {
    stats: {
      total: number;
      active: number;
      completed: number;
    };
  };
}

const projectService = {
  // Get all projects
  async getProjects(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<ProjectsResponse> {
    const response = await api.get<ProjectsResponse>('/projects', { params });
    return response.data;
  },

  // Get single project
  async getProject(id: string): Promise<ProjectResponse> {
    const response = await api.get<ProjectResponse>(`/projects/${id}`);
    return response.data;
  },

  // Create project
  async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
    const response = await api.post<ProjectResponse>('/projects', data);
    return response.data;
  },

  // Update project
  async updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectResponse> {
    const response = await api.put<ProjectResponse>(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/projects/${id}`);
    return response.data;
  },

  // Get project statistics
  async getStats(): Promise<StatsResponse> {
    const response = await api.get<StatsResponse>('/projects/stats');
    return response.data;
  },
};

export default projectService;
