import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import { Project, CreateProjectRequest } from '../types';
import ProjectList from './ProjectList';
import AddProjectForm from './AddProjectForm';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import Analytics from './Analytics';
import FileIngestion from './FileIngestion';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState<'projects' | 'analytics' | 'ingestion'>('projects');

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectService.getProjects();
      setProjects(response.data.projects);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await projectService.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Add new project
  const addProject = async (projectData: CreateProjectRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await projectService.createProject(projectData);
      await fetchProjects();
      await fetchStats();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create project';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Update project
  const updateProject = async (id: number, projectData: Partial<CreateProjectRequest>) => {
    try {
      setIsLoading(true);
      setError(null);
      await projectService.updateProject(id.toString(), projectData);
      await fetchProjects();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete project
  const deleteProject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await projectService.deleteProject(id.toString());
      await fetchProjects();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Tracker</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Organization ID: {user?.organization_id}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Organization Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Projects</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">All team projects</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Active Projects</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.active}</div>
            <div className="text-xs text-gray-500 mt-1">In progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Completed Projects</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.completed}</div>
            <div className="text-xs text-gray-500 mt-1">Finished</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('ingestion')}
              className={`${
                activeTab === 'ingestion'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              📤 File Upload
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Projects</h2>
                
                {error && <ErrorMessage message={error} />}
                
                {isLoading && <LoadingSpinner />}
                
                {!isLoading && (
                  <ProjectList 
                    projects={projects}
                    onUpdate={updateProject}
                    onDelete={deleteProject}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>

            {/* Add Project Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Project</h2>
                <AddProjectForm onSubmit={addProject} isLoading={isLoading} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <Analytics />}

        {activeTab === 'ingestion' && <FileIngestion />}
      </div>
    </div>
  );
};

export default Dashboard;
