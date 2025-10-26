import React, { useState, useEffect } from 'react';
import ingestionService from '../services/ingestionService';
import { IngestionJob } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const FileIngestion: React.FC = () => {
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
  
  // Form state
  const [filename, setFilename] = useState('');
  const [fileType, setFileType] = useState('csv');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Polling for job updates
  const [pollingActive, setPollingActive] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, []);

  // Poll for updates every 3 seconds when there are pending/processing jobs
  useEffect(() => {
    const hasPendingJobs = jobs.some(job => job.status === 'pending' || job.status === 'processing');
    
    if (hasPendingJobs && !pollingActive) {
      setPollingActive(true);
      const interval = setInterval(() => {
        fetchJobs();
        fetchStats();
      }, 3000);

      return () => {
        clearInterval(interval);
        setPollingActive(false);
      };
    }
  }, [jobs, pollingActive]);

  const fetchJobs = async () => {
    try {
      setError(null);
      const response = await ingestionService.getUserJobs();
      setJobs(response.data.jobs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ingestionService.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await ingestionService.initUpload({
        filename: filename.trim(),
        file_type: fileType,
        file_size: Math.floor(Math.random() * 10000000) + 1000 // Mock file size
      });

      // Clear form
      setFilename('');
      setFileType('csv');

      // Refresh jobs
      await fetchJobs();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await ingestionService.deleteJob(jobId);
      await fetchJobs();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs font-medium text-gray-600">Total Jobs</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs font-medium text-yellow-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs font-medium text-blue-600">Processing</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.processing}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs font-medium text-green-600">Completed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs font-medium text-red-600">Failed</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📤 Upload New File</h2>
        
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., project_data_2025.csv"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">XLSX</option>
              <option value="txt">TXT</option>
              <option value="log">LOG</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !filename.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Initiating Upload...' : 'Upload File'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-md text-xs text-blue-700">
          <strong>Note:</strong> This is a mock upload system. Files are not actually stored. 
          Processing will complete in 5-15 seconds.
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">📋 Your Upload Jobs</h2>
          <button
            onClick={fetchJobs}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            🔄 Refresh
          </button>
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && jobs.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No upload jobs yet. Upload a file to get started!
          </p>
        )}

        {!isLoading && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon(job.status)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.filename}</h3>
                        <p className="text-xs text-gray-500">
                          {job.file_type.toUpperCase()} · {formatDate(job.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.toUpperCase()}
                      </span>
                      {job.status === 'processing' && (
                        <span className="text-xs text-gray-500">Processing...</span>
                      )}
                    </div>

                    {/* Result Data */}
                    {job.status === 'completed' && job.result_data && (
                      <div className="mt-3 p-3 bg-green-50 rounded-md text-sm">
                        <div className="font-medium text-green-900 mb-1">✨ Processing Complete</div>
                        <div className="text-xs text-green-700 space-y-1">
                          <div>📊 Rows: {job.result_data.rows_processed?.toLocaleString()}</div>
                          <div>📋 Columns: {job.result_data.columns}</div>
                          <div>⏱️ Time: {(job.result_data.processing_time_ms / 1000).toFixed(1)}s</div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {job.status === 'failed' && job.error_message && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md text-sm text-red-700">
                        <div className="font-medium">Error:</div>
                        <div className="text-xs">{job.error_message}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4">
                    <button
                      onClick={() => handleDelete(job.job_id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                      title="Delete job"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileIngestion;

