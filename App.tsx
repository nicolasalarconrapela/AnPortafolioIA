import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Send, RefreshCw, MessageSquare, Briefcase, CheckCircle, AlertCircle, Download, FileJson, Sparkles, X, ChevronRight } from 'lucide-react';
import { Button } from './components/Button';
import { MarkdownView } from './components/MarkdownView';
import { createGeminiService, GeminiService } from './services/geminiService';
import { ChatMessage, AppState } from './types';

const IMPROVEMENT_OPTIONS = [
  { id: 'summary', label: 'Resumen Profesional', prompt: 'Por favor, reescribe mi Resumen Profesional (Perfil) para que sea más impactante, ejecutivo y destaque mi valor único.' },
  { id: 'experience', label: 'Experiencia Laboral', prompt: 'Analiza mis descripciones de experiencia laboral. Reescríbelas usando verbos de acción fuertes, eliminando la voz pasiva y enfocándote en logros cuantificables.' },
  { id: 'skills', label: 'Habilidades', prompt: 'Sugiere una mejor organización para mis Habilidades (Skills). Agrúpalas por categorías técnicas y blandas, y añade alguna que pueda faltar según mi perfil.' },
  { id: 'spelling', label: 'Ortografía y Gramática', prompt: 'Revisa todo el documento en busca de errores ortográficos, gramaticales o de estilo y lístalos con su corrección.' }
];

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [cvImage, setCvImage] = useState<string | null>(null);
  const [cvMimeType, setCvMimeType] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImproveModal, setShowImproveModal] = useState(false);
  
  // Use a ref to persist the service instance across renders without triggering re-renders
  const geminiServiceRef = useRef<GeminiService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize service once
  useEffect(() => {
    geminiServiceRef.current = createGeminiService();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, analysis, isSending]); // Scroll when sending status changes too

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate generic image types and PDF
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      setError("Por favor, sube un archivo de imagen (PNG, JPG) o un PDF.");
      return;
    }

    setAppState(AppState.ANALYZING);
    setError(null);
    setCvMimeType(file.type);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      // Extract pure base64 for API (remove data:application/pdf;base64, prefix)
      const base64Data = base64String.split(',')[1]; 
      
      setCvImage(base64String);

      if (geminiServiceRef.current) {
        try {
          const result = await geminiServiceRef.current.analyzeCV(base64Data, file.type);
          setAnalysis(result);
          setAppState(AppState.READY);
        } catch (err: any) {
          setError(err.message || "Error al analizar el CV. Inténtalo de nuevo.");
          setAppState(AppState.ERROR);
        }
      }
    };
    reader.onerror = () => {
      setError("Error leyendo el archivo.");
      setAppState(AppState.ERROR);
    };
    reader.readAsDataURL(file);
  };

  const handleImportSession = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError("Por favor, sube un archivo JSON válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Simple validation
        if (!json.cvImage || !json.analysis || !Array.isArray(json.chatHistory)) {
          throw new Error("Formato de archivo inválido.");
        }

        setAppState(AppState.ANALYZING); // Temporary loading state
        setError(null);

        // Restore State
        setCvImage(json.cvImage);
        setCvMimeType(json.cvMimeType);
        setAnalysis(json.analysis);
        
        // Restore Chat History timestamps (JSON strings to Date objects)
        const restoredHistory = json.chatHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setChatHistory(restoredHistory);

        // Re-initialize Gemini Service Context
        geminiServiceRef.current = createGeminiService();
        const base64Data = json.cvImage.split(',')[1];
        
        await geminiServiceRef.current.resumeSession(
          json.analysis,
          restoredHistory,
          base64Data,
          json.cvMimeType
        );

        setAppState(AppState.READY);

      } catch (err: any) {
        console.error(err);
        setError("Error al cargar la sesión: " + (err.message || "Archivo corrupto"));
        setAppState(AppState.ERROR);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleExportSession = () => {
    if (!cvImage || !analysis) return;

    const sessionData = {
      timestamp: new Date().toISOString(),
      cvImage,
      cvMimeType,
      analysis,
      chatHistory
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-analisis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Modified to accept optional text override
  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    
    const textToSend = textOverride || inputMessage;

    if (!textToSend.trim() || isSending || appState !== AppState.READY) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage(""); // Clear input even if it was an override
    setIsSending(true);

    try {
      if (geminiServiceRef.current) {
        const responseText = await geminiServiceRef.current.sendChatMessage(userMsg.text);
        
        const modelMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: new Date()
        };
        
        setChatHistory(prev => [...prev, modelMsg]);
      }
    } catch (err) {
      console.error(err);
      // Optional: Add error message to chat
    } finally {
      setIsSending(false);
    }
  };

  const handleImprovementSelect = (prompt: string) => {
    setShowImproveModal(false);
    handleSendMessage(undefined, prompt);
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setCvImage(null);
    setCvMimeType("");
    setAnalysis("");
    setChatHistory([]);
    setError(null);
    setShowImproveModal(false);
    // Re-initialize service for a fresh session
    geminiServiceRef.current = createGeminiService();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Analizador de CV Pro</h1>
            <p className="text-xs text-slate-500 font-medium">Potenciado por Gemini 3 Pro</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {appState === AppState.READY && (
            <Button variant="secondary" onClick={handleExportSession} icon={<Download className="w-4 h-4" />}>
              Guardar Sesión
            </Button>
          )}
          {appState !== AppState.IDLE && (
            <Button variant="outline" onClick={resetApp} icon={<RefreshCw className="w-4 h-4" />}>
              Nuevo Análisis
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* Upload State (IDLE) */}
        {appState === AppState.IDLE && (
          <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="max-w-xl w-full text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Optimiza tu perfil profesional</h2>
                <p className="text-lg text-slate-600">Sube tu CV (PDF o imagen) y recibe un análisis instantáneo detallado, sugerencias de mejora y practica con nuestro chat inteligente.</p>
              </div>

              <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors shadow-sm group">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cv-upload" className="cursor-pointer block">
                      <span className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md inline-block">
                        Seleccionar CV (PDF o Imagen)
                      </span>
                      <input 
                        id="cv-upload" 
                        type="file" 
                        accept="image/*,application/pdf" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="text-sm text-slate-400">Formatos soportados: PDF, PNG, JPG</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                 <p className="text-sm text-slate-400 mb-2">¿Ya tienes un análisis guardado?</p>
                 <label htmlFor="session-upload" className="cursor-pointer inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    <FileJson className="w-4 h-4 mr-1" />
                    Cargar sesión previa (.json)
                    <input 
                        id="session-upload" 
                        type="file" 
                        accept="application/json" 
                        className="hidden" 
                        onChange={handleImportSession}
                      />
                 </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {appState === AppState.ANALYZING && (
          <div className="h-full flex flex-col items-center justify-center space-y-6 bg-white/50 backdrop-blur-sm">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">Procesando...</h3>
              <p className="text-slate-500">Gemini está analizando los datos.</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
           <div className="h-full flex flex-col items-center justify-center space-y-6">
             <div className="bg-red-50 p-8 rounded-2xl text-center max-w-md border border-red-100">
               <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-red-800 mb-2">Ocurrió un error</h3>
               <p className="text-red-600 mb-6">{error || "No se pudo completar el análisis."}</p>
               <Button onClick={resetApp}>Intentar de nuevo</Button>
             </div>
           </div>
        )}

        {/* Ready State (Split View) */}
        {appState === AppState.READY && (
          <div className="h-full flex flex-col lg:flex-row overflow-hidden relative">
            
            {/* Modal Overlay for Improvements */}
            {showImproveModal && (
              <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <h3 className="font-bold text-lg">Mejorar CV</h3>
                    </div>
                    <button onClick={() => setShowImproveModal(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50">
                    <p className="text-sm text-slate-500 mb-4 px-1">Selecciona qué sección te gustaría optimizar con IA:</p>
                    <div className="space-y-2">
                      {IMPROVEMENT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleImprovementSelect(option.prompt)}
                          className="w-full text-left bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group flex justify-between items-center"
                        >
                          <span className="font-medium text-slate-800 group-hover:text-blue-700">{option.label}</span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Left Panel: Analysis & CV Preview */}
            <div className="flex-1 lg:flex-[0.55] bg-white overflow-y-auto scrollbar-thin border-r border-slate-200 p-6 lg:p-8">
               
               <div className="max-w-3xl mx-auto space-y-8">
                  {/* Analysis Result */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
                       <CheckCircle className="w-6 h-6 text-emerald-500" />
                       <h2 className="text-2xl font-bold text-slate-800">Análisis del Perfil</h2>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-sm">
                      <MarkdownView content={analysis} />
                    </div>
                  </div>

                  {/* Document Preview Removed */}
               </div>
            </div>

            {/* Right Panel: Chat */}
            <div className="flex-1 lg:flex-[0.45] bg-slate-50 flex flex-col h-[50vh] lg:h-auto border-t lg:border-t-0 border-slate-200 shadow-inner">
               <div className="p-4 bg-white border-b border-slate-200 flex items-center space-x-2 sticky top-0 z-10">
                 <MessageSquare className="w-5 h-5 text-blue-600" />
                 <h3 className="font-semibold text-slate-800">Asistente de Carrera</h3>
               </div>
               
               {/* Messages List */}
               <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                 {/* Intro Bubble */}
                 <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none py-3 px-4 max-w-[85%] shadow-sm text-sm">
                      <p>Hola. He analizado tu CV. ¿Tienes alguna pregunta sobre cómo mejorarlo o quieres simular una entrevista?</p>
                    </div>
                 </div>

                 {chatHistory.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`
                        max-w-[85%] rounded-2xl py-3 px-4 text-sm shadow-sm
                        ${msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}
                      `}>
                        {msg.role === 'model' ? <MarkdownView content={msg.text} /> : msg.text}
                      </div>
                   </div>
                 ))}
                 
                 {isSending && (
                   <div className="flex justify-start">
                     <div className="bg-slate-100 rounded-2xl rounded-tl-none py-3 px-4 flex items-center space-x-1">
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                     </div>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>

               {/* Input Area */}
               <div className="p-4 bg-white border-t border-slate-200 relative">
                 {/* Improvement Bubble Trigger */}
                 {!showImproveModal && !isSending && (
                   <div className="absolute -top-10 left-4">
                     <button 
                        onClick={() => setShowImproveModal(true)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full px-4 py-1.5 text-xs font-semibold flex items-center shadow-sm transition-all hover:scale-105"
                     >
                       <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                       Mejorar una sección
                     </button>
                   </div>
                 )}

                 <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center space-x-2">
                   <input
                     type="text"
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     placeholder="Haz una pregunta sobre tu CV..."
                     className="flex-1 bg-slate-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-full px-4 py-3 text-sm focus:outline-none transition-all"
                     disabled={isSending}
                   />
                   <Button 
                     type="submit" 
                     className="!rounded-full w-12 h-12 !p-0 flex items-center justify-center"
                     disabled={!inputMessage.trim() || isSending}
                   >
                     <Send className="w-5 h-5 ml-1" />
                   </Button>
                 </form>
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;