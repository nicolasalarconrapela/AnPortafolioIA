import React, { useState, useEffect, useRef } from 'react';
import { DonnaView } from './DonnaView';
import { CVProfile, ChatMessage } from '../../types_brain';
import { createGeminiService, GeminiService } from '../../services/geminiService';
import { useDonna } from '../../hooks/useDonna';
import { useAlert } from '../ui/GlobalAlert';

interface PublicProfileViewerProps {
    profile: CVProfile;
}

export const PublicProfileViewer: React.FC<PublicProfileViewerProps> = ({ profile }) => {
    const { showAlert } = useAlert();
    // For public view, we might want to support chat if possible, or just mock it.
    // For now, let's try to use useDonna if we can, otherwise manual state.

    // We can use a ref for Gemini Service, but finding an API key might be tricky for public users
    // depending on env. If no key, useDonna handles offline mode.
    const geminiServiceRef = useRef<GeminiService | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Attempt to create service (will fail gracefully if no key in env/public config)
        try {
            geminiServiceRef.current = createGeminiService();
            // Init chat context
            geminiServiceRef.current.initDonnaChat(profile).catch(() => {
                console.warn("PublicViewer: Offline mode (init failed)");
            });
        } catch (e) {
            console.warn("PublicViewer: Offline mode (create failed)");
        }
    }, [profile]);

    const {
        chat,
        setChat,
        input,
        setInput,
        loading,
        activeTab,
        setActiveTab,
        handleSend,
        isOffline,
        setIsOffline,
        suggestedQuestions
    } = useDonna(geminiServiceRef, profile);

    // Initial greeting
    useEffect(() => {
        if (chat.length === 0) {
            const name = profile.fullName || profile.experience[0]?.role || "Candidate";
            setChat([{
                id: 'intro',
                role: 'model',
                text: `¡Hola! Estás viendo el perfil público de **${name}**. ¿Tienes alguna pregunta sobre su experiencia?`,
                timestamp: new Date()
            }]);
        }
    }, [profile, chat.length, setChat]);

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "profile_public.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showAlert("Profile Link copied!", 'success');
        }).catch(err => {
            console.error("Failed to copy", err);
            showAlert("Link: " + url, 'info');
        });
    };

    return (
        <div className="w-full min-h-screen bg-[var(--md-sys-color-background)]">
            <DonnaView
                profile={profile}
                chatHistory={chat}
                input={input}
                setInput={setInput}
                loading={loading}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSend={handleSend}
                onBack={undefined} // No back button for public viewer
                chatEndRef={chatEndRef}
                isOffline={isOffline}
                setIsOffline={setIsOffline}
                suggestedQuestions={suggestedQuestions}
                onExportJSON={handleExportJSON}
                onShare={handleShare}
            // No Edit/Settings/Logout for public viewer
            />
        </div>
    );
};
