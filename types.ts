export interface Publication {
  id: string;
  title: string;
  authors: string[];
  conference: string;
  year: number;
  tags?: string[];
  link?: string;
  pdf?: string; // Kept for backward compatibility but won't be used in UI
}

export interface ProjectLink {
  label: "Try Online" | "GitHub" | "Model" | "Dataset" | "Paper" | "Other";
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  content?: string; // HTML details
  image?: string;
  links: ProjectLink[];
  order?: number;
}

export type PersonCategory =
  | "Teachers"
  | "Visiting Scholars"
  | "PhD"
  | "Master"
  | "Professional Master"
  | "Academic Master"
  | "RA"
  | "Intern"
  | "Secretary";

export interface TeacherProfile {
  position: string;
  positionZh?: string;
  researchAreas: string[]; // stored as array
  researchAreasZh?: string[];
  achievements: string[];
  achievementsZh?: string[];
  projects: string[];
  projectsZh?: string[];
  honors?: string[];
  honorsZh?: string[];
  influence?: string[]; // Community service, open source
  influenceZh?: string[];
  publications?: string[];
}

export interface Person {
  id: string;
  name: string;
  nameZh?: string;
  category: PersonCategory;
  title?: string; // e.g. "Professor", "Ph.D. Candidate"
  titleZh?: string;
  avatar: string;
  email?: string;
  homepage?: string;
  bio: string; // Rich text or simple text
  bioZh?: string;
  order: number;

  // Teacher Specific
  teacherProfile?: TeacherProfile;

  // Student Specific
  grade?: string; // e.g., "2023 Fall"
  advisor?: string;
}

export interface NewsItem {
  id: string;
  date: string;

  // English Fields
  title: string;
  subtitle?: string;
  summary: string;
  content?: string; // HTML content

  // Chinese Fields
  titleZh?: string;
  subtitleZh?: string;
  summaryZh?: string;
  contentZh?: string; // HTML content

  // Metadata
  category: string;
  coverImage?: string;
  author?: string;
  isPublished?: boolean;
}

export interface Partner {
  name: string;
  logo: string;
  link?: string;
}

export interface ContactInfo {
  // Address
  addressEn: string;
  addressZh: string;

  // Emails
  emailGeneral: string;
  emailAdmissions: string;

  // Intro Text (Contact Page)
  introEn: string;
  introZh: string;

  // Hiring
  hiringTextEn: string;
  hiringTextZh: string;
  hiringLink: string;

  // Map
  mapEmbedUrl: string;

  // Homepage Settings
  heroImages?: string[]; // Carousel

  // Homepage Welcome Text
  welcomeTitleEn?: string;
  welcomeTitleZh?: string;
  welcomeTextEn?: string;
  welcomeTextZh?: string;

  // Homepage Research Areas
  researchAreasTextEn?: string; // Allow multiline text
  researchAreasTextZh?: string;

  // Partners
  partners?: Partner[];
}

export interface EventItem {
  id: string;
  date: string;
  time: string;
  location: string;
  title: string;
  description: string;
}

export type Language = "en" | "zh";
