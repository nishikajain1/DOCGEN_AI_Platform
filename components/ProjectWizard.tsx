import React, { useState } from 'react';
import { User, DocType, Project, Section } from '../types';
import * as GeminiService from '../services/geminiService';
import * as StorageService from '../services/storageService';
import Button from './Button';
import { DocIcon, SlideIcon, SparklesIcon, TrashIcon } from './Icons';

interface ProjectWizardProps {
  user: User;
  onCancel: () => void;
  onProjectCreated: (projectId: string) => void;
}

const ProjectWizard: React.FC<ProjectWizardProps> = ({ user, onCancel, onProjectCreated }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [docType, setDocType] = useState<DocType>(DocType.DOCX);
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState<string[]>([]);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;
    setIsGeneratingOutline(true);
    try {
      const suggestedOutline = await GeminiService.generateOutline(topic, docType);
      setOutline(suggestedOutline);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert('Failed to generate outline. Please try again.');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleAddSection = () => {
    setOutline([...outline, "New Section"]);
  };

  const handleUpdateSection = (index: number, value: string) => {
    const newOutline = [...outline];
    newOutline[index] = value;
    setOutline(newOutline);
  };

  const handleDeleteSection = (index: number) => {
    const newOutline = outline.filter((_, i) => i !== index);
    setOutline(newOutline);
  };

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    
    // Create sections structure
    const sections: Section[] = outline.map((title, index) => ({
      id: `sec_${Date.now()}_${index}`,
      title,
      content: '', // Content will be generated in the Editor view
      isGenerating: true,
      version: 1
    }));

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      userId: user.id,
      title: topic,
      topic: topic,
      type: docType,
      sections,
      createdAt: Date.now(),
      status: 'generating'
    };

    StorageService.createProject(newProject);
    
    // Slight delay for UX
    setTimeout(() => {
      onProjectCreated(newProject.id);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-indigo-600 px-8 py-6">
        <h2 className="text-xl font-bold text-white">
          {step === 1 ? 'Configure New Project' : 'Review Outline'}
        </h2>
        <p className="text-indigo-200 text-sm mt-1">
          {step === 1 ? 'Choose your document type and topic.' : 'Customize the structure before generating content.'}
        </p>
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Document Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDocType(DocType.DOCX)}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all ${
                    docType === DocType.DOCX 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 hover:border-indigo-200 text-gray-500'
                  }`}
                >
                  <DocIcon className="h-10 w-10 mb-3" />
                  <span className="font-semibold">Word Document</span>
                  <span className="text-xs mt-1 opacity-75">Detailed reports & articles</span>
                </button>
                <button
                  onClick={() => setDocType(DocType.PPTX)}
                  className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all ${
                    docType === DocType.PPTX 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 hover:border-indigo-200 text-gray-500'
                  }`}
                >
                  <SlideIcon className="h-10 w-10 mb-3" />
                  <span className="font-semibold">PowerPoint</span>
                  <span className="text-xs mt-1 opacity-75">Presentations & decks</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                What is this document about?
              </label>
              <textarea
                id="topic"
                rows={3}
                className="block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., A strategic analysis of the electric vehicle market trends in 2025..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button 
                onClick={handleGenerateOutline} 
                disabled={!topic.trim()} 
                isLoading={isGeneratingOutline}
              >
                {isGeneratingOutline ? 'Generating...' : 'Next: Suggest Outline'} <SparklesIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {docType === DocType.PPTX ? 'Slides' : 'Sections'} Structure
                </label>
                <Button variant="ghost" size="sm" onClick={handleAddSection} className="text-xs">
                  + Add {docType === DocType.PPTX ? 'Slide' : 'Section'}
                </Button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-3 border border-gray-200">
                {outline.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded shadow-sm border border-gray-100">
                    <span className="text-xs font-mono text-gray-400 w-6 text-center">{index + 1}</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateSection(index, e.target.value)}
                      className="flex-1 border-none focus:ring-0 text-sm font-medium text-gray-800"
                    />
                    <button 
                      onClick={() => handleDeleteSection(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tip: You can rename sections or delete them. AI will generate content based on these titles.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button 
                onClick={handleCreateProject} 
                isLoading={isCreatingProject}
                disabled={outline.length === 0}
              >
                Generate Content
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWizard;
