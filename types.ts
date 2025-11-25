export enum DocType {
  DOCX = 'docx',
  PPTX = 'pptx'
}

export interface Section {
  id: string;
  title: string;
  content: string;
  isGenerating: boolean;
  feedback?: 'like' | 'dislike' | null;
  comments?: string;
  version: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  topic: string;
  type: DocType;
  sections: Section[];
  createdAt: number;
  status: 'draft' | 'generating' | 'completed';
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export type ViewState = 'auth' | 'dashboard' | 'wizard' | 'editor';
