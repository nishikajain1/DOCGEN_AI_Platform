import { Project, User, Section, DocType } from "../types";

// Simulation of a database using localStorage
const STORAGE_KEY_PROJECTS = 'docgen_projects';
const STORAGE_KEY_USER = 'docgen_user';

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  return stored ? JSON.parse(stored) : null;
};

export const loginUser = (email: string, name: string): User => {
  const user: User = { id: 'u_' + Date.now(), email, name };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY_USER);
};

export const getProjects = (userId: string): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
  const projects: Project[] = stored ? JSON.parse(stored) : [];
  return projects.filter(p => p.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
};

export const getProjectById = (projectId: string): Project | undefined => {
  const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
  const projects: Project[] = stored ? JSON.parse(stored) : [];
  return projects.find(p => p.id === projectId);
};

export const createProject = (project: Project): void => {
  const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
  const projects: Project[] = stored ? JSON.parse(stored) : [];
  projects.push(project);
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
};

export const updateProject = (updatedProject: Project): void => {
  const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
  let projects: Project[] = stored ? JSON.parse(stored) : [];
  projects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
};

export const deleteProject = (projectId: string): void => {
  const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
  let projects: Project[] = stored ? JSON.parse(stored) : [];
  projects = projects.filter(p => p.id !== projectId);
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
};
