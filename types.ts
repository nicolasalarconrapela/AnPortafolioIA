export type ViewState = 'landing' | 'login' | 'signup' | 'onboarding';

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