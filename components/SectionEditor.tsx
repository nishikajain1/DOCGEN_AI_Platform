import React, { useState } from 'react';
import { Section, DocType } from '../types';
import * as GeminiService from '../services/geminiService';
import Button from './Button';
import { SparklesIcon, LoadingSpinner } from './Icons';

interface SectionEditorProps {
  section: Section;
  docType: DocType;
  onUpdate: (section: Section) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ section, docType, onUpdate }) => {
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...section, content: e.target.value });
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim()) return;
    setIsRefining(true);
    try {
      const refinedContent = await GeminiService.refineContent(
        section.content, 
        refinePrompt,
        docType
      );
      onUpdate({ 
        ...section, 
        content: refinedContent,
        version: section.version + 1
      });
      setRefinePrompt('');
    } catch (error) {
      console.error(error);
      alert('Refinement failed');
    } finally {
      setIsRefining(false);
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    onUpdate({ ...section, feedback: section.feedback === type ? null : type });
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...section, comments: e.target.value });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800">{section.title}</h3>
        <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Version {section.version}</span>
            {section.isGenerating && <span className="text-xs text-indigo-500 flex items-center"><LoadingSpinner className="w-3 h-3 mr-1"/> Generating...</span>}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Text Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {section.isGenerating && !section.content ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
               <LoadingSpinner className="w-8 h-8 text-indigo-500" />
               <p className="text-gray-500 animate-pulse">AI is writing content...</p>
            </div>
          ) : (
            <textarea
              className="w-full h-full p-4 border-none resize-none focus:ring-0 text-gray-800 text-lg leading-relaxed bg-white outline-none"
              value={section.content}
              onChange={handleContentChange}
              placeholder="Start writing or wait for AI generation..."
            />
          )}
        </div>

        {/* Refinement Sidebar */}
        <div className="w-80 border-l border-gray-100 bg-gray-50 p-4 flex flex-col space-y-6 overflow-y-auto">
          {/* AI Refinement Tool */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
              <SparklesIcon className="w-3 h-3 mr-1" />
              AI Refinement
            </label>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <textarea
                    className="w-full text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                    rows={2}
                    placeholder="e.g. 'Make it shorter', 'Use bullet points'..."
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                />
                <Button 
                    size="sm" 
                    className="w-full text-xs" 
                    onClick={handleRefine}
                    isLoading={isRefining}
                    disabled={!section.content || section.isGenerating}
                >
                    Refine Selection
                </Button>
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-3">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Feedback
            </label>
            <div className="flex space-x-2">
                <button 
                    onClick={() => handleFeedback('like')}
                    className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                        section.feedback === 'like' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    👍 Good
                </button>
                <button 
                    onClick={() => handleFeedback('dislike')}
                    className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                        section.feedback === 'dislike' 
                        ? 'bg-red-50 border-red-200 text-red-700' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    👎 Bad
                </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3 flex-1 flex flex-col">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Private Notes
            </label>
            <textarea
                className="flex-1 w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add comments for yourself..."
                value={section.comments || ''}
                onChange={handleCommentChange}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SectionEditor;
