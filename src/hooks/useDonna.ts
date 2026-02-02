import { useState, MutableRefObject, FormEvent } from "react";
import { GeminiService } from "../services/geminiService";
import { ChatMessage, CVProfile } from "../types_brain";
import { getOfflineResponse, PREDEFINED_QUESTIONS } from "../utils/offlineChat";

export const useDonna = (
  geminiServiceRef: MutableRefObject<GeminiService | null>,
  profile: CVProfile | null
) => {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "experience" | "education" | "projects" | "skills"
  >("experience");

  const handleSend = async (e?: FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || input;

    if (!textToSend.trim() || loading) return;

    // Check if service is available for online mode, otherwise force offline logic if user wants or if service missing
    if (!isOffline && !geminiServiceRef.current) {
      // Fallback silently or alert? For now let's assume if service is missing we just don't run or we could auto-switch.
      // But the user might be offline intentionally.
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date(),
    };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (isOffline) {
      // Offline logic simulation delay
      setTimeout(() => {
        const response = getOfflineResponse(textToSend, profile);
        setChat((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "model",
            text: response,
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      if (geminiServiceRef.current) {
        const response = await geminiServiceRef.current.talkToDonna(
          userMsg.text
        );
        setChat((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "model",
            text: response,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
      setChat((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: "Lo siento, tuve un problema de conexión. Intenta cambiar al modo Offline.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
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
    suggestedQuestions: PREDEFINED_QUESTIONS,
  };
};
