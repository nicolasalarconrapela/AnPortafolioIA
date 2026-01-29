import React, { useState, useEffect, useRef } from 'react';
import { UploadedFile } from './OnboardingView';

interface LinkedinSyncViewProps {
  onBack: () => void;
  onComplete: () => void;
  uploadedFiles: UploadedFile[];
}

// --- SUB-COMPONENT: DATA VISUALIZER ---
const DataVisualizer: React.FC<{ data: string }> = ({ data }) => {
    const [parsedData, setParsedData] = useState<any[] | null>(null);
    const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');

    useEffect(() => {
        try {
            // Try to parse as JSON (for CSVs converted to JSON)
            const json = JSON.parse(data);
            if (Array.isArray(json) && json.length > 0) {
                setParsedData(json);
            } else {
                setParsedData(null);
            }
        } catch (e) {
            setParsedData(null);
        }
    }, [data]);

    if (!data) return <div className="text-slate-500 text-sm italic p-4 flex items-center justify-center h-full border border-dashed border-slate-700 rounded-xl">No content to display.</div>;

    return (
        <div className="flex flex-col h-full min-h-[300px]">
            {/* View Toggles */}
            <div className="flex items-center gap-2 mb-4 px-4 pt-2">
                <button 
                    onClick={() => setViewMode('visual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'visual' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-sm">wysiwyg</span>
                    {parsedData ? 'Table View' : 'Document View'}
                </button>
                <button 
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'raw' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-sm">code</span>
                    Raw Data
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[#050b14]/50 rounded-xl border border-slate-700/50 overflow-hidden mx-4 mb-4 relative">
                {viewMode === 'raw' ? (
                     <div className="absolute inset-0 overflow-auto custom-scrollbar p-4">
                        <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
                            {data}
                        </pre>
                    </div>
                ) : parsedData ? (
                    // TABLE VIEW (For CSVs)
                    <div className="absolute inset-0 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/80 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    {Object.keys(parsedData[0]).map((key) => (
                                        <th key={key} className="p-3 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700 whitespace-nowrap">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {parsedData.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="p-3 text-xs text-slate-400 border-r border-slate-800/30 last:border-0 truncate max-w-[200px]" title={String(val)}>
                                                {String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // DOCUMENT VIEW (For PDF/DOCX)
                    <div className="absolute inset-0 overflow-auto custom-scrollbar p-6 lg:p-8 bg-white/5">
                        <div className="max-w-2xl mx-auto space-y-4">
                            {data.split('\n').map((line, i) => {
                                const cleanLine = line.trim();
                                if (!cleanLine) return <br key={i} />;
                                
                                // Heuristics for formatting
                                const isBullet = cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.match(/^\d+\./);
                                const isHeader = cleanLine.length < 50 && cleanLine.toUpperCase() === cleanLine && !isBullet;
                                
                                if (isHeader) {
                                    return <h4 key={i} className="text-white font-bold text-sm mt-4 pb-1 border-b border-slate-700">{cleanLine}</h4>;
                                }
                                if (isBullet) {
                                    return (
                                        <div key={i} className="flex gap-2 text-xs text-slate-300 ml-4">
                                            <span className="text-cyan-500 mt-0.5">•</span>
                                            <span>{cleanLine.replace(/^[•-]\s*/, '')}</span>
                                        </div>
                                    );
                                }
                                return <p key={i} className="text-xs text-slate-400 leading-relaxed">{cleanLine}</p>;
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const LinkedinSyncView: React.FC<LinkedinSyncViewProps> = ({ onBack, onComplete, uploadedFiles }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  const currentFile = uploadedFiles[activeFileIndex];

  // Cleaned chat history
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "System initialized. Analyzing your documents...", time: 'Now' },
  ]);

  // Update chat when data arrives
  useEffect(() => {
      if(uploadedFiles.length > 0) {
          setMessages(prev => [...prev, {
              id: Date.now(),
              sender: 'ai',
              text: `${uploadedFiles.length} file(s) loaded securely. I've switched context to "${currentFile?.name}".`,
              time: 'Now'
          }]);
      }
  }, [uploadedFiles, activeFileIndex]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col gap-5 animate-fade-in text-left relative min-h-full">
        
        {/* Header Profile Card - Generic */}
        <div className="flex flex-col md:flex-row gap-5 p-5 rounded-2xl bg-[#0a101f]/80 border border-slate-700/50 items-start md:items-center shadow-lg shrink-0">
             {/* Avatar & Info */}
             <div className="relative shrink-0">
                 <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-slate-500">folder_open</span>
                 </div>
             </div>
             <div className="flex-1 min-w-0">
                 <h2 className="text-xl md:text-2xl font-bold text-white leading-tight truncate">
                     {uploadedFiles.length > 1 ? "Multiple Documents" : (currentFile?.name || "Imported Data")}
                 </h2>
                 <p className="text-cyan-400 font-medium text-sm mt-0.5">
                    {uploadedFiles.length} File{uploadedFiles.length !== 1 ? 's' : ''} Processed
                    <span className="text-slate-600 mx-1">|</span> 
                    <span className="text-slate-300">Ready for Extraction</span>
                 </p>
                 <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">verified_user</span> Secure Batch Upload</span>
                 </div>
             </div>
             <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                 <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={onBack} className="flex-1 md:flex-none px-4 py-2 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        Manage Files
                    </button>
                    <button className="flex-1 md:flex-none px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-default">
                        <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
                        Parsing Complete
                    </button>
                 </div>
             </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5 overflow-visible lg:overflow-hidden">
            {/* Left Column: Data Review / Extracted Text */}
            <div className="flex-1 overflow-visible lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar space-y-5 flex flex-col">
                
                {/* Data Visualizer Container */}
                <div className="bg-[#0f1623] border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col min-h-[400px] h-full">
                    
                    {/* File Tabs / Selector */}
                    <div className="flex overflow-x-auto no-scrollbar border-b border-slate-700/50 bg-slate-900/30">
                        {uploadedFiles.map((file, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveFileIndex(idx)}
                                className={`px-4 py-3 text-xs font-bold border-r border-slate-700/50 flex items-center gap-2 whitespace-nowrap transition-all ${
                                    activeFileIndex === idx 
                                    ? 'bg-slate-800 text-cyan-400 shadow-[inset_0_-2px_0_#22d3ee]' 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {file.type === 'PDF' ? 'picture_as_pdf' : 'description'}
                                </span>
                                {file.name}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-cyan-400 text-base">description</span> 
                            {currentFile?.name}
                        </h3>
                        {currentFile && (
                             <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                                {currentFile.size > 1024 ? `${(currentFile.size / 1024).toFixed(1)} KB` : `${currentFile.size} B`}
                             </span>
                        )}
                    </div>
                    
                    <DataVisualizer data={currentFile?.data || ""} />
                </div>
            </div>

            {/* Right Column: Chat (TalentFlow AI) */}
            <div className="w-full lg:w-[380px] flex flex-col bg-[#0a101f] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shrink-0 h-[500px] lg:h-auto ring-1 ring-white/5 order-first lg:order-last">
                {/* Chat Header */}
                <div className="px-5 py-4 border-b border-slate-800 bg-[#0f1623] flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#0f1623] rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white leading-none">TalentFlow AI</h4>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Interviewing Agent</span>
                        </div>
                    </div>
                    <button className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                </div>

                {/* Context Bar */}
                <div className="px-4 py-2 bg-[#0a101f]/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
                        <span className="material-symbols-outlined text-xs">target</span>
                        Focus: {currentFile?.name.substring(0, 15)}...
                    </div>
                </div>

                {/* Chat Messages */}
                <div ref={scrollRef} className="flex-1 p-4 space-y-5 overflow-y-auto bg-slate-900/20 scroll-smooth min-h-[300px]">
                    {messages.map((msg) => (
                         <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm mt-1 ${
                                msg.sender === 'ai' 
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                                : 'border-slate-600 overflow-hidden bg-slate-800'
                            }`}>
                                {msg.sender === 'ai' 
                                    ? <span className="material-symbols-outlined text-xs">smart_toy</span> 
                                    : <span className="material-symbols-outlined text-xs text-slate-400">person</span>
                                }
                            </div>
                            <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-3 text-xs leading-relaxed shadow-md ${
                                    msg.sender === 'ai' 
                                    ? 'bg-[#1e293b] text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700/50' 
                                    : 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-500/50'
                                }`}>
                                    {typeof msg.text === 'string' ? msg.text : msg.text}
                                </div>
                                <span className="text-[9px] text-slate-500 mt-1.5 px-1 font-medium">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                    
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700/50 bg-[#0f1623] relative z-20">
                    {/* Glowing Input */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-50 transition duration-500 blur"></div>
                        <div className="relative bg-[#0a101f] rounded-xl p-1.5 flex gap-2 border border-slate-700 group-hover:border-slate-600 transition-colors">
                            <input 
                                className="bg-transparent flex-1 text-xs text-white px-3 py-2.5 outline-none placeholder-slate-500 font-medium" 
                                placeholder="Type your answer..." 
                            />
                            <div className="flex items-center gap-1 pr-1">
                                 <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 active:scale-95"><span className="material-symbols-outlined text-lg">mic</span></button>
                                 <button className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"><span className="material-symbols-outlined text-lg">send</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between shrink-0">
             <button onClick={onBack} className="text-slate-500 hover:text-white text-xs font-bold px-4 py-2 transition-colors flex items-center gap-2 group">
                <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Back
             </button>
             <button onClick={onComplete} className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 active:scale-95">
                Confirm & Continue
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
             </button>
        </div>
    </div>
  )
}