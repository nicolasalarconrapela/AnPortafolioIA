
import React, { useState, useEffect } from 'react';
import { listenWorkspaceByUser } from '../services/firestoreWorkspaces';
import { SettingsModal } from './SettingsModal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';

export interface ProfileData {
  fullName: string;
  jobTitle: string;
  bio: string;
  location?: string;
  email?: string;
  avatarUrl?: string;
  skills?: string[];
  experiences?: ExperienceData[];
}

export interface ExperienceData {
  role: string;
  company: string;
  period: string;
  desc: string;
}

interface CandidateDashboardProps {
  onLogout: () => void;
  userId: string;
  onNavigate?: (view: string) => void;
}

const ExperienceCard: React.FC<{ role: string, company: string, period: string, desc: string }> = ({ role, company, period, desc }) => (
  <div className="relative pl-8 pb-8 border-l border-outline-variant/30 last:pb-0 last:border-l-0">
    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-[var(--md-sys-color-background)]" />
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <h4 className="text-lg font-bold text-[var(--md-sys-color-on-background)]">{role}</h4>
        <span className="text-xs font-medium text-primary bg-primary-container px-2 py-1 rounded-full">{period}</span>
    </div>
    <p className="text-sm font-medium text-outline mb-3 flex items-center gap-1">
        <Icon name="business" size={16} />
        {company}
    </p>
    <p className="text-sm text-[var(--md-sys-color-on-background)]/80 leading-relaxed whitespace-pre-wrap">{desc}</p>
  </div>
);

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onLogout, userId, onNavigate }) => {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    jobTitle: "",
    bio: "",
    location: "",
    email: "",
    skills: [],
    experiences: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      const unsubscribe = listenWorkspaceByUser(
        userId,
        (data) => {
          setIsLoading(false);
          if (data && data.profile) {
            setProfile(prev => ({
              ...prev,
              ...data.profile,
            }));
          }
        },
        (error) => {
          console.error("Workspace sync error:", error);
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-surface-variant dark:bg-surface-darkVariant flex flex-col">
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          userKey={userId || profile.email || ""}
        />
      )}

      {/* Header */}
      <header className="bg-[var(--md-sys-color-background)] px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
            {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                profile.fullName ? profile.fullName.charAt(0).toUpperCase() : <Icon name="person" />
            )}
          </div>
          <div className="hidden md:block">
             <h1 className="font-display text-lg font-bold leading-tight">
                {profile.fullName || 'Candidate Profile'}
             </h1>
             <p className="text-xs text-outline">{profile.jobTitle || 'No title set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button
            variant="tonal"
            size="sm"
            icon="auto_awesome"
            onClick={() => onNavigate?.('cv-analysis')}
            title="AI CV Analysis"
          >
            AI Assistant
          </Button>
          
          <div className="h-6 w-px bg-outline-variant/30 mx-1"></div>

          <Button
            variant="text"
            icon="settings"
            onClick={() => setIsSettingsOpen(true)}
            className="!p-2 rounded-full min-w-0"
            aria-label="Settings"
          />
          <Button
            variant="text"
            icon="logout"
            onClick={onLogout}
            className="!p-2 rounded-full min-w-0 text-error hover:bg-error/10 hover:text-error"
            aria-label="Logout"
          />
        </div>
      </header>

      {/* Main Portfolio Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* About Section */}
        <Card className="p-6 md:p-8 bg-[var(--md-sys-color-background)]">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                    <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                        <Icon name="person" className="text-primary" />
                        About Me
                    </h2>
                    <p className="text-base leading-relaxed text-[var(--md-sys-color-on-background)]/80 whitespace-pre-wrap">
                        {profile.bio || "No biography provided yet. Use the AI Assistant to generate one!"}
                    </p>
                    
                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-outline">
                        {profile.location && (
                            <div className="flex items-center gap-1.5">
                                <Icon name="location_on" size={18} />
                                {profile.location}
                            </div>
                        )}
                        {profile.email && (
                            <div className="flex items-center gap-1.5">
                                <Icon name="email" size={18} />
                                {profile.email}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Skills - Desktop: Right side, Mobile: Bottom */}
                <div className="w-full md:w-1/3">
                    <h3 className="text-sm font-bold text-outline uppercase tracking-wider mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.skills && profile.skills.length > 0 ? (
                            profile.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-surface-variant text-[var(--md-sys-color-on-background)] text-xs font-medium rounded-lg border border-outline-variant/50">
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-outline italic">No skills added</span>
                        )}
                    </div>
                </div>
            </div>
        </Card>

        {/* Experience Section */}
        <Card className="p-6 md:p-8 bg-[var(--md-sys-color-background)]">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                <Icon name="work" className="text-primary" />
                Experience
            </h2>
            
            <div className="space-y-2">
                {profile.experiences && profile.experiences.length > 0 ? (
                    profile.experiences.map((exp, i) => (
                        <ExperienceCard 
                            key={i}
                            role={exp.role}
                            company={exp.company}
                            period={exp.period}
                            desc={exp.desc}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-outline">
                        <Icon name="work_off" size={48} className="opacity-20 mb-2" />
                        <p>No experience listed yet.</p>
                        <Button 
                            variant="text" 
                            onClick={() => onNavigate?.('cv-analysis')}
                            className="mt-2"
                        >
                            Import CV with AI
                        </Button>
                    </div>
                )}
            </div>
        </Card>

      </main>
    </div>
  );
};
