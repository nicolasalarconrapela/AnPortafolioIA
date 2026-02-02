import { useState, MutableRefObject, FormEvent } from "react";
import { GeminiService } from "../services/geminiService";
import { ChatMessage } from "../types";

export const useDonna = (
  geminiServiceRef: MutableRefObject<GeminiService | null>
) => {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "experience" | "education" | "projects" | "skills"
  >("experience");

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !geminiServiceRef.current) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const response = await geminiServiceRef.current.talkToDonna(userMsg.text);
      setChat((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: response,
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      console.error(e);
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
  };
};
