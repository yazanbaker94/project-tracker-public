import api from './api';

export interface AnalyticsDashboard {
  organization_stats: {
    total: number;
    active: number;
    completed: number;
  };
  user_stats: {
    total: number;
    active: number;
    completed: number;
  };
  average_completion_time: {
    days: number | null;
    hours: string | null;
  };
  detailed_analytics: {
    overview: {
      total_projects: number;
      active_projects: number;
      completed_projects: number;
      total_contributors: number;
      avg_completion_days: string | null;
      completion_rate: string;
    };
    top_contributors: Array<{
      user_id: number;
      project_count: number;
      completed_count: number;
    }>;
    recent_activity: Array<{
      date: string;
      projects_created: number;
    }>;
  };
}

const analyticsService = {
  // Get comprehensive analytics dashboard
  async getDashboard() {
    const response = await api.get<{ success: boolean; data: AnalyticsDashboard }>('/analytics/dashboard');
    return response.data;
  },

  // Get organization analytics
  async getOrganizationAnalytics() {
    const response = await api.get('/analytics/organization');
    return response.data;
  },

  // Get user stats
  async getUserStats() {
    const response = await api.get('/analytics/user');
    return response.data;
  },

  // Get average completion time
  async getCompletionTime() {
    const response = await api.get('/analytics/completion-time');
    return response.data;
  },
};

export default analyticsService;

