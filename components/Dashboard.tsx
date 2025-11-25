import React, { useEffect, useState } from 'react';
import { User, Project, DocType } from '../types';
import * as StorageService from '../services/storageService';
import Button from './Button';
import { DocIcon, SlideIcon, TrashIcon } from './Icons';

interface DashboardProps {
  user: User;
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onCreateProject, onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const loadProjects = () => {
    setProjects(StorageService.getProjects(user.id));
  };

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      StorageService.deleteProject(projectId);
      loadProjects();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
        <Button onClick={onCreateProject}>+ New Project</Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <DocIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new document or presentation.</p>
          <div className="mt-6">
            <Button onClick={onCreateProject}>Create Project</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onOpenProject(project.id)}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative group"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-md ${project.type === DocType.DOCX ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {project.type === DocType.DOCX ? <DocIcon className="h-6 w-6" /> : <SlideIcon className="h-6 w-6" />}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{project.title}</h3>
                    <p className="text-sm text-gray-500">{project.sections.length} {project.type === DocType.PPTX ? 'Slides' : 'Sections'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-xs text-gray-500 flex justify-between items-center">
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  <button 
                    onClick={(e) => handleDelete(e, project.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete Project"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
