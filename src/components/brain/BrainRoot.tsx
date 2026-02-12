
import React, { useState, useRef, useEffect } from 'react';
import { createGeminiService, GeminiService } from '../../services/geminiService';
import { AppState, CVProfile } from '../../types_brain';
import { useFileProcessing } from '../../hooks/useFileProcessing';
import { useDonna } from '../../hooks/useDonna';
import { cleanProfile } from '../../utils/profileUtils';
import { RotenmeirView } from './RotenmeirView';
import { GooglitoWizard } from './GooglitoWizard';
import { DonnaView } from './DonnaView';
import { getWorkspaceChildDocument, upsertWorkspaceChildDocument } from '../../services/firestoreWorkspaces';
import { useAlert } from '../ui/GlobalAlert';

interface BrainRootProps {
  userId: string;
  onSettings?: () => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
  shareToken?: string;
}

function BrainRoot({ userId, onSettings, onLogout, onEditProfile, shareToken }: BrainRootProps) {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const { showAlert } = useAlert();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<CVProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Rotenmeir state
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const geminiServiceRef = useRef<GeminiService | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geminiServiceRef.current = createGeminiService();
  }, []);

  const { processFile } = useFileProcessing(geminiServiceRef, setProfile, setAppState, setError, setCurrentStep);
  const { chat, setChat, input, setInput, loading: donnaLoading, activeTab: donnaActiveTab, setActiveTab: setDonnaActiveTab, handleSend: handleDonnaSend, isOffline, setIsOffline, suggestedQuestions } = useDonna(geminiServiceRef, profile);

  // Load data from Firestore
  useEffect(() => {
    if (!userId) {
      setIsLoaded(true);
      return;
    }

    const loadData = async () => {
      try {
        const data = await getWorkspaceChildDocument(userId, "brain", "data");
        if (data) {
          // IMPORTANT: Load profile FIRST, then appState.
          // If appState is WIZARD/DONNA but profile is missing, fall back to IDLE
          // to prevent a white screen (no view renders when profile is null).
          const loadedProfile = data.profile || null;
          if (loadedProfile) setProfile(loadedProfile);

          if (data.appState) {
            const targetState = data.appState as AppState;
            const needsProfile = targetState === AppState.WIZARD || targetState === AppState.DONNA;

            if (needsProfile && !loadedProfile) {
              // Profile-dependent state but no profile → reset to IDLE
              console.warn("BrainRoot: appState was", targetState, "but profile is missing. Resetting to IDLE.");
              setAppState(AppState.IDLE);
            } else {
              setAppState(targetState);
              if (targetState === AppState.DONNA) {
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
              }
            }
          }

          if (typeof data.currentStep === 'number') setCurrentStep(data.currentStep);
          if (typeof data.isOffline === 'boolean') setIsOffline(data.isOffline);

          if (data.chat && Array.isArray(data.chat)) {
            const restoredChat = data.chat.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setChat(restoredChat);
          }
        }
      } catch (error) {
        console.error("BrainRoot: Failed to load data", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [userId, setChat, setIsOffline]); // Added deps

  // Save data to Firestore (Debounced or on change)
  useEffect(() => {
    if (!userId || !isLoaded) return;

    // SAFETY: Don't save if appState requires a profile but profile is null.
    // This prevents overwriting valid Firestore data with empty/broken state.
    const needsProfile = appState === AppState.WIZARD || appState === AppState.DONNA;
    if (needsProfile && !profile) {
      console.warn("BrainRoot: Skipping save — appState is", appState, "but profile is null.");
      return;
    }

    const saveData = async () => {
      const dataToSave = {
        profile,
        appState,
        chat,
        currentStep,
        isOffline,
        lastUpdated: new Date().toISOString()
      };

      try {
        await upsertWorkspaceChildDocument(userId, "brain", "data", dataToSave);
      } catch (error) {
        console.error("BrainRoot: Failed to save data", error);
      }
    };

    const timeoutId = setTimeout(saveData, 1000); // 1s debounce
    return () => clearTimeout(timeoutId);
  }, [userId, isLoaded, profile, appState, chat, currentStep, isOffline]);

  useEffect(() => {
    if (appState === AppState.DONNA) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, appState]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleExportJSON = () => {
    if (!profile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "perfil_rotenmeir.json");
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

  const onFinishWizard = async () => {
    if (profile) {
      const cleanedProfile = cleanProfile(profile);
      setProfile(cleanedProfile);

      if (geminiServiceRef.current) {
        try {
          await geminiServiceRef.current.initDonnaChat(cleanedProfile);
        } catch (e) {
          console.warn("Could not init Gemini chat, enabling offline mode", e);
          setIsOffline(true);
        }
      } else {
        setIsOffline(true);
      }

      setChat([{ id: 'intro', role: 'model', text: `¡Hola! Soy Donna, tu asistente de reclutamiento. He analizado el perfil de **${cleanedProfile.experience[0]?.role || "Candidato"}** a fondo. ¿Qué te gustaría saber?`, timestamp: new Date() }]);
      setAppState(AppState.DONNA);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--md-sys-color-background)] transition-colors duration-300">
      {/* Show RotenmeirView for IDLE/ANALYZING/ERROR states, OR as a fallback
          when appState requires a profile (WIZARD/DONNA) but profile is null */}
      {((appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) ||
        ((appState === AppState.WIZARD || appState === AppState.DONNA) && !profile)) && (
          <RotenmeirView
            appState={appState === AppState.WIZARD || appState === AppState.DONNA ? AppState.IDLE : appState}
            error={error}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileUpload={handleFileUpload}
          />
        )}
      {appState === AppState.WIZARD && profile && (
        <GooglitoWizard
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          profile={profile}
          setProfile={(p) => setProfile(p)}
          onExportJSON={handleExportJSON}
          onReset={() => setAppState(AppState.IDLE)}
          onFinish={onFinishWizard}
        />
      )}
      {appState === AppState.DONNA && profile && (
        <DonnaView
          profile={profile}
          chatHistory={chat}
          input={input}
          setInput={setInput}
          loading={donnaLoading}
          activeTab={donnaActiveTab}
          setActiveTab={setDonnaActiveTab}
          onSend={handleDonnaSend}
          onBack={() => setAppState(AppState.WIZARD)}
          chatEndRef={chatEndRef}
          isOffline={isOffline}
          setIsOffline={setIsOffline}
          suggestedQuestions={suggestedQuestions}
          onExportJSON={handleExportJSON}
          onSettings={onSettings}
          onLogout={onLogout}
          onEdit={onEditProfile || (() => setAppState(AppState.WIZARD))}
          onShare={shareToken ? handleShare : undefined}
        />
      )}
    </div>
  );
}

export default BrainRoot;
