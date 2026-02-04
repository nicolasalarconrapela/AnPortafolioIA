
import React, { useState, useRef, useEffect } from 'react';
import {
    CheckCircle2, FileJson, ChevronRight, ChevronLeft, Briefcase, Star,
    Terminal, Code, Heart, Award, Globe, BookOpen, User, FileText,
    Sparkles, X, Plus, ArrowRight, ShieldAlert,
    Link, Image, Calendar, Trash2, Upload, LayoutGrid, Wand2, Share2, Sidebar
} from 'lucide-react';
import { Button } from './Button';
import { CompanyLogo } from './CompanyLogo';
import { TechIcon } from './TechIcon';
import { SocialIcon } from './SocialIcon';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { GretchenModal } from './GretchenModal';
import { JaniceModal } from './JaniceModal';
import { SidePanel } from './SidePanel';
import { CVProfile } from '../../types_brain';
import { compressImage } from '../../utils/imageUtils';

interface GooglitoWizardProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    profile: CVProfile;
    setProfile: (p: CVProfile) => void;
    onExportJSON: () => void;
    onReset?: () => void;
    onFinish: () => void;
    fileDataUrl?: string | null;
}

export const GooglitoWizard: React.FC<GooglitoWizardProps> = ({
    currentStep,
    setCurrentStep,
    profile,
    setProfile,
    onExportJSON,
    onReset,
    onFinish,
    fileDataUrl = null
}) => {
    const [janiceOpen, setJaniceOpen] = useState(false);
    const [janiceData, setJaniceData] = useState<{ text: string, context: string, callback: (t: string) => void } | null>(null);
    const [gretchenOpen, setGretchenOpen] = useState(false);
    const [techInputs, setTechInputs] = useState<Record<string, string>>({ languages: '', frameworks: '', ides: '', tools: '' });

    // Side Panel State
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    // Scroll handling for nav
    const navRef = useRef<HTMLDivElement>(null);

    // Scroll active step into view
    useEffect(() => {
        if (navRef.current) {
            const activeBtn = navRef.current.children[currentStep] as HTMLElement;
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentStep]);

    const professionalNetworks = [
        "LinkedIn", "GitHub", "Behance", "Dribbble", "Xing", "ResearchGate",
        "Academia.edu", "Stack Overflow", "Contra", "Polywork", "Product Hunt",
        "Indie Hackers", "Lunchclub", "Crunchbase", "Substack", "Slack",
        "Discord", "Meetup", "Malt", "The Dots"
    ];

    const techSuggestions: Record<string, string[]> = {
        languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Swift', 'Go', 'Ruby', 'Rust', 'C++', 'HTML', 'CSS', 'SQL', 'Kotlin', 'R'],
        frameworks: ['React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Spring Boot', '.NET', 'Laravel', 'Django', 'Flask', 'Express', 'Tailwind', 'Bootstrap', 'TensorFlow', 'PyTorch'],
        ides: ['VS Code', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'Visual Studio', 'Xcode', 'Android Studio', 'Sublime Text', 'Vim', 'Eclipse'],
        tools: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jira', 'Slack', 'Figma', 'Postman', 'Jenkins', 'Terraform', 'Ansible', 'Notion', 'Trello']
    };

    // Auto-detection master list (Tech + Common Soft Skills/Business)
    const AUTO_DETECT_KEYWORDS = [
        ...Object.values(techSuggestions).flat(),
        'Agile', 'Scrum', 'Kanban', 'Liderazgo', 'Management', 'Gestión de Proyectos',
        'Comunicación', 'Inglés', 'Marketing', 'Ventas', 'SaaS', 'B2B', 'B2C',
        'SEO', 'SEM', 'Analytics', 'Data Science', 'Machine Learning', 'AI',
        'Consultoría', 'Finanzas', 'Contabilidad', 'Recursos Humanos', 'Mentoring',
        'Testing', 'QA', 'CI/CD', 'DevOps', 'Microservicios', 'API', 'REST', 'GraphQL'
    ];

    const techLabels: Record<string, string> = {
        languages: 'Lenguajes',
        frameworks: 'Frameworks / Librerías',
        ides: 'Entornos (IDEs)',
        tools: 'Herramientas / Cloud'
    };

    const steps = [
        null,
        { id: 'exp', title: 'Experiencia', icon: <Briefcase size={18} />, desc: 'Define tu trayectoria profesional.', ai: 'Googlito Experto' },
        { id: 'skills', title: 'Skills', icon: <Star size={18} />, desc: 'Tus superpoderes y habilidades blandas.', ai: 'Googlito Talento' },
        { id: 'tech', title: 'Stack Tech', icon: <Terminal size={18} />, desc: 'Lenguajes, Frameworks y Herramientas.', ai: 'Googlito Tech' },
        { id: 'projects', title: 'Proyectos', icon: <Code size={18} />, desc: 'Lo que has construido.', ai: 'Googlito Maker' },
        { id: 'vol', title: 'Voluntariado', icon: <Heart size={18} />, desc: 'Tu impacto social.', ai: 'Googlito Social' },
        { id: 'awards', title: 'Logros', icon: <Award size={18} />, desc: 'Premios y certificaciones.', ai: 'Googlito Fame' },
        { id: 'lang', title: 'Idiomas', icon: <Globe size={18} />, desc: '¿Qué lenguas dominas?', ai: 'Googlito Lingua' },
        { id: 'hobbies', title: 'Hobbies', icon: <BookOpen size={18} />, desc: '¿Qué te apasiona?', ai: 'Googlito Life' },
        { id: 'social', title: 'Redes', icon: <Share2 size={18} />, desc: 'Conecta tus perfiles profesionales.', ai: 'Googlito Network' },
        { id: 'summary', title: 'Perfil', icon: <User size={18} />, desc: 'Descripción del Candidato.', ai: 'Googlito Bio' },
        { id: 'review', title: 'Revisión', icon: <FileText size={18} />, desc: 'Verifica todos los datos.', ai: 'Googlito Auditor' },
    ];

    const openJanice = (text: string, context: string, callback: (t: string) => void) => {
        setJaniceData({ text, context, callback });
        setJaniceOpen(true);
    };

    const getSectionDataForGretchen = (step: number) => {
        switch (step) {
            case 1: return profile.experience; case 2: return profile.skills; case 3: return profile.techStack; case 4: return profile.projects; case 5: return profile.volunteering;
            case 6: return profile.awards; case 7: return profile.languages; case 8: return profile.hobbies; case 9: return profile.socials; case 10: return profile.summary; default: return null;
        }
    }

    const handleGretchenFix = (newData: any) => {
        const newProfile = { ...profile };
        switch (currentStep) {
            case 1: newProfile.experience = newData; break; case 2: newProfile.skills = newData; break; case 3: newProfile.techStack = newData; break;
            case 4: newProfile.projects = newData; break; case 5: newProfile.volunteering = newData; break; case 6: newProfile.awards = newData; break;
            case 7: newProfile.languages = newData; break; case 8: newProfile.hobbies = newData; break; case 9: newProfile.socials = newData; break; case 10: newProfile.summary = newData.summary || newData; break;
        }
        setProfile(newProfile);
    }

    const handleAutoDetectSkills = (index: number, text: string) => {
        if (!text) return;
        const currentSkills = new Set((profile.experience[index].skills || []).map(s => s.toLowerCase()));
        const newSkills = [...(profile.experience[index].skills || [])];
        let changed = false;

        AUTO_DETECT_KEYWORDS.forEach(keyword => {
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escapedKeyword}(?![a-zA-Z0-9_])`, 'i');

            if (regex.test(text) && !currentSkills.has(keyword.toLowerCase())) {
                newSkills.push(keyword);
                currentSkills.add(keyword.toLowerCase());
                changed = true;
            }
        });

        if (changed) {
            const newExp = [...profile.experience];
            newExp[index].skills = newSkills;
            setProfile({ ...profile, experience: newExp });
        }
    };

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

    // --- RENDER SUCCESS ---
    if (currentStep === 0) {
        return (
            <div className="min-h-screen bg-[var(--md-sys-color-background)] flex flex-col items-center justify-center p-6 text-[var(--md-sys-color-on-background)]">
                <div className="max-w-lg w-full bg-surface-variant/30 p-8 md:p-12 rounded-[32px] border border-outline-variant shadow-elevation-1 text-center animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-700 mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-display font-medium mb-3">Extracción Exitosa</h2>
                    <p className="text-outline mb-10 leading-relaxed">
                        Señorita Rotenmeir ha estructurado tus datos. Ahora, el equipo de Googlitos te ayudará a pulir cada sección.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => setCurrentStep(1)} variant="primary" className="w-full h-12 text-base">
                            Proceder a Edición <ChevronRight className="w-5 h-5 ml-1" />
                        </Button>
                        <Button onClick={onExportJSON} variant="ghost" className="w-full h-12 text-sm text-outline hover:text-primary">
                            <FileJson className="w-4 h-4 mr-2" /> Descargar Raw JSON
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const step = steps[currentStep];
    if (!step) return null;

    // --- RENDER WIZARD SPLIT LAYOUT ---
    return (
        <div className="min-h-screen bg-[var(--md-sys-color-background)] flex flex-col text-[var(--md-sys-color-on-background)] overflow-hidden">
            <JaniceModal isOpen={janiceOpen} onClose={() => setJaniceOpen(false)} initialText={janiceData?.text || ''} context={janiceData?.context || ''} onApply={janiceData?.callback || (() => { })} />
            <GretchenModal isOpen={gretchenOpen} onClose={() => setGretchenOpen(false)} sectionName={step.title} sectionData={getSectionDataForGretchen(currentStep)} onApplyFix={handleGretchenFix} />

            {/* Top Bar Navigation */}
            <header className="bg-[var(--md-sys-color-background)] border-b border-outline-variant/30 sticky top-0 z-30 backdrop-blur-md bg-opacity-90 flex-none h-[65px]">
                <div className="px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-primary-onContainer">
                            <LayoutGrid size={20} />
                        </div>
                        <span className="font-display font-medium text-lg hidden md:block">Googlito System</span>
                        {onReset && (
                            <button
                                onClick={() => { if (confirm("¿Quieres volver a cargar un CV? Se perderán los cambios no guardados.")) onReset(); }}
                                className="ml-2 text-xs bg-outline-variant/30 hover:bg-outline-variant/50 text-outline px-2 py-1 rounded flex items-center gap-1 transition-colors"
                                title="Volver a Cargar CV (Señorita Rotenmeir)"
                            >
                                <Upload size={12} />
                                <span className="hidden sm:inline">Nueva Carga</span>
                            </button>
                        )}
                    </div>

                    {/* Horizontal Scrollable Tabs (Center) */}
                    <div ref={navRef} className="flex-1 flex overflow-x-auto no-scrollbar px-4 h-full items-end gap-1 md:gap-2">
                        {steps.slice(1).map((s, idx) => {
                            const stepIndex = idx + 1;
                            const isActive = stepIndex === currentStep;
                            const isPast = stepIndex < currentStep;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setCurrentStep(stepIndex)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 border-b-2 transition-all whitespace-nowrap text-sm font-medium mb-[-1px]
                                        ${isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-outline hover:text-[var(--md-sys-color-on-background)] hover:bg-surface-variant/30 rounded-t-lg'
                                        }
                                    `}
                                >
                                    <span className={isActive ? 'text-primary' : isPast ? 'text-green-600' : 'text-outline opacity-70'}>
                                        {isPast ? <CheckCircle2 size={16} /> : s.icon}
                                    </span>
                                    <span className="hidden sm:inline">{s.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPanelOpen(!isPanelOpen)}
                            className={`p-2 rounded-full transition-colors ${isPanelOpen ? 'bg-primary text-white' : 'text-outline hover:bg-surface-variant'}`}
                            title="Toggle Context Panel"
                        >
                            <Sidebar size={20} />
                        </button>
                        <div className="h-6 w-px bg-outline-variant/50 mx-1 hidden md:block"></div>
                        <span className="hidden md:flex text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Janice Online
                        </span>
                    </div>
                </div>
            </header>

            {/* Split Content Body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Main Wizard Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in pb-24 relative">
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader
                            title={step.title}
                            description={step.desc}
                            icon={step.icon}
                            aiName={step.ai}
                            onGretchenClick={() => setGretchenOpen(true)}
                        />

                        <div className="space-y-6">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    {profile.experience.map((exp, idx) => (
                                        <div key={idx} className="bg-surface-variant/20 rounded-[24px] p-6 border border-outline-variant/40 hover:border-outline-variant transition-colors group relative">
                                            {/* Header Inputs */}
                                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                                <div className="shrink-0 pt-1">
                                                    <div className="relative group/logo w-14 h-14 bg-surface rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-outline-variant/30">
                                                        <CompanyLogo name={exp.company} logoUrl={exp.logo} className="w-10 h-10 object-contain" />
                                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer text-white">
                                                            <Upload size={16} />
                                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const compressed = await compressImage(file, 200, 200, 0.8);
                                                                    const newExp = [...profile.experience];
                                                                    newExp[idx].logo = compressed;
                                                                    setProfile({ ...profile, experience: newExp });
                                                                }
                                                            }} />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="relative">
                                                        <input
                                                            className="w-full bg-surface border-b-2 border-outline-variant focus:border-primary px-3 py-2 text-lg font-bold text-[var(--md-sys-color-on-background)] placeholder-outline/50 outline-none transition-colors rounded-t-lg"
                                                            value={exp.role}
                                                            onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].role = e.target.value; setProfile({ ...profile, experience: newExp }); }}
                                                            onBlur={(e) => handleAutoDetectSkills(idx, e.target.value)}
                                                            placeholder="Cargo / Rol"
                                                        />
                                                        <div className="absolute right-2 top-3 text-purple-400 opacity-50" title="Googlito Auto-Tagging activo">
                                                            <Wand2 size={14} />
                                                        </div>
                                                    </div>
                                                    <input
                                                        className="w-full bg-surface border-b-2 border-outline-variant focus:border-primary px-3 py-2 text-base text-primary font-medium placeholder-outline/50 outline-none transition-colors rounded-t-lg"
                                                        value={exp.company}
                                                        onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].company = e.target.value; setProfile({ ...profile, experience: newExp }); }}
                                                        placeholder="Empresa"
                                                    />
                                                </div>
                                            </div>

                                            {/* Dates */}
                                            <div className="flex flex-wrap items-center gap-3 mb-4 pl-0 md:pl-[4.5rem]">
                                                <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/30">
                                                    <Calendar size={14} className="text-outline" />
                                                    <input className="w-20 text-sm bg-transparent outline-none text-center" value={exp.startDate || ''} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].startDate = e.target.value; newExp[idx].period = `${e.target.value} - ${newExp[idx].current ? 'Present' : (newExp[idx].endDate || '')}`; setProfile({ ...profile, experience: newExp }); }} placeholder="Inicio" />
                                                    <span className="text-outline">-</span>
                                                    {exp.current ? (
                                                        <span className="text-sm font-bold text-green-600 px-2">Presente</span>
                                                    ) : (
                                                        <input className="w-20 text-sm bg-transparent outline-none text-center" value={exp.endDate || ''} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].endDate = e.target.value; newExp[idx].period = `${newExp[idx].startDate || ''} - ${e.target.value}`; setProfile({ ...profile, experience: newExp }); }} placeholder="Fin" />
                                                    )}
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-outline hover:text-primary transition-colors">
                                                    <input type="checkbox" className="accent-primary w-4 h-4 rounded" checked={exp.current || false} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].current = e.target.checked; newExp[idx].period = `${newExp[idx].startDate || ''} - ${e.target.checked ? 'Present' : (newExp[idx].endDate || '')}`; setProfile({ ...profile, experience: newExp }); }} />
                                                    Trabajo actual
                                                </label>
                                            </div>

                                            {/* Description */}
                                            <div className="relative pl-0 md:pl-[4.5rem]">
                                                <textarea
                                                    className="w-full bg-surface border border-outline-variant rounded-xl p-4 text-sm leading-relaxed text-[var(--md-sys-color-on-background)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all h-32"
                                                    value={exp.description}
                                                    onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].description = e.target.value; setProfile({ ...profile, experience: newExp }); }}
                                                    onBlur={(e) => handleAutoDetectSkills(idx, e.target.value)}
                                                    placeholder="Describe tus logros y responsabilidades..."
                                                />
                                                <button
                                                    onClick={() => openJanice(exp.description, `Experiencia: ${exp.role}`, (txt) => { const newExp = [...profile.experience]; newExp[idx].description = txt; setProfile({ ...profile, experience: newExp }); })}
                                                    className="absolute bottom-3 right-3 text-xs bg-terti-container text-tertiary-onContainer px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:opacity-90 transition-opacity font-medium shadow-sm"
                                                >
                                                    <Sparkles size={12} /> Janice
                                                </button>
                                            </div>

                                            {/* Associated Skills */}
                                            <div className="mt-4 pt-3 border-t border-outline-variant/20 md:pl-[4.5rem]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Star size={12} className="text-primary" />
                                                        <span className="text-xs font-bold text-outline uppercase tracking-wider">Skills asociadas (Mín. 3)</span>
                                                    </div>
                                                    <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                                        <Wand2 size={10} /> Auto-detección activa
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(exp.skills || []).map((skill, sIdx) => (
                                                        <span key={sIdx} className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-surface border border-outline-variant text-xs font-medium text-[var(--md-sys-color-on-background)] group/skill shadow-sm">
                                                            {skill}
                                                            <button
                                                                onClick={() => {
                                                                    const newExp = [...profile.experience];
                                                                    newExp[idx].skills = (newExp[idx].skills || []).filter((_, i) => i !== sIdx);
                                                                    setProfile({ ...profile, experience: newExp });
                                                                }}
                                                                className="ml-2 text-outline hover:text-error opacity-50 group-hover/skill:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <input
                                                        className="text-xs bg-transparent border border-dashed border-outline-variant rounded-md px-2.5 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 min-w-[120px] placeholder-outline/50 transition-all hover:bg-surface-variant/30"
                                                        placeholder="+ Añadir Skill (Enter)"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const val = e.currentTarget.value.trim();
                                                                if (val && !(exp.skills || []).includes(val)) {
                                                                    const newExp = [...profile.experience];
                                                                    newExp[idx].skills = [...(newExp[idx].skills || []), val];
                                                                    setProfile({ ...profile, experience: newExp });
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <button onClick={() => setProfile({ ...profile, experience: profile.experience.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 p-2 text-outline hover:text-error hover:bg-error/10 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {profile.experience.length === 0 && <EmptyState text="No se detectó experiencia." />}
                                    <Button variant="outline" onClick={() => setProfile({ ...profile, experience: [...profile.experience, { company: '', role: 'Nuevo Rol', period: '', description: '', skills: [] }] })} icon={<Plus size={16} />}>Añadir Experiencia</Button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="bg-surface-variant/20 p-6 rounded-[24px] border border-outline-variant/40">
                                    <div className="mb-6 bg-secondary-container/30 p-4 rounded-xl text-sm text-secondary-onContainer border border-secondary-container/50 flex items-start gap-3">
                                        <Star className="shrink-0 mt-0.5" size={16} />
                                        <p>Añade una mezcla de habilidades técnicas (Hard Skills) y blandas (Soft Skills) para un perfil equilibrado.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {profile.skills.map((skill, idx) => (
                                            <div key={idx} className="flex items-center bg-surface pl-4 pr-2 py-2 rounded-full text-sm border border-outline-variant shadow-sm hover:border-primary transition-colors group">
                                                <input className="bg-transparent border-none focus:ring-0 text-[var(--md-sys-color-on-background)] min-w-[80px] p-0 text-sm outline-none" value={skill} onChange={(e) => { const newS = [...profile.skills]; newS[idx] = e.target.value; setProfile({ ...profile, skills: newS }); }} />
                                                <button onClick={() => setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== idx) })} className="ml-2 p-1 text-outline hover:text-error rounded-full"><X size={14} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setProfile({ ...profile, skills: [...profile.skills, "Nueva habilidad"] })} className="px-4 py-2 rounded-full border border-dashed border-outline text-outline hover:text-primary hover:border-primary text-sm flex items-center gap-2 transition-all">
                                            <Plus size={16} /> Añadir
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['languages', 'frameworks', 'ides', 'tools'].map((cat) => (
                                        <div key={cat} className="bg-surface p-6 rounded-[24px] border border-outline-variant/40 shadow-sm flex flex-col h-full hover:shadow-elevation-1 transition-shadow">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{techLabels[cat]}</h3>
                                                <span className="text-xs font-bold text-secondary-onContainer bg-secondary-container px-2.5 py-1 rounded-full">{(profile.techStack as any)[cat].length}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                                                {(profile.techStack as any)[cat]?.map((item: string, idx: number) => (
                                                    <span key={idx} className="group bg-surface-variant/50 text-[var(--md-sys-color-on-background)] px-3 py-1.5 rounded-lg text-xs font-medium border border-outline-variant flex items-center gap-2 hover:bg-surface-variant transition-colors">
                                                        <TechIcon name={item} className="w-4 h-4 opacity-70" />
                                                        {item}
                                                        <button onClick={() => handleRemoveTech(cat, idx)} className="text-outline hover:text-error transition-colors ml-1"><X size={14} /></button>
                                                    </span>
                                                ))}
                                                {((profile.techStack as any)[cat] || []).length === 0 && (
                                                    <span className="text-xs text-outline italic">Lista vacía</span>
                                                )}
                                            </div>

                                            <div className="mt-auto">
                                                <div className="relative mb-4">
                                                    <input
                                                        type="text"
                                                        className="w-full pl-4 pr-10 py-2.5 bg-surface-variant/30 border border-outline-variant rounded-xl text-sm focus:bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                        placeholder="Añadir..."
                                                        value={techInputs[cat]}
                                                        onChange={(e) => setTechInputs({ ...techInputs, [cat]: e.target.value })}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTech(cat, techInputs[cat])}
                                                    />
                                                    <button
                                                        onClick={() => handleAddTech(cat, techInputs[cat])}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-outline hover:text-primary transition-colors rounded-full hover:bg-surface-variant"
                                                    >
                                                        <ArrowRight size={16} />
                                                    </button>
                                                </div>

                                                <p className="text-[10px] font-bold text-outline uppercase mb-2 ml-1">Sugerencias:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {techSuggestions[cat].filter(s => !((profile.techStack as any)[cat] || []).includes(s)).slice(0, 6).map(sugg => (
                                                        <button
                                                            key={sugg}
                                                            onClick={() => handleAddTech(cat, sugg)}
                                                            className="text-[10px] px-2 py-1 bg-surface-variant/30 text-outline rounded-md border border-transparent hover:border-outline-variant hover:text-primary transition-all flex items-center gap-1"
                                                        >
                                                            <Plus size={10} />
                                                            {sugg}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    {profile.projects.map((proj, idx) => (
                                        <div key={idx} className="p-6 bg-surface rounded-[24px] border border-outline-variant/40 shadow-sm relative group">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                                <div className="w-full">
                                                    <input
                                                        className="w-full text-lg font-bold text-primary bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary p-0 outline-none transition-colors"
                                                        value={proj.name}
                                                        onChange={(e) => { const newP = [...profile.projects]; newP[idx].name = e.target.value; setProfile({ ...profile, projects: newP }); }}
                                                        placeholder="Nombre del Proyecto"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex items-center gap-2 bg-surface-variant/30 px-3 py-1.5 rounded-lg border border-outline-variant/30">
                                                        <Calendar size={14} className="text-outline" />
                                                        <input className="w-20 text-xs bg-transparent outline-none text-center" placeholder="Inicio" value={proj.startDate || ''} onChange={(e) => { const newP = [...profile.projects]; newP[idx].startDate = e.target.value; setProfile({ ...profile, projects: newP }); }} />
                                                        <span className="text-outline">-</span>
                                                        <input className="w-20 text-xs bg-transparent outline-none text-center" placeholder="Fin" value={proj.endDate || ''} onChange={(e) => { const newP = [...profile.projects]; newP[idx].endDate = e.target.value; setProfile({ ...profile, projects: newP }); }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4">
                                                <Link size={14} className="text-outline" />
                                                <input className="flex-1 text-sm text-blue-600 bg-transparent border-none outline-none hover:underline placeholder-outline/50" placeholder="https://..." value={proj.link || ''} onChange={(e) => { const newP = [...profile.projects]; newP[idx].link = e.target.value; setProfile({ ...profile, projects: newP }); }} />
                                            </div>

                                            <div className="relative mb-4">
                                                <textarea className="w-full text-sm text-[var(--md-sys-color-on-background)] bg-surface-variant/20 border border-outline-variant/30 rounded-xl p-4 h-28 outline-none resize-none focus:border-primary transition-all" value={proj.description} onChange={(e) => { const newP = [...profile.projects]; newP[idx].description = e.target.value; setProfile({ ...profile, projects: newP }); }} placeholder="¿Qué construiste y cómo?" />
                                                <button onClick={() => openJanice(proj.description, `Proyecto: ${proj.name}`, (txt) => { const newP = [...profile.projects]; newP[idx].description = txt; setProfile({ ...profile, projects: newP }); })} className="absolute bottom-3 right-3 text-xs bg-tertiary-container text-tertiary-onContainer px-3 py-1.5 rounded-full flex items-center gap-1 hover:opacity-90 shadow-sm"><Sparkles size={12} /> Janice</button>
                                            </div>

                                            <div className="space-y-3 pt-3 border-t border-outline-variant/20">
                                                <div className="flex items-center gap-3">
                                                    <Code size={16} className="text-outline" />
                                                    <input className="w-full text-sm text-[var(--md-sys-color-on-background)] bg-transparent border-none outline-none placeholder-outline/50" value={proj.technologies} onChange={(e) => { const newP = [...profile.projects]; newP[idx].technologies = e.target.value; setProfile({ ...profile, projects: newP }); }} placeholder="Stack (React, Node, AWS...)" />
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <Image size={16} className="text-outline mt-1.5" />
                                                    <div className="flex-1 flex flex-wrap gap-2">
                                                        {(proj.images || []).map((img, imgIdx) => (
                                                            <div key={imgIdx} className="relative group/img w-20 h-14 bg-surface-variant rounded-lg border border-outline-variant overflow-hidden">
                                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                                <button onClick={() => { const newP = [...profile.projects]; newP[idx].images = (newP[idx].images || []).filter((_, i) => i !== imgIdx); setProfile({ ...profile, projects: newP }); }} className="absolute inset-0 bg-black/50 hidden group-hover/img:flex items-center justify-center text-white"><X size={16} /></button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => { const url = prompt("URL de la imagen:"); if (url) { const newP = [...profile.projects]; newP[idx].images = [...(newP[idx].images || []), url]; setProfile({ ...profile, projects: newP }); } }}
                                                            className="w-20 h-14 bg-surface-variant/30 border border-dashed border-outline-variant rounded-lg flex items-center justify-center text-outline hover:text-primary hover:border-primary transition-colors"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <button onClick={() => setProfile({ ...profile, projects: profile.projects.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 p-2 text-outline hover:text-error hover:bg-error/10 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    <Button variant="outline" onClick={() => setProfile({ ...profile, projects: [...profile.projects, { name: 'Nuevo Proyecto', description: '', technologies: '' }] })} icon={<Plus size={16} />}>Añadir Proyecto</Button>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    {profile.volunteering.map((vol, idx) => (
                                        <div key={idx} className="p-6 bg-surface rounded-[24px] border border-outline-variant/40 shadow-sm relative group">
                                            <div className="flex justify-between items-center mb-4">
                                                <input className="block w-full font-bold text-lg text-[var(--md-sys-color-on-background)] bg-transparent border-none p-0 outline-none" value={vol.role} onChange={(e) => { const newV = [...profile.volunteering]; newV[idx].role = e.target.value; setProfile({ ...profile, volunteering: newV }); }} placeholder="Título del Voluntariado" />
                                                <button onClick={() => setProfile({ ...profile, volunteering: profile.volunteering.filter((_, i) => i !== idx) })} className="text-outline hover:text-error p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18} /></button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <input className="text-sm bg-surface-variant/30 border border-outline-variant rounded-lg px-4 py-2.5 text-[var(--md-sys-color-on-background)] focus:border-primary outline-none" value={vol.company} onChange={(e) => { const newV = [...profile.volunteering]; newV[idx].company = e.target.value; setProfile({ ...profile, volunteering: newV }); }} placeholder="Organización" />
                                                <input className="text-sm bg-surface-variant/30 border border-outline-variant rounded-lg px-4 py-2.5 text-[var(--md-sys-color-on-background)] focus:border-primary outline-none" value={vol.period} onChange={(e) => { const newV = [...profile.volunteering]; newV[idx].period = e.target.value; setProfile({ ...profile, volunteering: newV }); }} placeholder="Periodo" />
                                            </div>
                                            <textarea className="w-full text-sm text-[var(--md-sys-color-on-background)] bg-surface-variant/30 border border-outline-variant rounded-xl p-4 h-24 outline-none resize-none focus:border-primary transition-all" value={vol.description} onChange={(e) => { const newV = [...profile.volunteering]; newV[idx].description = e.target.value; setProfile({ ...profile, volunteering: newV }); }} placeholder="Descripción..." />
                                        </div>
                                    ))}
                                    <Button variant="outline" onClick={() => setProfile({ ...profile, volunteering: [...profile.volunteering, { company: '', role: 'Nuevo Voluntariado', period: '', description: '' }] })} icon={<Plus size={16} />}>Añadir Voluntariado</Button>
                                </div>
                            )}

                            {currentStep === 6 && (
                                <div className="space-y-4">
                                    {profile.awards.map((award, idx) => (
                                        <div key={idx} className="p-4 bg-surface rounded-xl border border-outline-variant/40 flex items-center gap-4 relative group hover:border-yellow-400 transition-colors">
                                            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                                                <Award size={20} />
                                            </div>
                                            <input className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--md-sys-color-on-background)] font-medium p-0 outline-none" value={award} onChange={(e) => { const newA = [...profile.awards]; newA[idx] = e.target.value; setProfile({ ...profile, awards: newA }); }} placeholder="Premio o reconocimiento..." />
                                            <button onClick={() => setProfile({ ...profile, awards: profile.awards.filter((_, i) => i !== idx) })} className="text-outline hover:text-error p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <Button variant="outline" onClick={() => setProfile({ ...profile, awards: [...profile.awards, ""] })} icon={<Plus size={16} />}>Añadir Reconocimiento</Button>
                                </div>
                            )}

                            {currentStep === 7 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {profile.languages.map((lang, idx) => (
                                            <div key={idx} className="p-5 bg-surface rounded-[20px] border border-outline-variant/40 flex flex-col gap-3 relative group shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                            <Globe size={18} />
                                                        </div>
                                                        <input className="font-bold text-[var(--md-sys-color-on-background)] bg-transparent border-none p-0 text-base outline-none w-32" value={lang.language} onChange={(e) => { const newL = [...profile.languages]; newL[idx].language = e.target.value; setProfile({ ...profile, languages: newL }); }} placeholder="Idioma" />
                                                    </div>
                                                    <button onClick={() => setProfile({ ...profile, languages: profile.languages.filter((_, i) => i !== idx) })} className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                                                </div>
                                                <input className="text-sm text-outline bg-surface-variant/30 border border-outline-variant rounded-lg px-3 py-2 w-full outline-none focus:border-primary transition-colors" value={lang.level} onChange={(e) => { const newL = [...profile.languages]; newL[idx].level = e.target.value; setProfile({ ...profile, languages: newL }); }} placeholder="Nivel (Ej: Nativo, B2...)" />
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" onClick={() => setProfile({ ...profile, languages: [...profile.languages, { language: '', level: '' }] })} icon={<Plus size={16} />}>Añadir Idioma</Button>
                                </div>
                            )}

                            {currentStep === 8 && (
                                <div className="space-y-6">
                                    <div className="bg-secondary-container/20 p-4 rounded-xl border border-secondary-container/40 mb-4 flex items-center gap-3">
                                        <Heart className="text-secondary-onContainer" size={18} />
                                        <p className="text-sm text-secondary-onContainer">🎯 Tip: Incluye pasatiempos que demuestren habilidades transferibles (ej: Ajedrez - Estrategia).</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {profile.hobbies.map((hobby, idx) => (
                                            <div key={idx} className="flex items-center bg-surface pl-4 pr-2 py-2.5 rounded-xl text-sm border border-outline-variant shadow-sm relative group hover:border-primary transition-colors">
                                                <input className="bg-transparent border-none text-[var(--md-sys-color-on-background)] min-w-[120px] p-0 text-sm outline-none" value={hobby} onChange={(e) => { const newH = [...profile.hobbies]; newH[idx] = e.target.value; setProfile({ ...profile, hobbies: newH }); }} />
                                                <button onClick={() => setProfile({ ...profile, hobbies: profile.hobbies.filter((_, i) => i !== idx) })} className="ml-2 text-outline hover:text-error"><X size={14} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setProfile({ ...profile, hobbies: [...profile.hobbies, "Nuevo Hobby"] })} className="px-4 py-2.5 rounded-xl border border-dashed border-outline text-outline hover:text-primary hover:border-primary text-sm flex items-center gap-2 transition-all">
                                            <Plus size={16} /> Añadir
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 9 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(profile.socials || []).map((social, idx) => (
                                            <div key={idx} className="p-4 bg-surface rounded-xl border border-outline-variant/40 flex items-center gap-3 relative group">
                                                <div className="p-2 bg-surface-variant/50 rounded-lg text-on-surface">
                                                    <SocialIcon network={social.network} className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-[var(--md-sys-color-on-background)]">{social.network}</p>
                                                    <input
                                                        className="w-full bg-transparent border-none p-0 text-xs text-outline outline-none"
                                                        value={social.url}
                                                        onChange={(e) => {
                                                            const newSocials = [...(profile.socials || [])];
                                                            newSocials[idx].url = e.target.value;
                                                            setProfile({ ...profile, socials: newSocials });
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newSocials = [...(profile.socials || [])];
                                                        setProfile({ ...profile, socials: newSocials.filter((_, i) => i !== idx) });
                                                    }}
                                                    className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-surface-variant/30 rounded-xl border border-dashed border-outline-variant flex flex-col md:flex-row gap-3 items-end md:items-center">
                                        <div className="flex-1 w-full space-y-3 md:space-y-0 md:flex md:gap-3">
                                            <select
                                                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full md:w-1/3"
                                                id="new-social-network"
                                            >
                                                <option value="">Selecciona Red...</option>
                                                {professionalNetworks.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                            <input
                                                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary w-full md:flex-1"
                                                placeholder="URL del perfil (https://...)"
                                                id="new-social-url"
                                            />
                                        </div>
                                        <Button
                                            onClick={() => {
                                                const netSelect = document.getElementById('new-social-network') as HTMLSelectElement;
                                                const urlInput = document.getElementById('new-social-url') as HTMLInputElement;
                                                if (netSelect.value && urlInput.value) {
                                                    const newSocials = [...(profile.socials || [])];
                                                    let username = '';
                                                    try {
                                                        const urlParts = new URL(urlInput.value).pathname.split('/').filter(Boolean);
                                                        username = urlParts[urlParts.length - 1] || '';
                                                    } catch (e) { }

                                                    newSocials.push({
                                                        network: netSelect.value,
                                                        url: urlInput.value,
                                                        username: username
                                                    });
                                                    setProfile({ ...profile, socials: newSocials });
                                                    netSelect.value = '';
                                                    urlInput.value = '';
                                                }
                                            }}
                                            icon={<Plus size={16} />}
                                            size="sm"
                                        >
                                            Añadir
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 10 && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-surface rounded-[24px] border border-outline-variant/40 relative shadow-sm">
                                        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                                            {/* Avatar Upload Section */}
                                            <div className="shrink-0">
                                                <h3 className="text-xs font-bold text-primary uppercase mb-4 tracking-wider">Imagen Perfil Donna</h3>
                                                <div className="relative group/avatar w-32 h-32 rounded-3xl bg-surface-variant overflow-hidden border-2 border-outline-variant border-dashed hover:border-primary transition-all flex items-center justify-center">
                                                    {profile.donnaImage ? (
                                                        <img src={profile.donnaImage} alt="Donna Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-outline opacity-50">
                                                            <User size={32} />
                                                            <span className="text-[10px] uppercase font-bold">Sin foto</span>
                                                        </div>
                                                    )}
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                                                        <Upload size={24} className="mb-1" />
                                                        <span className="text-[10px] font-bold uppercase">Subir Foto</span>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const compressed = await compressImage(file, 600, 600, 0.7);
                                                                    setProfile({ ...profile, donnaImage: compressed });
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {profile.donnaImage && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); setProfile({ ...profile, donnaImage: undefined }); }}
                                                            className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Full Name Input (Optional upgrade if needed, but we have fullName in profile) */}
                                            <div className="flex-1 w-full">
                                                <h3 className="text-xs font-bold text-primary uppercase mb-4 tracking-wider">Nombre Completo</h3>
                                                <input
                                                    className="w-full bg-surface-variant/20 border-b-2 border-outline-variant focus:border-primary px-4 py-3 text-2xl font-display font-medium text-[var(--md-sys-color-on-background)] placeholder-outline/50 outline-none transition-colors rounded-t-xl"
                                                    value={profile.fullName || ''}
                                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                                    placeholder="Tu nombre real"
                                                />
                                            </div>
                                        </div>

                                        <h3 className="text-xs font-bold text-primary uppercase mb-4 tracking-wider">Resumen Ejecutivo</h3>
                                        <div className="relative">
                                            <textarea className="w-full text-base leading-relaxed text-[var(--md-sys-color-on-background)] bg-surface-variant/20 border border-outline-variant rounded-xl p-6 h-64 outline-none resize-none focus:border-primary transition-all" value={profile.summary} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} placeholder="Escribe un resumen profesional..." />
                                            <button onClick={() => openJanice(profile.summary, `Resumen Profesional`, (txt) => setProfile({ ...profile, summary: txt }))} className="absolute bottom-5 right-5 text-xs bg-tertiary-container text-tertiary-onContainer px-4 py-2 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow font-medium"><Sparkles size={14} /> Janice: Mejorar Redacción</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 11 && (
                                <div className="space-y-6">
                                    <div className="bg-surface-variant text-[var(--md-sys-color-on-background)] p-5 rounded-[20px] flex items-center gap-4 border border-outline-variant/30">
                                        <div className="p-2 bg-[var(--md-sys-color-background)] rounded-lg shadow-sm">
                                            <ShieldAlert className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold text-base">Revisión Final</p>
                                            <p className="opacity-80">Revisa los datos antes de pasar al modo asistente.</p>
                                        </div>
                                    </div>
                                    <div className="bg-surface border border-outline-variant/40 rounded-[24px] overflow-hidden shadow-sm">
                                        <div className="p-8 space-y-10 max-h-[600px] overflow-y-auto custom-scrollbar text-sm">
                                            <section>
                                                <h4 className="font-bold text-primary mb-3 border-b border-outline-variant pb-2 uppercase text-xs tracking-wider">Resumen</h4>
                                                <textarea
                                                    className="w-full min-h-[100px] text-[var(--md-sys-color-on-background)] leading-relaxed bg-transparent border-none p-0 resize-none outline-none"
                                                    value={profile.summary}
                                                    onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                                                />
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-primary mb-6 border-b border-outline-variant pb-2 uppercase text-xs tracking-wider">Experiencia</h4>
                                                {profile.experience.map((e, i) => (
                                                    <div key={i} className="mb-8 pl-4 border-l-2 border-outline-variant relative group">
                                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                                                            <input className="font-bold text-lg text-[var(--md-sys-color-on-background)] bg-transparent border-none p-0 outline-none w-full sm:w-auto" value={e.role} onChange={(evt) => { const n = [...profile.experience]; n[i].role = evt.target.value; setProfile({ ...profile, experience: n }) }} />
                                                            <span className="text-outline hidden sm:inline">@</span>
                                                            <input className="font-medium text-primary bg-transparent border-none p-0 outline-none w-full sm:w-auto" value={e.company} onChange={(evt) => { const n = [...profile.experience]; n[i].company = evt.target.value; setProfile({ ...profile, experience: n }) }} />
                                                        </div>
                                                        <input className="text-xs font-bold text-outline mb-3 bg-transparent border-none p-0 outline-none w-full block uppercase tracking-wide" value={e.period} onChange={(evt) => { const n = [...profile.experience]; n[i].period = evt.target.value; setProfile({ ...profile, experience: n }) }} />
                                                        <textarea className="w-full text-[var(--md-sys-color-on-background)] bg-transparent border-none p-0 outline-none resize-none min-h-[60px] leading-relaxed" value={e.description} onChange={(evt) => { const n = [...profile.experience]; n[i].description = evt.target.value; setProfile({ ...profile, experience: n }) }} />
                                                    </div>
                                                ))}
                                            </section>

                                            <section>
                                                <h4 className="font-bold text-primary mb-4 border-b border-outline-variant pb-2 uppercase text-xs tracking-wider">Skills & Stack</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.skills.map((s, i) => (
                                                        <input key={`sk-${i}`} className="bg-surface-variant/50 text-[var(--md-sys-color-on-background)] px-3 py-1.5 rounded-lg text-xs font-medium border-none outline-none w-auto min-w-[60px] text-center" style={{ width: `${s.length + 2}ch` }} value={s} onChange={(e) => { const n = [...profile.skills]; n[i] = e.target.value; setProfile({ ...profile, skills: n }) }} />
                                                    ))}
                                                </div>
                                            </section>

                                            {(profile.socials && profile.socials.length > 0) && (
                                                <section>
                                                    <h4 className="font-bold text-primary mb-4 border-b border-outline-variant pb-2 uppercase text-xs tracking-wider">Redes Sociales</h4>
                                                    <ul className="space-y-1">
                                                        {profile.socials.map((s, i) => (
                                                            <li key={i} className="flex gap-2 text-xs">
                                                                <span className="font-bold">{s.network}:</span>
                                                                <span className="text-outline truncate">{s.url}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sticky Footer */}
                        <footer className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-between items-center">
                            <Button variant="ghost" onClick={() => { if (currentStep > 0) setCurrentStep(currentStep - 1); }} disabled={currentStep === 0} className="px-4">
                                <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
                            </Button>
                            <Button
                                onClick={currentStep === 11 ? onFinish : () => setCurrentStep(currentStep + 1)}
                                className="px-8 shadow-elevation-2"
                                variant={currentStep === 11 ? 'primary' : 'secondary'}
                            >
                                {currentStep === 11 ? <>Finalizar <CheckCircle2 className="w-4 h-4 ml-2" /></> : <>Siguiente <ArrowRight className="w-4 h-4 ml-2" /></>}
                            </Button>
                        </footer>
                    </div>
                </main>

                {/* Right Side Panel */}
                <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} fileDataUrl={fileDataUrl} />
            </div>
        </div>
    );
};
