export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  photo: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'beginner';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl: string;
  repoUrl: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
  credentialId: string;
  url: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

export interface ResumeColors {
  primary: string;
  text: string;
  background: string;
  accent: string;
}

export interface ResumeSettings {
  template: string;
  font: string;
  fontSize: number;
  lineHeight: number;
  colors: ResumeColors;
  sectionSpacing: number;
  pageMargin: number;
}

export type SectionType =
  | 'personalInfo'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'custom';

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  order: number;
  customSectionId?: string;
  column?: 'left' | 'right';
}

export interface Resume {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  customSections: CustomSection[];
  sections: SectionConfig[];
  settings: ResumeSettings;
}

export interface ATSScore {
  overall: number;
  format: number;
  content: number;
  keywords: number;
  suggestions: ATSSuggestion[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface ATSSuggestion {
  category: 'format' | 'content' | 'keywords';
  severity: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
}
