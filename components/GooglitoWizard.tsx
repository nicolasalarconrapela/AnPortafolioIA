import React, { useState } from 'react';
import {
    CheckCircle2, FileJson, ChevronRight, ChevronLeft, Briefcase, Star,
    Terminal, Code, Heart, Award, Globe, BookOpen, User, FileText,
    Sparkles, X, Plus, ArrowRight, ShieldAlert
} from 'lucide-react';
import { Button } from './Button';
import { CompanyLogo } from './CompanyLogo';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { GretchenModal } from './GretchenModal';
import { JaniceModal } from './JaniceModal';
import { CVProfile } from '../types';

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
    const [janiceData, setJaniceData] = useState<{text: string, context: string, callback: (t: string) => void} | null>(null);
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
        switch(step) {
            case 1: return profile.experience; case 2: return profile.skills; case 3: return profile.techStack; case 4: return profile.projects; case 5: return profile.volunteering;
            case 6: return profile.awards; case 7: return profile.languages; case 8: return profile.hobbies; case 9: return profile.summary; default: return null;
        }
    }
  
    const handleGretchenFix = (newData: any) => {
        const newProfile = { ...profile };
        switch(currentStep) {
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
              <JaniceModal isOpen={janiceOpen} onClose={() => setJaniceOpen(false)} initialText={janiceData?.text || ''} context={janiceData?.context || ''} onApply={janiceData?.callback || (() => {})} />
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
                                              <div className="hidden md:block"><CompanyLogo name={exp.company} /></div>
                                              <div className="w-full">
                                                  <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-slate-900 p-0" value={exp.role} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].role = e.target.value; setProfile({...profile, experience: newExp}); }} placeholder="Cargo / Rol" />
                                                  <input className="flex-1 text-sm bg-transparent border-none text-blue-600 font-medium p-0 focus:ring-0" value={exp.company} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].company = e.target.value; setProfile({...profile, experience: newExp}); }} placeholder="Empresa" />
                                              </div>
                                          </div>
                                          <input className="w-full md:w-32 text-left md:text-right text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500" value={exp.period} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].period = e.target.value; setProfile({...profile, experience: newExp}); }} placeholder="Periodo" />
                                      </div>
                                      <div className="relative">
                                        <textarea className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-3 h-28 outline-none resize-none" value={exp.description} onChange={(e) => { const newExp = [...profile.experience]; newExp[idx].description = e.target.value; setProfile({...profile, experience: newExp}); }} placeholder="Logros y responsabilidades..." />
                                        <button onClick={() => openJanice(exp.description, `Experiencia como ${exp.role}`, (txt) => { const newExp = [...profile.experience]; newExp[idx].description = txt; setProfile({...profile, experience: newExp}); })} className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3" /> Janice</button>
                                      </div>
                                      <button onClick={() => setProfile({...profile, experience: profile.experience.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1"><X className="w-4 h-4" /></button>
                                  </div>
                              ))}
                              {profile.experience.length === 0 && <EmptyState text="No se detectó experiencia." />}
                              <Button variant="outline" onClick={() => setProfile({...profile, experience: [...profile.experience, { company: '', role: 'Nuevo Rol', period: '', description: '' }]})}>+ Añadir Experiencia</Button>
                          </div>
                      )}
                      
                      {currentStep === 2 && (
                          <div className="space-y-6">
                              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                  <p className="text-sm text-blue-800 mb-2">💡 Tip: Mezcla habilidades técnicas y blandas.</p>
                                  <div className="flex flex-wrap gap-3">
                                      {profile.skills.map((skill, idx) => (
                                          <div key={idx} className="flex items-center bg-white text-slate-700 pl-3 pr-2 py-1.5 rounded-full text-sm border border-slate-200">
                                              <input className="bg-transparent border-none focus:ring-0 text-slate-700 min-w-[60px] p-0 text-sm" value={skill} onChange={(e) => { const newS = [...profile.skills]; newS[idx] = e.target.value; setProfile({...profile, skills: newS}); }} />
                                              <button onClick={() => setProfile({...profile, skills: profile.skills.filter((_, i) => i !== idx)})} className="ml-2 text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                          </div>
                                      ))}
                                      <button onClick={() => setProfile({...profile, skills: [...profile.skills, "Nueva habilidad"]})} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm hover:bg-blue-200">+ Añadir</button>
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
                                              onChange={(e) => setTechInputs({...techInputs, [cat]: e.target.value})}
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
                               <div key={idx} className="p-4 md:p-6 bg-indigo-50/30 rounded-xl border border-indigo-100 relative">
                                   <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-indigo-900 pr-8" value={proj.name} onChange={(e) => { const newP = [...profile.projects]; newP[idx].name = e.target.value; setProfile({...profile, projects: newP}); }} placeholder="Nombre" />
                                   <div className="relative mt-3">
                                        <textarea className="w-full text-sm text-slate-600 bg-white border border-indigo-100 rounded-lg p-3 h-24 outline-none resize-none" value={proj.description} onChange={(e) => { const newP = [...profile.projects]; newP[idx].description = e.target.value; setProfile({...profile, projects: newP}); }} placeholder="Descripción" />
                                        <button onClick={() => openJanice(proj.description, `Proyecto: ${proj.name}`, (txt) => { const newP = [...profile.projects]; newP[idx].description = txt; setProfile({...profile, projects: newP}); })} className="absolute bottom-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3" /> Janice</button>
                                   </div>
                                   <input className="w-full mt-2 text-xs text-indigo-500 bg-white/50 border border-indigo-100 rounded px-2 py-1" value={proj.technologies} onChange={(e) => { const newP = [...profile.projects]; newP[idx].technologies = e.target.value; setProfile({...profile, projects: newP}); }} placeholder="Tecnologías (comas)" />
                                    <button onClick={() => setProfile({...profile, projects: profile.projects.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-indigo-200 hover:text-red-500"><X className="w-5 h-5" /></button>
                               </div>
                           ))}
                           <Button variant="outline" onClick={() => setProfile({...profile, projects: [...profile.projects, { name: 'Nuevo Proyecto', description: '', technologies: '' }]})}>+ Añadir Proyecto</Button>
                       </div>
                      )}

                      {currentStep === 9 && (
                          <div className="space-y-6">
                              <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 relative">
                                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Resumen Ejecutivo</h3>
                                  <textarea className="w-full text-base text-slate-700 bg-white border border-slate-200 rounded-lg p-4 h-64 outline-none resize-none" value={profile.summary} onChange={(e) => setProfile({...profile, summary: e.target.value})} placeholder="Resumen..." />
                                  <button onClick={() => openJanice(profile.summary, `Resumen Profesional`, (txt) => setProfile({...profile, summary: txt}))} className="absolute bottom-4 right-4 text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded-md flex items-center gap-2"><Sparkles className="w-4 h-4" /> Janice: Mejorar Redacción</button>
                              </div>
                          </div>
                      )}
                      {currentStep === 10 && (
                          <div className="space-y-6">
                              <div className="bg-slate-800 text-white p-4 rounded-lg flex items-center gap-3">
                                  <ShieldAlert className="w-6 h-6 text-yellow-400" /><div className="text-sm"><p className="font-bold">Revisión Final</p><p className="opacity-80">Datos vacíos serán eliminados al finalizar.</p></div>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                      <div><h3 className="font-bold text-slate-800 text-lg">{profile.experience[0]?.role || "Profesional"}</h3><p className="text-xs text-slate-500">Vista Previa</p></div>
                                  </div>
                                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto text-sm">
                                      <section><h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Resumen</h4><p className="text-slate-600 leading-relaxed">{profile.summary || "Vacío"}</p></section>
                                      <section><h4 className="font-bold text-blue-600 mb-2 border-b border-blue-100 pb-1">Experiencia ({profile.experience.length})</h4>{profile.experience.map((e, i) => (<div key={i} className="mb-3 pl-2 border-l-2 border-slate-100"><div className="font-bold text-slate-700">{e.role} @ {e.company}</div><div className="text-xs text-slate-400 mb-1">{e.period}</div><p className="text-slate-500 truncate">{e.description}</p></div>))}</section>
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
