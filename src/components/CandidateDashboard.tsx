import React, { useState, useEffect, useRef } from 'react';
import { listenWorkspaceByUser, upsertWorkspaceForUser } from '../services/firestoreWorkspaces';
import { SettingsModal } from './SettingsModal';
import { Button } from './ui/Button';
import { useAlert } from './ui/GlobalAlert';
import { CVProfile } from '../types_brain';
import { DonnaView } from './brain/DonnaView';
import { GooglitoWizard } from './brain/GooglitoWizard';
import { GeminiService, createGeminiService } from '../services/geminiService';
import { useDonna } from '../hooks/useDonna';
import { cleanProfile } from '../utils/profileUtils';
import { loggingService } from '../utils/loggingService';

interface CandidateDashboardProps {
  onLogout: () => void;
  userId: string;
  onNavigate?: (view: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onLogout, userId, onNavigate }) => {
  const [profile, setProfile] = useState<CVProfile | null>(null);
  const { showAlert } = useAlert();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // Gemini & Donna State
  const geminiServiceRef = useRef<GeminiService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geminiServiceRef.current = createGeminiService();
  }, []);

  const {
    chat,
    setChat,
    input,
    setInput,
    loading: donnaLoading,
    activeTab: donnaActiveTab,
    setActiveTab: setDonnaActiveTab,
    handleSend: handleDonnaSend,
    isOffline,
    setIsOffline,
    suggestedQuestions
  } = useDonna(geminiServiceRef, profile);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      const unsubscribe = listenWorkspaceByUser(
        userId,
        (data) => {
          setIsLoading(false);
          if (data && data.profile) {
            if (data.shareToken) {
              setShareToken(data.shareToken);
            }
            // Map Firestore data to CVProfile structure if needed
            // Assuming Onboarding saved it correctly, but providing fallbacks
            const rawProfile = data.profile;
            const safeProfile: CVProfile = {
              fullName: rawProfile.fullName || "",
              summary: rawProfile.summary || "",
              experience: Array.isArray(rawProfile.experience) ? rawProfile.experience : [],
              education: Array.isArray(rawProfile.education) ? rawProfile.education : [],
              skills: Array.isArray(rawProfile.skills) ? rawProfile.skills : [],
              techStack: rawProfile.techStack || { languages: [], ides: [], frameworks: [], tools: [] },
              projects: Array.isArray(rawProfile.projects) ? rawProfile.projects : [],
              volunteering: Array.isArray(rawProfile.volunteering) ? rawProfile.volunteering : [],
              awards: Array.isArray(rawProfile.awards) ? rawProfile.awards : [],
              languages: Array.isArray(rawProfile.languages) ? rawProfile.languages : [],
              hobbies: Array.isArray(rawProfile.hobbies) ? rawProfile.hobbies : [],
              donnaImage: rawProfile.donnaImage
            };
            setProfile(safeProfile);

            // Initialize Donna Chat if service available
            if (geminiServiceRef.current && safeProfile.experience.length > 0) {
              geminiServiceRef.current.initDonnaChat(safeProfile).catch(() => setIsOffline(true));
            }
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

  // Initial greeting from Donna
  useEffect(() => {
    if (profile && chat.length === 0) {
      const name = profile.fullName || profile.experience[0]?.role || "Candidato";
      setChat([{
        id: 'intro',
        role: 'model',
        text: `¡Hola! Soy Donna. He preparado el perfil de **${name}**. ¿Qué te gustaría saber?`,
        timestamp: new Date()
      }]);
    }
  }, [profile, chat.length, setChat]);

  // Scroll chat on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSaveProfile = async (updatedProfile: CVProfile) => {
    if (!userId) return;

    // 1. Prepare data
    const cleaned = cleanProfile(updatedProfile);
    setProfile(cleaned);

    try {
      // 2. Critical: Save to Firestore
      await upsertWorkspaceForUser(userId, {
        profile: {
          ...cleaned,
          updatedAt: new Date().toISOString()
        }
      });

      loggingService.info("Profile updated via Wizard");
    } catch (e) {
      loggingService.error("Error saving profile to Firestore", e);
      showAlert("Error al guardar los cambios en la base de datos: " + e, 'error');
      return; // Stop here if save fails
    }

    // 3. UI Update (Success)
    setIsEditing(false); // Return to Donna View

    // 4. Non-Critical: Re-init AI
    if (geminiServiceRef.current) {
      try {
        await geminiServiceRef.current.initDonnaChat(cleaned);

        // Only show confirmation message if AI is working
        setChat(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "He actualizado mi base de conocimientos con los últimos cambios del perfil.",
          timestamp: new Date()
        }]);

        setIsOffline(false);
      } catch (e) {
        console.warn("Could not re-init Gemini after save, checking offline mode", e);
        // Fallback to offline mode silently or with a small toast, but don't block the UI
        setIsOffline(true);
      }
    }
  };

  const handleExportJSON = () => {
    if (!profile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "profile.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleShare = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/?token=${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      showAlert("Public Profile Link copied to clipboard!", 'success');
    }).catch(err => {
      console.error("Failed to copy", err);
      showAlert("Link: " + url, 'info');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20 animate-fade-in">
        {/* Navigation Skeleton */}
        <div className="sticky top-0 z-40 bg-white/80 border-b border-slate-200/60 px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="w-32 h-8 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex gap-3 items-center">
            <div className="hidden md:block w-24 h-9 bg-slate-200 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column Skeleton */}
            <div className="lg:col-span-8 space-y-10">
              {/* Header Card Skeleton */}
              <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] bg-slate-200 animate-pulse shrink-0 rotate-[-3deg]" />
                  <div className="space-y-4 flex-1 w-full">
                    <div className="w-3/4 h-10 md:h-14 bg-slate-200 rounded-xl animate-pulse" />
                    <div className="w-1/3 h-6 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-full h-4 bg-slate-50 rounded animate-pulse" />
                  <div className="w-full h-4 bg-slate-50 rounded animate-pulse" />
                  <div className="w-2/3 h-4 bg-slate-50 rounded animate-pulse" />
                </div>
                <div className="flex gap-2 mt-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-20 h-6 bg-slate-100 rounded-md animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-28 h-10 bg-slate-200 rounded-full animate-pulse opacity-50" />
                ))}
              </div>

              {/* Experience List Skeleton */}
              <div className="space-y-8 pl-4 border-l-2 border-slate-100">
                {[1, 2].map((i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0 animate-pulse" />
                    <div className="flex-1 space-y-4">
                      <div className="w-48 h-6 bg-slate-200 rounded animate-pulse" />
                      <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-3">
                        <div className="flex justify-between">
                          <div className="w-1/3 h-6 bg-slate-200 rounded animate-pulse" />
                          <div className="w-24 h-4 bg-slate-100 rounded animate-pulse" />
                        </div>
                        <div className="w-full h-3 bg-slate-50 rounded animate-pulse mt-4" />
                        <div className="w-5/6 h-3 bg-slate-50 rounded animate-pulse" />
                        <div className="w-4/6 h-3 bg-slate-50 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm h-72 animate-pulse" />
              <div className="bg-slate-900/10 rounded-2xl h-24 animate-pulse" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--md-sys-color-background)]">
        <div className="text-center">
          <p className="text-outline mb-4">No se encontró perfil.</p>
          <Button onClick={() => onNavigate?.('candidate-onboarding')}>Ir al Setup</Button>
          <div className="mt-4">
            <Button variant="text" onClick={onLogout}>Cerrar Sesión</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-variant dark:bg-surface-darkVariant flex flex-col">
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          userKey={userId || ""}
          onNavigate={onNavigate}
        />
      )}

      {isEditing ? (
        <div className="bg-[var(--md-sys-color-background)] min-h-screen">
          {/* Wizard Mode */}
          <GooglitoWizard
            currentStep={currentWizardStep}
            setCurrentStep={setCurrentWizardStep}
            profile={profile}
            setProfile={setProfile} // Optimistic update
            onExportJSON={handleExportJSON}
            onReset={() => onNavigate?.('cv-analysis')}
            onFinish={() => handleSaveProfile(profile)}
          />
        </div>
      ) : (
        /* Donna Mode (Home) */
        <DonnaView
          profile={profile}
          chatHistory={chat}
          input={input}
          setInput={setInput}
          loading={donnaLoading}
          activeTab={donnaActiveTab}
          setActiveTab={setDonnaActiveTab}
          onSend={handleDonnaSend}
          onBack={() => setIsEditing(true)} // Back acts as Edit trigger
          chatEndRef={chatEndRef}
          isOffline={isOffline}
          setIsOffline={setIsOffline}
          suggestedQuestions={suggestedQuestions}
          onExportJSON={handleExportJSON}
          onEdit={() => setIsEditing(true)}
          onSettings={() => setIsSettingsOpen(true)}
          onLogout={onLogout}
          onShare={shareToken ? handleShare : undefined}
        />
      )}
    </div>
  );
};
