export type ViewState = 'landing' | 'auth-candidate' | 'auth-recruiter' | 'candidate-onboarding' | 'recruiter-flow';

export interface FloatingNodeProps {
  title: string;
  subtitle: string;
  detail: string;
  icon: string;
  position: string;
  delay: string;
  align?: 'left' | 'right';
  type: 'cyan' | 'indigo';
  tags?: string[];
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
}