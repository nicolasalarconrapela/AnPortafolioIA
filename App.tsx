import React, { useState, useRef, useEffect } from 'react';
import { createGeminiService, GeminiService } from './services/geminiService';
import { AppState, CVProfile } from './types';
import { useFileProcessing } from './hooks/useFileProcessing';
import { useDonna } from './hooks/useDonna';
import { cleanProfile } from './utils/profileUtils';
import { RotenmeirView } from './components/RotenmeirView';
import { GooglitoWizard } from './components/GooglitoWizard';
import { DonnaView } from './components/DonnaView';

function App() {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [currentStep, setCurrentStep] = useState(0);
    const [profile, setProfile] = useState<CVProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const onFinishWizard = async () => {
        if (geminiServiceRef.current && profile) {
            const cleanedProfile = cleanProfile(profile);
            setProfile(cleanedProfile);
            await geminiServiceRef.current.initDonnaChat(cleanedProfile);
            setChat([{ id: 'intro', role: 'model', text: `¡Hola! Soy Donna, tu asistente de reclutamiento. He analizado el perfil de **${cleanedProfile.experience[0]?.role || "Candidato"}** a fondo. ¿Qué te gustaría saber?`, timestamp: new Date() }]);
            setAppState(AppState.DONNA);
        }
    };

    return (
        <>
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
                />
            )}
        </>
    );
}

export default App;
