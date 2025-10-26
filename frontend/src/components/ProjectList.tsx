import React, { useState } from 'react';
import { Project, CreateProjectRequest } from '../types';
import ProjectCard from './ProjectCard';
import EditProjectModal from './EditProjectModal';

interface ProjectListProps {
  projects: Project[];
  onUpdate: (id: number, projectData: Partial<CreateProjectRequest>) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onUpdate, 
  onDelete, 
  isLoading 
}) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleSave = (projectData: Partial<CreateProjectRequest>) => {
    if (editingProject) {
      onUpdate(editingProject.id, projectData);
      setEditingProject(null);
    }
  };

  const handleCancel = () => {
    setEditingProject(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
        <p className="text-gray-500">Get started by creating your first project!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default ProjectList;
