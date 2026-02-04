import React, { useState, useEffect, useRef } from 'react';
import { listenWorkspaceByUser, upsertWorkspaceForUser } from '../services/firestoreWorkspaces';
import { SettingsModal } from './SettingsModal';
import { Button } from './ui/Button';
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
      alert("Error al guardar los cambios en la base de datos: " + e);
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
      alert("Public Profile Link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy", err);
      alert("Link: " + url);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--md-sys-color-background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-outline text-sm animate-pulse">Cargando perfil...</p>
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

      {/* Floating Header Actions removed - now using integrated nav in DonnaView */}

      {isEditing ? (
        <div className="bg-[var(--md-sys-color-background)] min-h-screen">
          {/* Wizard Mode */}
          <GooglitoWizard
            currentStep={currentWizardStep}
            setCurrentStep={setCurrentWizardStep}
            profile={profile}
            setProfile={setProfile} // Optimistic update
            onExportJSON={handleExportJSON}
            onFinish={() => handleSaveProfile(profile)}
          />
          <div className="fixed top-4 right-4 z-50">
            <Button variant="outlined" onClick={() => setIsEditing(false)}>Cancel Editing</Button>
          </div>
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
