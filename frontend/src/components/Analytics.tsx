import React, { useState, useEffect } from 'react';
import analyticsService, { AnalyticsDashboard } from '../services/analyticsService';
import backgroundJobsService from '../services/backgroundJobsService';
import { BackgroundJob } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [currentJob, setCurrentJob] = useState<BackgroundJob | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Poll job status when recalculating
  useEffect(() => {
    if (currentJob && (currentJob.status === 'queued' || currentJob.status === 'running')) {
      const interval = setInterval(async () => {
        try {
          const response = await backgroundJobsService.getJobStatus(currentJob.job_id);
          setCurrentJob(response.data.job);
          setElapsedTime(response.data.elapsed_time_seconds);

          if (response.data.job.status === 'completed' || response.data.job.status === 'failed') {
            clearInterval(interval);
            setIsRecalculating(false);
            
            if (response.data.job.status === 'completed') {
              // Refresh analytics data
              await fetchAnalytics();
            }
          }
        } catch (err) {
          console.error('Failed to fetch job status:', err);
          clearInterval(interval);
          setIsRecalculating(false);
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentJob]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await analyticsService.getDashboard();
      setAnalytics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setIsRecalculating(true);
      setError(null);
      setElapsedTime(0);
      
      const response = await backgroundJobsService.recomputeMetrics();
      
      // Fetch the full job details
      const jobResponse = await backgroundJobsService.getJobStatus(response.data.job_id);
      setCurrentJob(jobResponse.data.job);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start recalculation');
      setIsRecalculating(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error && !analytics) return <ErrorMessage message={error} />;
  if (!analytics) return null;

  const { organization_stats, user_stats, average_completion_time, detailed_analytics } = analytics;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <span>{isRecalculating ? '🔄' : '⚡'}</span>
          <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Metrics'}</span>
        </button>
      </div>

      {/* Recalculation Status */}
      {currentJob && (currentJob.status === 'queued' || currentJob.status === 'running') && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="font-medium text-blue-900">
                {currentJob.status === 'queued' ? 'Queued' : 'Recalculating Analytics'}
              </span>
            </div>
            <span className="text-sm text-blue-700">{elapsedTime}s elapsed</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentJob.progress_percentage}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs text-blue-700">
            <span>{currentJob.current_step || 'Initializing...'}</span>
            <span>{currentJob.progress_percentage}%</span>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {currentJob && currentJob.status === 'completed' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <span className="font-medium text-green-900">Analytics recalculated successfully!</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Completed in {Math.floor((new Date(currentJob.completed_at!).getTime() - new Date(currentJob.started_at!).getTime()) / 1000)}s
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Organization Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Organization Total</h3>
          <div className="text-3xl font-bold text-blue-600">{organization_stats.total}</div>
          <div className="mt-2 text-xs text-blue-700">
            <span className="font-medium">{organization_stats.active}</span> active · 
            <span className="font-medium ml-1">{organization_stats.completed}</span> completed
          </div>
        </div>

        {/* User Stats */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-3">Your Projects</h3>
          <div className="text-3xl font-bold text-green-600">{user_stats.total}</div>
          <div className="mt-2 text-xs text-green-700">
            <span className="font-medium">{user_stats.active}</span> active · 
            <span className="font-medium ml-1">{user_stats.completed}</span> completed
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-3">Completion Rate</h3>
          <div className="text-3xl font-bold text-purple-600">
            {detailed_analytics.overview.completion_rate}%
          </div>
          <div className="mt-2 text-xs text-purple-700">
            {detailed_analytics.overview.completed_projects} of {detailed_analytics.overview.total_projects} projects
          </div>
        </div>

        {/* Average Completion Time */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-orange-900 mb-3">Avg Completion Time</h3>
          {average_completion_time.days ? (
            <>
              <div className="text-3xl font-bold text-orange-600">
                {parseFloat(average_completion_time.days.toFixed(1))}
              </div>
              <div className="mt-2 text-xs text-orange-700">
                days (~{average_completion_time.hours}h)
              </div>
            </>
          ) : (
            <div className="text-sm text-orange-600">No completed projects yet</div>
          )}
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Overview */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Contributors</span>
              <span className="font-semibold text-gray-900">{detailed_analytics.overview.total_contributors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Projects</span>
              <span className="font-semibold text-green-600">{detailed_analytics.overview.active_projects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Projects</span>
              <span className="font-semibold text-blue-600">{detailed_analytics.overview.completed_projects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Completion</span>
              <span className="font-semibold text-gray-900">
                {detailed_analytics.overview.avg_completion_days 
                  ? `${detailed_analytics.overview.avg_completion_days} days` 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
          {detailed_analytics.top_contributors.length > 0 ? (
            <div className="space-y-2">
              {detailed_analytics.top_contributors.slice(0, 5).map((contributor, index) => (
                <div key={contributor.user_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">User #{contributor.user_id}</div>
                      <div className="text-xs text-gray-500">
                        {contributor.completed_count} completed of {contributor.project_count}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">{contributor.project_count}</div>
                    <div className="text-xs text-gray-500">projects</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No contributor data available</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {detailed_analytics.recent_activity.length > 0 && (
        <div className="mt-6 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (Last 30 Days)</h3>
          <div className="flex items-end space-x-2 h-32">
            {detailed_analytics.recent_activity.slice(0, 15).reverse().map((activity, index) => {
              const maxCount = Math.max(...detailed_analytics.recent_activity.map(a => a.projects_created));
              const height = maxCount > 0 ? (activity.projects_created / maxCount) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                    title={`${new Date(activity.date).toLocaleDateString()}: ${activity.projects_created} projects`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Project creation activity over time
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

