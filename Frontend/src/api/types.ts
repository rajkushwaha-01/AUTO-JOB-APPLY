export interface EducationItem {
  degree?: string;
  institution?: string;
  location?: string;
  startYear?: string;
  endYear?: string;
  year?: string;
  grade?: string;
}

export interface ProjectItem {
  name?: string;
  description?: string;
  techUsed?: string[];
  liveUrl?: string;
  repoUrl?: string;
}

export interface ExperienceItem {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  bullets?: string[];
  description?: string;
}

export interface CertificationItem {
  name?: string;
  issuer?: string;
  date?: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface LanguageItem {
  language?: string;
  proficiency?: string;
}

export interface AwardItem {
  title?: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface ResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  summary?: string;
  objective?: string;
  skills?: string[];
  skillsByCategory?: Record<string, string[]>;
  experience?: ExperienceItem[];
  totalYearsExperience?: number;
  education?: EducationItem[];
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
  hackathons?: string[];
  languages?: LanguageItem[];
  awards?: AwardItem[];
  volunteer?: Array<{
    role?: string;
    organization?: string;
    duration?: string;
    description?: string;
  }>;
  publications?: Array<{
    title?: string;
    publisher?: string;
    date?: string;
    url?: string;
  }>;
  interests?: string[];
  pdfLinks?: Array<{ url: string | null; hasDestination: boolean }>;
  rawText?: string;
  uploadedAt?: string;
  pdfFileId?: string | null;
  embedding?: number[];
  embeddingHash?: string;
}

export interface UserPreferences {
  roles?: string[];
  locations?: string[];
  remoteOnly?: boolean;
  minSalary?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  resume?: ResumeData | null;
  preferences?: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JobMatchItem {
  jobId: string;
  title: string;
  company?: string;
  location?: string;
  applyUrl?: string;
  score: number;
  embedScore: number;
  keywordScore: number;
  description?: string;
  source?: string;
}

export interface MatchResponse {
  count: number;
  matches: JobMatchItem[];
}

export interface UploadResumeResponse {
  message: string;
  text: string;
  resumeData: Partial<ResumeData>;
  pdfLinks: Array<{ url: string | null; hasDestination: boolean }>;
  resume: ResumeData;
}

