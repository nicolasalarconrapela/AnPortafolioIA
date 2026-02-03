
import React, { useState, useRef } from 'react';
import { FileText, Globe, Search, ExternalLink, X, Maximize2 } from 'lucide-react';
import { createGeminiService } from '../../services/geminiService';
import { MarkdownView } from './MarkdownView';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    fileDataUrl: string | null;
}

export const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, fileDataUrl }) => {
    const [activeTab, setActiveTab] = useState<'pdf' | 'browser'>('pdf');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<{ text: string; sources: any[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    
    const serviceRef = useRef(createGeminiService());

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            const result = await serviceRef.current.searchWeb(searchQuery);
            setSearchResult(result);
        } catch (e) {
            setSearchResult({ text: "Error en la búsqueda.", sources: [] });
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-[400px] xl:w-[450px] border-l border-outline-variant/30 bg-white flex flex-col shadow-xl z-20 transition-all duration-300 h-[calc(100vh-65px)] sticky top-[65px]">
            {/* Tabs */}
            <div className="flex border-b border-outline-variant/30">
                <button 
                    onClick={() => setActiveTab('pdf')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'pdf' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-outline hover:text-primary hover:bg-surface-variant'}`}
                >
                    <FileText size={16} /> Documento
                </button>
                <button 
                    onClick={() => setActiveTab('browser')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'browser' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-outline hover:text-primary hover:bg-surface-variant'}`}
                >
                    <Globe size={16} /> Navegador IA
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-slate-50">
                {activeTab === 'pdf' ? (
                    fileDataUrl ? (
                        <iframe 
                            src={fileDataUrl} 
                            className="w-full h-full border-none"
                            title="Document Viewer"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-outline p-6 text-center">
                            <FileText size={48} className="mb-4 opacity-20" />
                            <p>No hay documento original disponible.</p>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="p-4 bg-white border-b border-outline-variant/30 flex gap-2">
                            <div className="relative flex-1">
                                <input 
                                    className="w-full bg-surface-variant/30 border border-outline-variant rounded-full py-2 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Ej: Stack tech de Netflix..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSearching || !searchQuery}
                                className="bg-primary text-white p-2 rounded-full hover:bg-primary-hover disabled:opacity-50 transition-colors"
                            >
                                {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search size={16} />}
                            </button>
                        </form>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isSearching ? (
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
                                </div>
                            ) : searchResult ? (
                                <div className="animate-fade-in">
                                    <div className="prose prose-sm prose-slate mb-6">
                                        <MarkdownView content={searchResult.text} />
                                    </div>
                                    
                                    {searchResult.sources && searchResult.sources.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-outline-variant/30">
                                            <h4 className="text-xs font-bold text-outline uppercase mb-3">Fuentes</h4>
                                            <ul className="space-y-2">
                                                {searchResult.sources.map((source, i) => (
                                                    <li key={i}>
                                                        <a 
                                                            href={source.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-xs text-primary hover:underline bg-white p-2 rounded-lg border border-slate-100 shadow-sm"
                                                        >
                                                            <ExternalLink size={12} />
                                                            <span className="truncate">{source.title || source.url}</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-outline/60">
                                    <Globe size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm">Busca información en la web para enriquecer el perfil.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
