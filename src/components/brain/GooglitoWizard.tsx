import React, { useState } from 'react';
import {
    CheckCircle2, FileJson, ChevronRight, ChevronLeft, Briefcase, Star,
    Terminal, Code, Heart, Award, Globe, BookOpen, User, FileText,
    Sparkles, X, Plus, ArrowRight, ShieldAlert,
    Link, Image, Calendar, Trash2, Upload
} from 'lucide-react';
import { Button } from './Button';
import { CompanyLogo } from './CompanyLogo';
import { TechIcon } from './TechIcon';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { GretchenModal } from './GretchenModal';
import { JaniceModal } from './JaniceModal';
import { CVProfile } from '../../types_brain';

interface GooglitoWizardProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    profile: CVProfile;
    setProfile: (p: CVProfile) => void;
    onExportJSON: () => void;
    onFinish: () => void;
}

export const GooglitoWizard: React.FC<GooglitoWizardProps> = ({
    currentStep,
    setCurrentStep,
    profile,
    setProfile,
    onExportJSON,
    onFinish
}) => {
    const [janiceOpen, setJaniceOpen] = useState(false);
    const [janiceData, setJaniceData] = useState<{ text: string, context: string, callback: (t: string) => void } | null>(null);
    const [gretchenOpen, setGretchenOpen] = useState(false);
    const [techInputs, setTechInputs] = useState<Record<string, string>>({ languages: '', frameworks: '', ides: '', tools: '' });

    // Constants extracted
    const techSuggestions: Record<string, string[]> = {
        languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Swift', 'Go', 'Ruby', 'Rust', 'C++', 'HTML', 'CSS', 'SQL'],
        frameworks: ['React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Spring Boot', '.NET', 'Laravel', 'Django', 'Flask', 'Express'],
        ides: ['VS Code', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'Visual Studio', 'Xcode', 'Android Studio', 'Sublime Text', 'Vim'],
        tools: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jira', 'Slack', 'Figma', 'Postman', 'Jenkins']
    };
    const techLabels: Record<string, string> = {
        languages: 'Lenguajes',
        frameworks: 'Frameworks / Librerías',
        ides: 'Entornos (IDEs)',
        tools: 'Herramientas / Cloud'
    };
    const steps = [
        null,
        { id: 'exp', title: 'Experiencia', icon: <Briefcase />, desc: 'Define tu trayectoria profesional.', ai: 'Googlito Experto' },
        { id: 'skills', title: 'Skills Generales', icon: <Star />, desc: 'Tus superpoderes y habilidades blandas.', ai: 'Googlito Talento' },
        { id: 'tech', title: 'Stack Tecnológico', icon: <Terminal />, desc: 'Lenguajes, Frameworks y Herramientas.', ai: 'Googlito Tech' },
        { id: 'projects', title: 'Proyectos', icon: <Code />, desc: 'Lo que has construido.', ai: 'Googlito Maker' },
        { id: 'vol', title: 'Voluntariado', icon: <Heart />, desc: 'Tu impacto social.', ai: 'Googlito Social' },
        { id: 'awards', title: 'Reconocimientos', icon: <Award />, desc: 'Premios y certificaciones.', ai: 'Googlito Fame' },
        { id: 'lang', title: 'Idiomas', icon: <Globe />, desc: '¿Qué lenguas dominas?', ai: 'Googlito Lingua' },
        { id: 'hobbies', title: 'Hobbies', icon: <BookOpen />, desc: '¿Qué te apasiona?', ai: 'Googlito Life' },
        { id: 'summary', title: 'Perfil Profesional', icon: <User />, desc: 'Descripción del Candidato.', ai: 'Googlito Bio' },
        { id: 'review', title: 'Revisión Final', icon: <FileText />, desc: 'Verifica todos los datos.', ai: 'Googlito Auditor' },
    ];

    // Helpers
    const openJanice = (text: string, context: string, callback: (t: string) => void) => {
        setJaniceData({ text, context, callback });
        setJaniceOpen(true);
    };

    const getSectionDataForGretchen = (step: number) => {
        switch (step) {
            case 1: return profile.experience; case 2: return profile.skills; case 3: return profile.techStack; case 4: return profile.projects; case 5: return profile.volunteering;
            case 6: return profile.awards; case 7: return profile.languages; case 8: return profile.hobbies; case 9: return profile.summary; default: return null;
        }
    }

    const handleGretchenFix = (newData: any) => {
        const newProfile = { ...profile };
        switch (currentStep) {
            case 1: newProfile.experience = newData; break; case 2: newProfile.skills = newData; break; case 3: newProfile.techStack = newData; break;
            case 4: newProfile.projects = newData; break; case 5: newProfile.volunteering = newData; break; case 6: newProfile.awards = newData; break;
            case 7: newProfile.languages = newData; break; case 8: newProfile.hobbies = newData; break; case 9: newProfile.summary = newData.summary || newData; break;
        }
        setProfile(newProfile);
    }

    const handleAddTech = (cat: string, value: string) => {
        if (!value.trim()) return;
        const cleanValue = value.trim();
        if ((profile.techStack as any)[cat].includes(cleanValue)) return;
        const newStack = { ...profile.techStack };
        (newStack as any)[cat] = [...(newStack as any)[cat], cleanValue];
        setProfile({ ...profile, techStack: newStack });
        setTechInputs(prev => ({ ...prev, [cat]: '' }));
    };

    const handleRemoveTech = (cat: string, idx: number) => {
        const newStack = { ...profile.techStack };
        (newStack as any)[cat] = (newStack as any)[cat].filter((_: any, i: number) => i !== idx);
        setProfile({ ...profile, techStack: newStack });
    };

    // Render logic
    if (currentStep === 0) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-6 text-white font-serif">
                <div className="max-w-lg w-full bg-slate-800 p-6 md:p-8 border border-slate-700 shadow-2xl relative text-center animate-fade-in-up rounded-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>
                    <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-xl md:text-2xl font-bold mb-2">Análisis Completado</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">"La extracción ha sido satisfactoria. Puede descargar el registro JSON antes de proceder con el equipo de Googlitos."</p>
                    <div className="flex flex-col gap-4">
                        <button onClick={onExportJSON} className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 border border-slate-600 font-sans rounded"><FileJson className="w-5 h-5" />Descargar JSON de Datos</button>
                        <button onClick={() => setCurrentStep(1)} className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white py-3 px-4 transition-colors font-bold font-sans shadow-lg rounded">Proceder a Googlitos<ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        );
    }

    const step = steps[currentStep];
    if (!step) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <JaniceModal isOpen={janiceOpen} onClose={() => setJaniceOpen(false)} initialText={janiceData?.text || ''} context={janiceData?.context || ''} onApply={janiceData?.callback || (() => { })} />
            <GretchenModal isOpen={gretchenOpen} onClose={() => setGretchenOpen(false)} sectionName={step.title} sectionData={getSectionDataForGretchen(currentStep)} onApplyFix={handleGretchenFix} />
            <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center space-x-2"><div className="flex space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div></div><span className="font-bold text-slate-700 ml-2">Googlito System</span></div>
                <div className="flex items-center gap-2"><span className="hidden md:flex text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-100 items-center gap-1"><Sparkles className="w-3 h-3" /> Janice is Online</span><div className="text-xs md:text-sm font-medium text-slate-400">Paso {currentStep} / {steps.length - 1}</div></div>
            </header>
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-10 animate-fade-in pb-20">
                <SectionHeader title={step.title} description={step.desc} icon={step.icon} aiName={step.ai} onGretchenClick={() => setGretchenOpen(true)} />
                <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 space-y-6 md:space-y-8">
                    {currentStep === 1 && (
                        <div className="space-y-6 md:space-y-8">
                            {profile.experience.map((exp, idx) => (
                                <div key={idx} className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200 relative group hover:border-blue-300 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-3">
                                        <div className="flex items-start gap-4 w-full md:mr-4">
                                            <div className="relative group shrink-0">
                                                <CompanyLogo name={exp.company} logoUrl={exp.logo} className="w-12 h-12 bg-white" />
                                                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <label className="cursor-pointer text-white hover:text-blue-300 transition-colors p-1" title="Subir logo">
                                                        <Upload className="w-4 h-4" />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        const newExp = [...profile.experience];
                                                                        newExp[idx].logo = reader.result as string;
                                                                        setProfile({ ...profile, experience: newExp });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    <div className="relative group/url">
                                                        <button className="text-white hover:text-blue-300 transition-colors p-1" title="Enlace URL">
                                                            <Link className="w-4 h-4" />
                                                        </button>
                                                        <div className="absolute left-0 top-full mt-2 w-64 bg-white p-2 rounded shadow-xl border border-slate-100 hidden group-hover/url:block z-50">
                                                            <p className="text-[10px] text-slate-400 mb-1">URL directa del logotipo:</p>
                                                            <input
                                                                className="w-full text-xs border border-slate-200 rounded px-2 py-1 text-slate-700"
                                                                placeholder="https://..."
                                                                value={exp.logo || ''}
                                                                onChange={(e) => {
                                                                    const newExp = [...profile.experience];
                                                                    newExp[idx].logo = e.target.value;
                                                                    setProfile({ ...profile, experience: newExp });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full">
                                                <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-slate-900 p-0" value={exp.role} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].role = e.target.value; setProfile({ ...profile, experience: newExp }); }} placeholder="Cargo / Rol" />
                                                <input className="flex-1 text-sm bg-transparent border-none text-blue-600 font-medium p-0 focus:ring-0" value={exp.company} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].company = e.target.value; setProfile({ ...profile, experience: newExp }); }} placeholder="Empresa" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    className="w-24 text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500 focus:border-blue-300 outline-none"
                                                    value={exp.startDate || ''}
                                                    onChange={(e) => {
                                                        const newExp = [...profile.experience];
                                                        newExp[idx].startDate = e.target.value;
                                                        newExp[idx].period = `${e.target.value} - ${newExp[idx].current ? 'Present' : (newExp[idx].endDate || '')}`;
                                                        setProfile({ ...profile, experience: newExp });
                                                    }}
                                                    placeholder="Inicio (MM/YYYY)"
                                                />
                                                <span className="text-slate-300 text-xs">─</span>
                                                {exp.current ? (
                                                    <div className="w-24 text-center text-[10px] font-bold text-green-600 bg-green-50 py-1.5 rounded border border-green-100 uppercase tracking-tight">Actualidad</div>
                                                ) : (
                                                    <input
                                                        className="w-24 text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500 focus:border-blue-300 outline-none"
                                                        value={exp.endDate || ''}
                                                        onChange={(e) => {
                                                            const newExp = [...profile.experience];
                                                            newExp[idx].endDate = e.target.value;
                                                            newExp[idx].period = `${newExp[idx].startDate || ''} - ${e.target.value}`;
                                                            setProfile({ ...profile, experience: newExp });
                                                        }}
                                                        placeholder="Fin (MM/YYYY)"
                                                    />
                                                )}
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    checked={exp.current || false}
                                                    onChange={(e) => {
                                                        const newExp = [...profile.experience];
                                                        newExp[idx].current = e.target.checked;
                                                        newExp[idx].period = `${newExp[idx].startDate || ''} - ${e.target.checked ? 'Present' : (newExp[idx].endDate || '')}`;
                                                        setProfile({ ...profile, experience: newExp });
                                                    }}
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actualmente aquí</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <textarea className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-3 h-28 outline-none resize-none" value={exp.description} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].description = e.target.value; setProfile({ ...profile, experience: newExp }); }} placeholder="Logros y responsabilidades..." />
                                        <button onClick={() => openJanice(exp.description, `Experiencia como ${exp.role}`, (txt) => { const newExp = [...profile.experience]; newExp[idx].description = txt; setProfile({ ...profile, experience: newExp }); })} className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3" /> Janice</button>
                                    </div>
                                    <button onClick={() => setProfile({ ...profile, experience: profile.experience.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {profile.experience.length === 0 && <EmptyState text="No se detectó experiencia." />}
                            <Button variant="outline" onClick={() => setProfile({ ...profile, experience: [...profile.experience, { company: '', role: 'Nuevo Rol', period: '', description: '' }] })}>+ Añadir Experiencia</Button>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-800 mb-2">💡 Tip: Mezcla habilidades técnicas y blandas.</p>
                                <div className="flex flex-wrap gap-3">
                                    {profile.skills.map((skill, idx) => (
                                        <div key={idx} className="flex items-center bg-white text-slate-700 pl-3 pr-2 py-1.5 rounded-full text-sm border border-slate-200">
                                            <input className="bg-transparent border-none focus:ring-0 text-slate-700 min-w-[60px] p-0 text-sm" value={skill} onChange={(e) => { const newS = [...profile.skills]; newS[idx] = e.target.value; setProfile({ ...profile, skills: newS }); }} />
                                            <button onClick={() => setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== idx) })} className="ml-2 text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setProfile({ ...profile, skills: [...profile.skills, "Nueva habilidad"] })} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm hover:bg-blue-200">+ Añadir</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['languages', 'frameworks', 'ides', 'tools'].map((cat) => (
                                <div key={cat} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{techLabels[cat]}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{(profile.techStack as any)[cat].length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                                        {(profile.techStack as any)[cat]?.map((item: string, idx: number) => (
                                            <span key={idx} className="group bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-blue-100 flex items-center gap-2 hover:bg-blue-100 transition-colors shadow-sm">
                                                <TechIcon name={item} className="w-3.5 h-3.5" />
                                                {item}
                                                <button onClick={() => handleRemoveTech(cat, idx)} className="text-blue-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                            </span>
                                        ))}
                                        {((profile.techStack as any)[cat] || []).length === 0 && (
                                            <span className="text-xs text-slate-400 italic">Sin elementos aún</span>
                                        )}
                                    </div>
                                    <div className="border-t border-slate-100 pt-4 mb-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sugerencias rápidas:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {techSuggestions[cat].filter(s => !((profile.techStack as any)[cat] || []).includes(s)).map(sugg => (
                                                <button
                                                    key={sugg}
                                                    onClick={() => handleAddTech(cat, sugg)}
                                                    className="text-[10px] px-2 py-1 bg-slate-50 text-slate-500 rounded border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-1"
                                                >
                                                    <Plus className="w-2.5 h-2.5" />
                                                    {sugg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-auto relative">
                                        <input
                                            type="text"
                                            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                            placeholder="Escribe y presiona Enter..."
                                            value={techInputs[cat]}
                                            onChange={(e) => setTechInputs({ ...techInputs, [cat]: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddTech(cat, techInputs[cat])}
                                        />
                                        <button
                                            onClick={() => handleAddTech(cat, techInputs[cat])}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            {profile.projects.map((proj, idx) => (
                                <div key={idx} className="p-4 md:p-6 bg-indigo-50/30 rounded-xl border border-indigo-100 relative shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-indigo-900 pr-8 p-0" value={proj.name} onChange={(e) => { const newP = [...profile.projects]; newP[idx].name = e.target.value; setProfile({ ...profile, projects: newP }); }} placeholder="Nombre del Proyecto" />
                                        <button onClick={() => setProfile({ ...profile, projects: profile.projects.filter((_, i) => i !== idx) })} className="text-indigo-200 hover:text-red-500 p-1"><X className="w-5 h-5" /></button>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-300" />
                                            <input className="w-24 text-xs bg-white border border-indigo-100 rounded px-2 py-1 text-slate-500 focus:border-indigo-300 outline-none" placeholder="Inicio" value={proj.startDate || ''} onChange={(e) => { const newP = [...profile.projects]; newP[idx].startDate = e.target.value; setProfile({ ...profile, projects: newP }); }} />
                                            <span className="text-indigo-200">-</span>
                                            <input className="w-24 text-xs bg-white border border-indigo-100 rounded px-2 py-1 text-slate-500 focus:border-indigo-300 outline-none" placeholder="Fin" value={proj.endDate || ''} onChange={(e) => { const newP = [...profile.projects]; newP[idx].endDate = e.target.value; setProfile({ ...profile, projects: newP }); }} />
                                        </div>
                                        <div className="flex items-center gap-2 flex-1">
                                            <Link className="w-4 h-4 text-indigo-300" />
                                            <input className="flex-1 text-xs bg-white border border-indigo-100 rounded px-2 py-1 text-blue-500 focus:border-indigo-300 outline-none" placeholder="https://..." value={proj.link || ''} onChange={(e) => { const newP = [...profile.projects]; newP[idx].link = e.target.value; setProfile({ ...profile, projects: newP }); }} />
                                        </div>
                                    </div>

                                    <div className="relative mb-3">
                                        <textarea className="w-full text-sm text-slate-600 bg-white border border-indigo-100 rounded-lg p-3 h-24 outline-none resize-none focus:ring-2 focus:ring-indigo-50 transition-all" value={proj.description} onChange={(e) => { const newP = [...profile.projects]; newP[idx].description = e.target.value; setProfile({ ...profile, projects: newP }); }} placeholder="¿Qué construiste y cómo?" />
                                        <button onClick={() => openJanice(proj.description, `Proyecto: ${proj.name}`, (txt) => { const newP = [...profile.projects]; newP[idx].description = txt; setProfile({ ...profile, projects: newP }); })} className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-purple-200 transition-colors"><Sparkles className="w-3 h-3" /> Janice</button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <TechIcon name="code" className="w-4 h-4 text-indigo-300" />
                                            <input className="w-full text-xs text-indigo-600 bg-white/50 border border-indigo-100 rounded px-2 py-1 focus:bg-white transition-colors" value={proj.technologies} onChange={(e) => { const newP = [...profile.projects]; newP[idx].technologies = e.target.value; setProfile({ ...profile, projects: newP }); }} placeholder="Tecnologías usadas (React, Node, AWS...)" />
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Image className="w-4 h-4 text-indigo-300 mt-1" />
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {(proj.images || []).map((img, imgIdx) => (
                                                        <div key={imgIdx} className="relative group w-16 h-12 bg-indigo-50 rounded border border-indigo-100 overflow-hidden">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                            <button onClick={() => { const newP = [...profile.projects]; newP[idx].images = (newP[idx].images || []).filter((_, i) => i !== imgIdx); setProfile({ ...profile, projects: newP }); }} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => { const url = prompt("URL de la imagen:"); if (url) { const newP = [...profile.projects]; newP[idx].images = [...(newP[idx].images || []), url]; setProfile({ ...profile, projects: newP }); } }}
                                                        className="w-16 h-12 bg-white border border-dashed border-indigo-200 rounded flex items-center justify-center text-indigo-300 hover:text-indigo-500 hover:border-indigo-400 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => setProfile({ ...profile, projects: [...profile.projects, { name: 'Nuevo Proyecto', description: '', technologies: '' }] })}>+ Añadir Proyecto</Button>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6">
                            {profile.volunteering.map((vol, idx) => (
                                <div key={idx} className="p-4 md:p-6 bg-teal-50/30 rounded-xl border border-teal-100 relative shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-teal-900 pr-8 p-0" value={vol.role} onChange={(e) => { const newV = [...profile.volunteering]; newV[idx].role = e.target.value; setProfile({ ...profile, volunteering: newV }); }} placeholder="Título del Voluntariado" />
                                        <button onClick={() => setProfile({ ...profile, volunteering: profile.volunteering.filter((_, i) => i !== idx) })} className="text-teal-200 hover:text-red-500 p-1"><X className="w-5 h-5" /></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <input className="text-sm bg-white border border-teal-100 rounded px-3 py-2 text-slate-600 focus:border-teal-300 outline-none" value={vol.company} onChange={(e) => { const newV = [...profile.volunteering]; newV[idx].company = e.target.value; setProfile({ ...profile, volunteering: newV }); }} placeholder="Organización" />
                                        <input className="text-sm bg-white border border-teal-100 rounded px-3 py-2 text-slate-600 focus:border-teal-300 outline-none" value={vol.period} onChange={(e) => { const newV = [...profile.volunteering]; newV[idx].period = e.target.value; setProfile({ ...profile, volunteering: newV }); }} placeholder="Periodo" />
                                    </div>
                                    <textarea className="w-full text-sm text-slate-600 bg-white border border-teal-100 rounded-lg p-3 h-24 outline-none resize-none focus:ring-2 focus:ring-teal-50 transition-all" value={vol.description} onChange={(e) => { const newV = [...profile.volunteering]; newV[idx].description = e.target.value; setProfile({ ...profile, volunteering: newV }); }} placeholder="Descripción..." />
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => setProfile({ ...profile, volunteering: [...profile.volunteering, { company: '', role: 'Nuevo Voluntariado', period: '', description: '' }] })}>+ Añadir Voluntariado</Button>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-6">
                            {profile.awards.map((award, idx) => (
                                <div key={idx} className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-100 flex items-center gap-3 relative group">
                                    <Award className="w-5 h-5 text-yellow-500 shrink-0" />
                                    <input className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 font-medium p-0" value={award} onChange={(e) => { const newA = [...profile.awards]; newA[idx] = e.target.value; setProfile({ ...profile, awards: newA }); }} placeholder="Premio o reconocimiento..." />
                                    <button onClick={() => setProfile({ ...profile, awards: profile.awards.filter((_, i) => i !== idx) })} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => setProfile({ ...profile, awards: [...profile.awards, ""] })}>+ Añadir Reconocimiento</Button>
                        </div>
                    )}

                    {currentStep === 7 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.languages.map((lang, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-lg border border-slate-200 flex flex-col gap-2 relative group shadow-sm">
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-400" />
                                                <input className="font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 text-sm w-32" value={lang.language} onChange={(e) => { const newL = [...profile.languages]; newL[idx].language = e.target.value; setProfile({ ...profile, languages: newL }); }} placeholder="Idioma" />
                                            </div>
                                            <button onClick={() => setProfile({ ...profile, languages: profile.languages.filter((_, i) => i !== idx) })} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                        </div>
                                        <input className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-2 py-1 w-full" value={lang.level} onChange={(e) => { const newL = [...profile.languages]; newL[idx].level = e.target.value; setProfile({ ...profile, languages: newL }); }} placeholder="Nivel (Ej: Nativo, B2...)" />
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" onClick={() => setProfile({ ...profile, languages: [...profile.languages, { language: '', level: '' }] })}>+ Añadir Idioma</Button>
                        </div>
                    )}

                    {currentStep === 8 && (
                        <div className="space-y-6">
                            <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100 mb-4">
                                <p className="text-sm text-pink-800">🎯 Intenta incluir pasatiempos que demuestren habilidades transferibles (ej: Ajedrez - Estrategia).</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {profile.hobbies.map((hobby, idx) => (
                                    <div key={idx} className="flex items-center bg-white text-slate-700 pl-3 pr-2 py-2 rounded-lg text-sm border border-slate-200 shadow-sm relative group">
                                        <Heart className="w-3.5 h-3.5 text-pink-400 mr-2" />
                                        <input className="bg-transparent border-none focus:ring-0 text-slate-700 min-w-[100px] p-0 text-sm" value={hobby} onChange={(e) => { const newH = [...profile.hobbies]; newH[idx] = e.target.value; setProfile({ ...profile, hobbies: newH }); }} />
                                        <button onClick={() => setProfile({ ...profile, hobbies: profile.hobbies.filter((_, i) => i !== idx) })} className="ml-2 text-slate-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                ))}
                                <button onClick={() => setProfile({ ...profile, hobbies: [...profile.hobbies, "Nuevo Hobby"] })} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 border border-transparent hover:border-slate-300 flex items-center gap-2 transition-all"><Plus className="w-4 h-4" /> Añadir</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 9 && (
                        <div className="space-y-6">
                            <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 relative">
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Resumen Ejecutivo</h3>
                                <textarea className="w-full text-base text-slate-700 bg-white border border-slate-200 rounded-lg p-4 h-64 outline-none resize-none" value={profile.summary} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} placeholder="Resumen..." />
                                <button onClick={() => openJanice(profile.summary, `Resumen Profesional`, (txt) => setProfile({ ...profile, summary: txt }))} className="absolute bottom-4 right-4 text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded-md flex items-center gap-2"><Sparkles className="w-4 h-4" /> Janice: Mejorar Redacción</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 10 && (
                        <div className="space-y-6">
                            <div className="bg-slate-800 text-white p-4 rounded-lg flex items-center gap-3">
                                <ShieldAlert className="w-6 h-6 text-yellow-400" /><div className="text-sm"><p className="font-bold">Revisión Final</p><p className="opacity-80">Puedes editar directamente en la vista previa.</p></div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-6 space-y-8 max-h-[600px] overflow-y-auto text-sm">
                                    <section>
                                        <h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Resumen</h4>
                                        <textarea
                                            className="w-full min-h-[100px] text-slate-600 leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none"
                                            value={profile.summary}
                                            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                                        />
                                    </section>

                                    <section>
                                        <h4 className="font-bold text-blue-600 mb-4 border-b border-blue-100 pb-1">Experiencia</h4>
                                        {profile.experience.map((e, i) => (
                                            <div key={i} className="mb-6 pl-4 border-l-2 border-slate-100 relative group">
                                                <div className="flex gap-2 mb-1">
                                                    <input className="font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-full" value={e.role} onChange={(evt) => { const n = [...profile.experience]; n[i].role = evt.target.value; setProfile({ ...profile, experience: n }) }} />
                                                    <span className="text-slate-400">@</span>
                                                    <input className="font-medium text-blue-600 bg-transparent border-none p-0 focus:ring-0 w-full" value={e.company} onChange={(evt) => { const n = [...profile.experience]; n[i].company = evt.target.value; setProfile({ ...profile, experience: n }) }} />
                                                </div>
                                                <input className="text-xs text-slate-400 mb-2 bg-transparent border-none p-0 focus:ring-0 w-full block" value={e.period} onChange={(evt) => { const n = [...profile.experience]; n[i].period = evt.target.value; setProfile({ ...profile, experience: n }) }} />
                                                <textarea className="w-full text-slate-600 bg-transparent border-none p-0 focus:ring-0 resize-none min-h-[60px]" value={e.description} onChange={(evt) => { const n = [...profile.experience]; n[i].description = evt.target.value; setProfile({ ...profile, experience: n }) }} />
                                            </div>
                                        ))}
                                    </section>

                                    <section>
                                        <h4 className="font-bold text-blue-600 mb-4 border-b border-blue-100 pb-1">Skills & Stack</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((s, i) => (
                                                <input key={`sk-${i}`} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs border-none focus:ring-0 w-auto" style={{ width: `${s.length + 2}ch` }} value={s} onChange={(e) => { const n = [...profile.skills]; n[i] = e.target.value; setProfile({ ...profile, skills: n }) }} />
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20 shadow-sm">
                <div className="max-w-4xl mx-auto flex justify-between items-center w-full">
                    <Button variant="ghost" onClick={() => { if (currentStep > 0) setCurrentStep(currentStep - 1); }} disabled={currentStep === 0}><ChevronLeft className="w-4 h-4 mr-1" /> Anterior</Button>
                    <Button onClick={currentStep === 10 ? onFinish : () => setCurrentStep(currentStep + 1)} className="bg-slate-800 hover:bg-slate-900 text-white px-6 md:px-8">{currentStep === 10 ? <>Finalizar <ArrowRight className="w-4 h-4 ml-2" /></> : <>Siguiente <ChevronRight className="w-4 h-4 ml-2" /></>}</Button>
                </div>
            </footer>
        </div>
    );
};
