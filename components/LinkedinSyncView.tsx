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
    const [isOCRData, setIsOCRData] = useState(false);

    useEffect(() => {
        try {
            const json = JSON.parse(data);
            if (Array.isArray(json) && json.length > 0) {
                setParsedData(json);
                if (json[0].region && json[0].content) {
                    setIsOCRData(true);
                } else {
                    setIsOCRData(false);
                }
            } else {
                setParsedData(null);
            }
        } catch (e) {
            setParsedData(null);
        }
    }, [data]);

    if (!data) return <div className="text-outline text-sm italic p-8 flex items-center justify-center h-full">No content to display.</div>;

    const renderOCRStructure = () => (
        <div className="overflow-auto custom-scrollbar p-6 space-y-4 h-full bg-surface-variant/30">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Document Analysis</h4>
                <div className="flex gap-2 text-[10px]">
                    <span className="px-2 py-1 rounded bg-secondary-container text-secondary-onContainer">Header</span>
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800">Table</span>
                    <span className="px-2 py-1 rounded bg-surface-variant text-outline border border-outline-variant">Text</span>
                </div>
            </div>
            
            {parsedData?.map((block: any, i: number) => {
                let badgeClass = 'bg-surface-variant text-outline border-outline-variant';
                let borderClass = 'border-transparent';
                
                if (block.region === 'Header') {
                    badgeClass = 'bg-secondary-container text-secondary-onContainer';
                    borderClass = 'border-secondary-container';
                } else if (block.region === 'Table') {
                    badgeClass = 'bg-green-100 text-green-800';
                    borderClass = 'border-green-200';
                }

                return (
                    <div key={i} className={`p-4 rounded-xl border bg-[var(--md-sys-color-background)] ${borderClass} shadow-sm`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeClass}`}>
                                {block.region}
                            </span>
                            <span className="text-[10px] text-outline font-mono">Conf: {block.confidence}%</span>
                        </div>
                        <p className={`text-sm text-[var(--md-sys-color-on-background)] whitespace-pre-wrap leading-relaxed ${block.region === 'Header' ? 'font-medium' : ''} ${block.region === 'Table' ? 'font-mono text-xs' : ''}`}>
                            {block.content}
                        </p>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="flex flex-col h-full min-h-[400px]">
            {/* View Toggles */}
            <div className="flex items-center gap-2 mb-4 px-1">
                <button 
                    onClick={() => setViewMode('visual')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border ${viewMode === 'visual' ? 'bg-secondary-container text-secondary-onContainer border-secondary-container' : 'border-outline-variant text-outline hover:bg-surface-variant'}`}
                >
                    <span className="material-symbols-outlined text-sm">wysiwyg</span>
                    {isOCRData ? 'Structure' : 'Table'}
                </button>
                <button 
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border ${viewMode === 'raw' ? 'bg-secondary-container text-secondary-onContainer border-secondary-container' : 'border-outline-variant text-outline hover:bg-surface-variant'}`}
                >
                    <span className="material-symbols-outlined text-sm">code</span>
                    Raw JSON
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[var(--md-sys-color-background)] rounded-xl border border-outline-variant/50 overflow-hidden relative">
                {viewMode === 'raw' ? (
                     <div className="absolute inset-0 overflow-auto custom-scrollbar p-4 bg-surface-variant/30">
                        <pre className="text-xs text-[var(--md-sys-color-on-background)] font-mono whitespace-pre-wrap break-words">
                            {data}
                        </pre>
                    </div>
                ) : isOCRData ? (
                    renderOCRStructure()
                ) : parsedData ? (
                    // TABLE VIEW
                    <div className="absolute inset-0 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-variant sticky top-0 z-10">
                                <tr>
                                    {Object.keys(parsedData[0]).map((key) => (
                                        <th key={key} className="p-3 text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant whitespace-nowrap">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/30">
                                {parsedData.map((row, i) => (
                                    <tr key={i} className="hover:bg-surface-variant/50 transition-colors">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="p-3 text-xs text-[var(--md-sys-color-on-background)] border-r border-outline-variant/10 last:border-0 truncate max-w-[200px]" title={String(val)}>
                                                {String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // PLAIN TEXT FALLBACK
                    <div className="absolute inset-0 overflow-auto custom-scrollbar p-6 bg-surface-variant/10">
                        <div className="max-w-2xl mx-auto space-y-4">
                            {data.split('\n').map((line, i) => {
                                const cleanLine = line.trim();
                                if (!cleanLine) return <br key={i} />;
                                
                                const isBullet = cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.match(/^\d+\./);
                                const isHeader = cleanLine.length < 50 && cleanLine.toUpperCase() === cleanLine && !isBullet;
                                
                                if (isHeader) {
                                    return <h4 key={i} className="font-bold text-sm mt-4 pb-1 border-b border-outline-variant text-primary">{cleanLine}</h4>;
                                }
                                if (isBullet) {
                                    return (
                                        <div key={i} className="flex gap-2 text-xs text-[var(--md-sys-color-on-background)] ml-4">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>{cleanLine.replace(/^[•-]\s*/, '')}</span>
                                        </div>
                                    );
                                }
                                return <p key={i} className="text-xs text-[var(--md-sys-color-on-background)] leading-relaxed">{cleanLine}</p>;
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

  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "System initialized. Analyzing your documents...", time: 'Now' },
  ]);

  useEffect(() => {
      if(uploadedFiles.length > 0) {
          const type = currentFile?.type;
          let msg = `${uploadedFiles.length} file(s) loaded.`;
          
          if (type === 'PNG' || type === 'JPG' || type === 'JPEG') {
              msg = "Image Layout Analysis complete. I've segmented headers, tables, and text regions.";
          } else {
              msg = `Context switched to "${currentFile?.name}". Data parsing successful.`;
          }

          setMessages(prev => [...prev, {
              id: Date.now(),
              sender: 'ai',
              text: msg,
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
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in relative min-h-full p-6">
        
        {/* Header Profile Card */}
        <div className="flex flex-col md:flex-row gap-5 p-6 rounded-[24px] bg-surface-variant border border-outline-variant/30 items-start md:items-center shadow-sm shrink-0">
             <div className="relative shrink-0">
                 <div className="w-14 h-14 rounded-full bg-primary-container text-primary-onContainer flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">folder_open</span>
                 </div>
             </div>
             <div className="flex-1 min-w-0">
                 <h2 className="text-xl font-display font-medium text-[var(--md-sys-color-on-background)] truncate">
                     {uploadedFiles.length > 1 ? "Imported Documents" : (currentFile?.name || "Imported Data")}
                 </h2>
                 <p className="text-outline text-sm mt-0.5">
                    {uploadedFiles.length} File{uploadedFiles.length !== 1 ? 's' : ''} Processed
                 </p>
             </div>
             <div className="flex gap-2">
                <button onClick={onBack} className="h-10 px-4 rounded-full border border-outline text-primary font-medium text-sm hover:bg-white transition-colors">
                    Manage Files
                </button>
             </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Data Review */}
            <div className="flex-1 flex flex-col bg-[var(--md-sys-color-background)] border border-outline-variant/30 rounded-[24px] overflow-hidden shadow-sm">
                {/* Tabs */}
                <div className="flex overflow-x-auto no-scrollbar border-b border-outline-variant/30 bg-surface-variant/30 p-2 gap-2">
                    {uploadedFiles.map((file, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setActiveFileIndex(idx)}
                            className={`px-4 py-2 text-xs font-medium rounded-full flex items-center gap-2 whitespace-nowrap transition-all ${
                                activeFileIndex === idx 
                                ? 'bg-primary text-white shadow-elevation-1' 
                                : 'text-outline hover:bg-surface-variant'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">
                                {['PNG', 'JPG', 'JPEG'].includes(file.type) ? 'image' : 'description'}
                            </span>
                            {file.name}
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 p-4 overflow-hidden">
                    <DataVisualizer data={currentFile?.data || ""} />
                </div>
            </div>

            {/* Right Column: Chat */}
            <div className="w-full lg:w-[360px] flex flex-col bg-surface-variant rounded-[24px] overflow-hidden border border-outline-variant/30 shrink-0 h-[500px] lg:h-auto">
                <div className="p-4 border-b border-outline-variant/30 bg-[var(--md-sys-color-background)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary-onContainer flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">smart_toy</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[var(--md-sys-color-on-background)]">Talent Agent</h4>
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Online
                        </span>
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg) => (
                         <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary-onContainer flex items-center justify-center shrink-0 text-xs font-bold">
                                    AI
                                </div>
                            )}
                            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                msg.sender === 'ai' 
                                ? 'bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] rounded-tl-none shadow-sm' 
                                : 'bg-primary text-white rounded-tr-none shadow-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-[var(--md-sys-color-background)] border-t border-outline-variant/30">
                    <div className="relative">
                        <input 
                            className="w-full bg-surface-variant text-sm px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-10 text-[var(--md-sys-color-on-background)] placeholder-outline" 
                            placeholder="Ask about this document..." 
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors">
                            <span className="material-symbols-outlined text-base block">arrow_upward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-outline-variant/30 flex justify-end shrink-0">
             <button onClick={onComplete} className="h-12 px-8 bg-primary text-white font-medium text-sm rounded-full hover:bg-primary-hover shadow-elevation-1 transition-all flex items-center gap-2 state-layer">
                Confirm & Continue
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
             </button>
        </div>
    </div>
  )
}