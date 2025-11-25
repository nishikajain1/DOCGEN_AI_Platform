import React, { useState, useEffect } from 'react';
import { User, Project, ViewState } from './types';
import * as StorageService from './services/storageService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ProjectWizard from './components/ProjectWizard';
import Editor from './components/Editor';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    StorageService.logoutUser();
    setUser(null);
    setCurrentView('auth');
    setActiveProjectId(null);
  };

  const handleCreateProject = () => {
    setCurrentView('wizard');
  };

  const handleProjectCreated = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('editor');
  };

  const handleOpenProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setActiveProjectId(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {user && (
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center cursor-pointer" onClick={handleBackToDashboard}>
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-2xl font-bold text-indigo-600">DocGen</span>
                  <span className="ml-1 text-xs text-indigo-100 bg-indigo-600 px-1 rounded">AI</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
        {currentView === 'auth' && (
          <Auth onLogin={handleLogin} />
        )}

        {currentView === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            onCreateProject={handleCreateProject} 
            onOpenProject={handleOpenProject} 
          />
        )}

        {currentView === 'wizard' && user && (
          <ProjectWizard 
            user={user} 
            onCancel={handleBackToDashboard}
            onProjectCreated={handleProjectCreated}
          />
        )}

        {currentView === 'editor' && activeProjectId && (
          <Editor 
            projectId={activeProjectId} 
            onBack={handleBackToDashboard} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
