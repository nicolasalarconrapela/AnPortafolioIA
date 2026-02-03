
import React, { useState, useRef, useEffect } from 'react';
import { loggingService } from '../utils/loggingService';
import { upsertWorkspaceForUser } from '../services/firestoreWorkspaces';
import { createGeminiService, GeminiService } from '../services/geminiService';
import { useFileProcessing } from '../hooks/useFileProcessing';
import { AppState, CVProfile } from '../types_brain';
import { RotenmeirView } from './brain/RotenmeirView';
import { GooglitoWizard } from './brain/GooglitoWizard';
import { cleanProfile } from '../utils/profileUtils';

interface OnboardingViewProps {
  onComplete: () => void;
  onExit: () => void;
  userId: string;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onExit, userId }) => {
  // Rotenmeir / Brain State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [profile, setProfile] = useState<CVProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null); // Store visual reference
  
  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);

  // Services
  const geminiServiceRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    geminiServiceRef.current = createGeminiService();
  }, []);

  const { processFile } = useFileProcessing(
      geminiServiceRef, 
      setProfile, 
      setAppState, 
      setError, 
      setCurrentStep,
      setFileDataUrl // Pass the setter
  );

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  
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

  const onFinishWizard = async () => {
    if (userId && profile) {
      try {
        const cleanedProfile = cleanProfile(profile);
        
        // Save the structured profile to Firestore
        await upsertWorkspaceForUser(userId, {
          profile: {
            ...cleanedProfile, // Save the full CV structure
            fullName: cleanedProfile.experience[0]?.role || "Candidate", // Fallback name
            onboardingCompleted: true
          },
          updatedAt: new Date().toISOString()
        });
        
        loggingService.info("Onboarding completed and profile saved.");
        onComplete();
      } catch (error) {
        loggingService.error("Failed to save onboarding profile", error);
        setError("Error al guardar el perfil. Por favor intenta de nuevo.");
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-surface-variant dark:bg-surface-darkVariant flex flex-col">
      
      {/* Top Navigation for Escape */}
      <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center pointer-events-none">
         <div className="pointer-events-auto">
             {/* Left side empty or brand */}
         </div>
         <button 
            onClick={onExit} 
            className="pointer-events-auto text-sm text-outline hover:text-primary bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-outline-variant"
         >
            Exit Setup
         </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
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
                onFinish={onFinishWizard}
                fileDataUrl={fileDataUrl} // Pass file reference
            />
        )}
      </div>
    </div>
  );
};
