
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

interface BrainRootProps {
  userId: string;
  onSettings?: () => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
  shareToken?: string;
}

function BrainRoot({ userId, onSettings, onLogout, onEditProfile, shareToken }: BrainRootProps) {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
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
          if (data.profile) setProfile(data.profile);
          if (data.appState) {
            setAppState(data.appState as AppState);
            // If we are in DONNA state, ensure we scroll to bottom
            if (data.appState === AppState.DONNA) {
              setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
            }
          }
          // The child document 'brain/data' might not have the shareToken, as it is usually on the main workspace doc.
          // However, we can try to fetch the main workspace doc if needed, or check if 'data.shareToken' was saved here.
          // Currently, shareToken is on the ROOT workspace doc (getWorkspaceByUserFromFirestore).
          // BrainRoot only loads 'brain/data' subcollection.
          // We should probably pass shareToken as a PROP from App.tsx instead of fetching it here again?
          // OR assume the user provided ID is the userKey, so we can construct the link? No, we need the token.

          // Let's assume for now we don't fetch it here to avoid complexity unless passed.
          // Wait, 'userId' is the userKey usually.
          // If we want consistency, we should pass shareToken as a prop.

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

    // Don't save if in IDLE and no profile (empty state) unless we want to persist "reset"
    // But if we just loaded IDLE, we might not want to write it back immediately if it didn't change.
    // Simplified: Save whenever relevant state changes.

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
      alert("Public Profile Link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy", err);
      alert("Link: " + url);
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
      {(appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) && (
        <RotenmeirView
          appState={appState}
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
