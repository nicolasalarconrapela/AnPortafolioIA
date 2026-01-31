
export type ViewState = 'landing' | 'auth-candidate' | 'auth-candidate-register' | 'auth-recruiter' | 'candidate-onboarding' | 'recruiter-flow' | 'candidate-dashboard' | 'design-system';

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
