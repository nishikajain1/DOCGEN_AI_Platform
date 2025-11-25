import React, { useEffect, useState, useCallback } from 'react';
import { Project, Section } from '../types';
import * as StorageService from '../services/storageService';
import * as GeminiService from '../services/geminiService';
import Button from './Button';
import SectionEditor from './SectionEditor';
import { DownloadIcon, LoadingSpinner, CheckIcon } from './Icons';

interface EditorProps {
  projectId: string;
  onBack: () => void;
}

const Editor: React.FC<EditorProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load project
  useEffect(() => {
    const p = StorageService.getProjectById(projectId);
    if (p) {
      setProject(p);
      if (p.sections.length > 0 && !activeSectionId) {
        setActiveSectionId(p.sections[0].id);
      }
    }
  }, [projectId, activeSectionId]);

  // Initial Content Generation Effect
  useEffect(() => {
    if (project && project.status === 'generating') {
      generateAllSections(project);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.status]); // Only run if status is generating

  const generateAllSections = async (proj: Project) => {
    // Mark as generating locally
    const contextOutline = proj.sections.map(s => s.title);
    
    // Process sequentially to avoid rate limits and ensure context (though parallel is possible)
    let updatedSections = [...proj.sections];
    
    // Update project status to prevent re-triggering
    const completedProject = { ...proj, status: 'completed' as const };
    StorageService.updateProject(completedProject);
    setProject(completedProject);

    for (let i = 0; i < updatedSections.length; i++) {
      const section = updatedSections[i];
      if (!section.content) {
        // Optimistic update for UI spinner
        updatedSections[i] = { ...section, isGenerating: true };
        setProject({ ...completedProject, sections: [...updatedSections] });

        try {
          const content = await GeminiService.generateSectionContent(
            proj.topic,
            section.title,
            proj.type,
            contextOutline
          );
          
          updatedSections[i] = { 
            ...section, 
            content, 
            isGenerating: false 
          };
          
          // Save incrementally
          const savingProject = { ...completedProject, sections: [...updatedSections] };
          StorageService.updateProject(savingProject);
          setProject(savingProject);
        } catch (error) {
            console.error(error)
          updatedSections[i] = { ...section, isGenerating: false, content: "Error generating content." };
          setProject({ ...completedProject, sections: [...updatedSections] });
        }
      }
    }
  };

  const handleUpdateSection = (updatedSection: Section) => {
    if (!project) return;
    const updatedSections = project.sections.map(s => s.id === updatedSection.id ? updatedSection : s);
    const updatedProject = { ...project, sections: updatedSections };
    setProject(updatedProject);
    StorageService.updateProject(updatedProject);
  };

  const handleExport = () => {
    setIsExporting(true);
    // Simulate backend file assembly delay
    setTimeout(() => {
      setIsExporting(false);
      alert(`Download started for ${project?.title}.${project?.type}\n\n(This is a mock export. In a real app, this triggers the backend to assemble the file.)`);
    }, 1500);
  };

  if (!project) return <div>Loading...</div>;

  const activeSection = project.sections.find(s => s.id === activeSectionId);

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Sidebar - Outline */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 cursor-pointer mb-2" onClick={onBack}>
            <span className="text-xs font-bold">← Back</span>
          </div>
          <h2 className="font-semibold text-gray-800 truncate" title={project.title}>
            {project.title}
          </h2>
          <span className="text-xs text-gray-400 uppercase tracking-wider">{project.type}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {project.sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${
                activeSectionId === section.id 
                  ? 'bg-white shadow-sm border border-gray-200 text-indigo-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="truncate flex-1">{index + 1}. {section.title}</span>
              {section.isGenerating && <LoadingSpinner className="w-3 h-3 text-indigo-500 ml-2" />}
              {!section.isGenerating && section.content && <CheckIcon className="w-3 h-3 text-green-500 ml-2" />}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
            <Button 
                variant="primary" 
                className="w-full text-xs" 
                onClick={handleExport}
                isLoading={isExporting}
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export {project.type.toUpperCase()}
            </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeSection ? (
          <SectionEditor 
            section={activeSection} 
            docType={project.type}
            onUpdate={handleUpdateSection}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a section to edit
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
