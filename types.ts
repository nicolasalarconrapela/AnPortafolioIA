export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export enum AppState {
  IDLE = "IDLE",
  ANALYZING = "ANALYZING",
  WIZARD = "WIZARD", // Step-by-step editing with Googlitos
  DONNA = "DONNA", // Final view (formerly HARVIS)
  ERROR = "ERROR",
}

export interface ExperienceItem {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  period: string;
  description: string;
  logo?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  images?: string[];
}

export interface EducationItem {
  institution: string;
  title: string;
  period: string;
}

export interface LanguageItem {
  language: string;
  level: string;
}

export interface CVProfile {
  summary: string; // Brief intro
  experience: ExperienceItem[];
  education: EducationItem[]; // Added for the final view
  skills: string[]; // Soft & Hard generic
  techStack: {
    languages: string[];
    ides: string[];
    frameworks: string[];
    tools: string[];
  };
  projects: ProjectItem[];
  volunteering: ExperienceItem[]; // Similar structure to experience
  awards: string[];
  languages: LanguageItem[];
  hobbies: string[];
}
