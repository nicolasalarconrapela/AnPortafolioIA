import React, { useState, useRef, useEffect } from 'react';
import { Upload, Briefcase, Award, Code, Heart, Globe, BookOpen, Star, User, ChevronRight, ChevronLeft, Save, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';
import { Button } from './components/Button';
import { createGeminiService, GeminiService } from './services/geminiService';
import { AppState, CVProfile } from './types';

// --- Components for the Wizard Sections ---

const SectionHeader = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => (
  <div className="mb-6 border-b border-slate-200 pb-4">
    <div className="flex items-center space-x-3 mb-2">
      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    </div>
    <p className="text-slate-500">{description}</p>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 italic">
        {text}
    </div>
);

// --- Main App Component ---

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<CVProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const geminiServiceRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    geminiServiceRef.current = createGeminiService();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAppState(AppState.ANALYZING);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; 
      
      if (geminiServiceRef.current) {
        try {
          // "Señorita Rotenmeir" ingests the data
          const result = await geminiServiceRef.current.analyzeCVJSON(base64Data, file.type);
          setProfile(result);
          setAppState(AppState.WIZARD);
          setCurrentStep(1); // Go to first Googlito
        } catch (err: any) {
          setError("La Señorita Rotenmeir rechazó este documento. (Error de análisis)");
          setAppState(AppState.ERROR);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
      if (currentStep < 8) {
          setCurrentStep(c => c + 1);
      } else {
          setAppState(AppState.HARVIS);
      }
  };

  const handleBack = () => {
      if (currentStep > 1) {
          setCurrentStep(c => c - 1);
      }
  };

  // --- Render Functions for Personas ---

  const renderRotenmeir = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-800 via-slate-700 to-red-800"></div>
        
        <div className="max-w-md w-full text-center space-y-8 relative z-10">
            <div className="bg-slate-800 p-8 rounded-t-lg rounded-b-3xl border-t-4 border-red-700 shadow-2xl">
                <div className="w-20 h-20 bg-slate-700 mx-auto rounded-full flex items-center justify-center mb-6 border-2 border-slate-600">
                    <User className="w-10 h-10 text-slate-300" />
                </div>
                <h1 className="text-3xl font-serif font-bold mb-2">Señorita Rotenmeir</h1>
                <p className="text-slate-400 italic mb-6">"Entrégueme sus papeles. Sin arrugas, por favor."</p>
                
                {appState === AppState.ANALYZING ? (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-slate-400 animate-pulse">Examinando minuciosamente...</p>
                    </div>
                ) : (
                    <label className="block w-full cursor-pointer bg-red-800 hover:bg-red-900 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                        <span>Subir CV para Inspección</span>
                        <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
                    </label>
                )}
                {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
            </div>
            <p className="text-xs text-slate-600 font-mono">SYSTEM: DATA_INGEST_V1 // AUTHORIZED_PERSONNEL_ONLY</p>
        </div>
    </div>
  );

  const renderGooglitoStep = () => {
      if (!profile) return null;

      const steps = [
          null, // 0 is Rotenmeir
          { id: 'exp', title: 'Experiencia', icon: <Briefcase />, desc: 'Revisemos tu trayectoria laboral.' },
          { id: 'skills', title: 'Skills Generales', icon: <Star />, desc: 'Tus superpoderes y habilidades blandas.' },
          { id: 'tech', title: 'Stack Tecnológico', icon: <Terminal />, desc: 'Lenguajes, Frameworks y Herramientas.' },
          { id: 'projects', title: 'Proyectos', icon: <Code />, desc: 'Lo que has construido.' },
          { id: 'vol', title: 'Voluntariado', icon: <Heart />, desc: 'Tu impacto social.' },
          { id: 'awards', title: 'Reconocimientos', icon: <Award />, desc: 'Premios y certificaciones.' },
          { id: 'lang', title: 'Idiomas', icon: <Globe />, desc: '¿Qué lenguas dominas?' },
          { id: 'hobbies', title: 'Hobbies', icon: <BookOpen />, desc: '¿Qué te apasiona fuera del trabajo?' },
      ];

      const step = steps[currentStep];
      if (!step) return null;

      return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
              {/* Googlito Header */}
              <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                  <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="font-bold text-slate-700 ml-2">Googlito #{currentStep}</span>
                  </div>
                  <div className="text-sm text-slate-400">Paso {currentStep} de 8</div>
              </header>

              <main className="flex-1 max-w-3xl w-full mx-auto p-6 lg:p-10 animate-fade-in">
                  <SectionHeader title={step.title} description={step.desc} icon={step.icon} />
                  
                  {/* DYNAMIC FORM CONTENT BASED ON STEP */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                      
                      {/* STEP 1: EXPERIENCE */}
                      {currentStep === 1 && (
                          <div className="space-y-6">
                              {profile.experience.map((exp, idx) => (
                                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                      <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-slate-800" value={exp.role} onChange={(e) => {
                                          const newExp = [...profile.experience];
                                          newExp[idx].role = e.target.value;
                                          setProfile({...profile, experience: newExp});
                                      }} placeholder="Rol" />
                                      <div className="flex gap-2 mt-2">
                                        <input className="flex-1 text-sm bg-white border border-slate-200 rounded px-2 py-1" value={exp.company} onChange={(e) => {
                                            const newExp = [...profile.experience];
                                            newExp[idx].company = e.target.value;
                                            setProfile({...profile, experience: newExp});
                                        }} placeholder="Empresa" />
                                        <input className="w-32 text-sm bg-white border border-slate-200 rounded px-2 py-1" value={exp.period} onChange={(e) => {
                                            const newExp = [...profile.experience];
                                            newExp[idx].period = e.target.value;
                                            setProfile({...profile, experience: newExp});
                                        }} placeholder="Periodo" />
                                      </div>
                                      <textarea className="w-full mt-2 text-sm text-slate-600 bg-white border border-slate-200 rounded p-2 h-24" value={exp.description} onChange={(e) => {
                                          const newExp = [...profile.experience];
                                          newExp[idx].description = e.target.value;
                                          setProfile({...profile, experience: newExp});
                                      }} placeholder="Descripción" />
                                  </div>
                              ))}
                              {profile.experience.length === 0 && <EmptyState text="No se detectó experiencia. ¡Añade una!" />}
                              <Button variant="outline" onClick={() => setProfile({...profile, experience: [...profile.experience, { company: '', role: 'Nuevo Rol', period: '', description: '' }]})}>+ Añadir Experiencia</Button>
                          </div>
                      )}

                      {/* STEP 2: SKILLS (Array string) */}
                      {currentStep === 2 && (
                          <div className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                  {profile.skills.map((skill, idx) => (
                                      <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-100">
                                          <input 
                                            className="bg-transparent border-none focus:ring-0 text-blue-700 w-full min-w-[50px]" 
                                            value={skill} 
                                            onChange={(e) => {
                                                const newSkills = [...profile.skills];
                                                newSkills[idx] = e.target.value;
                                                setProfile({...profile, skills: newSkills});
                                            }}
                                          />
                                          <button onClick={() => {
                                               const newSkills = profile.skills.filter((_, i) => i !== idx);
                                               setProfile({...profile, skills: newSkills});
                                          }} className="ml-2 hover:text-red-500"><XIcon /></button>
                                      </div>
                                  ))}
                              </div>
                              <Button variant="outline" onClick={() => setProfile({...profile, skills: [...profile.skills, "Nueva habilidad"]})}>+ Añadir Skill</Button>
                          </div>
                      )}

                      {/* STEP 3: TECH STACK */}
                      {currentStep === 3 && (
                          <div className="space-y-6">
                              {['languages', 'frameworks', 'ides', 'tools'].map((cat) => (
                                  <div key={cat}>
                                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{cat}</h3>
                                      <div className="flex flex-wrap gap-2">
                                          {(profile.techStack as any)[cat]?.map((item: string, idx: number) => (
                                              <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm border border-slate-200 flex items-center gap-1">
                                                  {item}
                                                  <button onClick={() => {
                                                      const newStack = {...profile.techStack};
                                                      (newStack as any)[cat] = (newStack as any)[cat].filter((_:any, i:number) => i !== idx);
                                                      setProfile({...profile, techStack: newStack});
                                                  }} className="text-slate-400 hover:text-red-500">×</button>
                                              </span>
                                          ))}
                                          <button 
                                            onClick={() => {
                                                const newItem = prompt(`Añadir ${cat}:`);
                                                if (newItem) {
                                                    const newStack = {...profile.techStack};
                                                    (newStack as any)[cat] = [...(newStack as any)[cat], newItem];
                                                    setProfile({...profile, techStack: newStack});
                                                }
                                            }}
                                            className="px-3 py-1 rounded-md text-sm border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500"
                                          >+ Add</button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* STEP 4: PROJECTS */}
                      {currentStep === 4 && (
                           <div className="space-y-6">
                           {profile.projects.map((proj, idx) => (
                               <div key={idx} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                   <input className="block w-full font-bold text-lg bg-transparent border-none focus:ring-0 text-indigo-900" value={proj.name} onChange={(e) => {
                                       const newP = [...profile.projects];
                                       newP[idx].name = e.target.value;
                                       setProfile({...profile, projects: newP});
                                   }} placeholder="Nombre del Proyecto" />
                                   <textarea className="w-full mt-2 text-sm text-slate-600 bg-white/50 border border-indigo-100 rounded p-2 h-20" value={proj.description} onChange={(e) => {
                                       const newP = [...profile.projects];
                                       newP[idx].description = e.target.value;
                                       setProfile({...profile, projects: newP});
                                   }} placeholder="Descripción" />
                                   <input className="w-full mt-2 text-xs text-indigo-500 bg-white/50 border border-indigo-100 rounded px-2 py-1" value={proj.technologies} onChange={(e) => {
                                       const newP = [...profile.projects];
                                       newP[idx].technologies = e.target.value;
                                       setProfile({...profile, projects: newP});
                                   }} placeholder="Tecnologías usadas (sep. por comas)" />
                               </div>
                           ))}
                           {profile.projects.length === 0 && <EmptyState text="Sin proyectos destacados." />}
                           <Button variant="outline" onClick={() => setProfile({...profile, projects: [...profile.projects, { name: 'Nuevo Proyecto', description: '', technologies: '' }]})}>+ Añadir Proyecto</Button>
                       </div>
                      )}
                      
                      {/* STEP 5: VOLUNTEERING */}
                      {currentStep === 5 && (
                          <div className="space-y-4">
                              {profile.volunteering.map((vol, idx) => (
                                  <div key={idx} className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                                      <input className="font-bold bg-transparent w-full" value={vol.role} onChange={(e) => {
                                          const newV = [...profile.volunteering];
                                          newV[idx].role = e.target.value;
                                          setProfile({...profile, volunteering: newV});
                                      }} placeholder="Rol Voluntario"/>
                                      <input className="text-sm w-full mt-1 bg-transparent" value={vol.company} onChange={(e) => {
                                          const newV = [...profile.volunteering];
                                          newV[idx].company = e.target.value;
                                          setProfile({...profile, volunteering: newV});
                                      }} placeholder="Organización"/>
                                  </div>
                              ))}
                              {profile.volunteering.length === 0 && <EmptyState text="No hay voluntariado registrado." />}
                              <Button variant="outline" onClick={() => setProfile({...profile, volunteering: [...profile.volunteering, { role: 'Voluntario', company: 'Org', period: '', description: '' }]})}>+ Añadir</Button>
                          </div>
                      )}

                      {/* STEP 6: AWARDS */}
                      {currentStep === 6 && (
                          <div className="space-y-2">
                              {profile.awards.map((award, idx) => (
                                  <div key={idx} className="flex gap-2">
                                      <div className="p-2 bg-yellow-100 text-yellow-600 rounded"><Award className="w-4 h-4"/></div>
                                      <input className="flex-1 border-b border-slate-200 focus:border-yellow-500 outline-none pb-1 bg-transparent" value={award} onChange={(e) => {
                                          const newA = [...profile.awards];
                                          newA[idx] = e.target.value;
                                          setProfile({...profile, awards: newA});
                                      }} />
                                       <button onClick={() => {
                                            const newA = profile.awards.filter((_, i) => i !== idx);
                                            setProfile({...profile, awards: newA});
                                       }} className="text-slate-400">×</button>
                                  </div>
                              ))}
                              <Button variant="outline" className="mt-4" onClick={() => setProfile({...profile, awards: [...profile.awards, "Nuevo Reconocimiento"]})}>+ Añadir Premio</Button>
                          </div>
                      )}

                      {/* STEP 7: LANGUAGES */}
                      {currentStep === 7 && (
                          <div className="space-y-4">
                              {profile.languages.map((lang, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                      <input className="font-medium bg-transparent border-none w-1/2" value={lang.language} onChange={(e) => {
                                          const newL = [...profile.languages];
                                          newL[idx].language = e.target.value;
                                          setProfile({...profile, languages: newL});
                                      }} />
                                      <select className="bg-white border border-slate-200 rounded px-2 py-1 text-sm" value={lang.level} onChange={(e) => {
                                          const newL = [...profile.languages];
                                          newL[idx].level = e.target.value;
                                          setProfile({...profile, languages: newL});
                                      }}>
                                          <option>Básico</option>
                                          <option>Intermedio</option>
                                          <option>Avanzado</option>
                                          <option>Nativo</option>
                                      </select>
                                  </div>
                              ))}
                              <Button variant="outline" onClick={() => setProfile({...profile, languages: [...profile.languages, { language: 'Idioma', level: 'Intermedio' }]})}>+ Añadir Idioma</Button>
                          </div>
                      )}

                      {/* STEP 8: HOBBIES */}
                      {currentStep === 8 && (
                          <div className="space-y-4">
                               <div className="flex flex-wrap gap-2">
                                  {profile.hobbies.map((hobby, idx) => (
                                      <span key={idx} className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm border border-pink-100 flex items-center gap-2">
                                          {hobby}
                                          <button onClick={() => {
                                               const newH = profile.hobbies.filter((_, i) => i !== idx);
                                               setProfile({...profile, hobbies: newH});
                                          }} className="hover:text-pink-900">×</button>
                                      </span>
                                  ))}
                              </div>
                              <div className="flex gap-2">
                                <input id="newHobby" className="border border-slate-200 rounded px-3 py-2 text-sm flex-1" placeholder="Ej: Fotografía, Ajedrez..." onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value;
                                        if(val) {
                                            setProfile({...profile, hobbies: [...profile.hobbies, val]});
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}/>
                              </div>
                              <p className="text-xs text-slate-400">Presiona Enter para agregar.</p>
                          </div>
                      )}

                  </div>
              </main>

              {/* Navigation Footer */}
              <footer className="bg-white border-t border-slate-200 p-4 flex justify-between items-center max-w-3xl mx-auto w-full">
                  <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                  </Button>
                  <Button onClick={handleNext}>
                      {currentStep === 8 ? (
                          <>Finalizar <Save className="w-4 h-4 ml-2" /></>
                      ) : (
                          <>Siguiente <ChevronRight className="w-4 h-4 ml-2" /></>
                      )}
                  </Button>
              </footer>
          </div>
      );
  };

  const renderHarvis = () => {
      if (!profile) return null;
      
      return (
          <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-20 pt-10 px-6">
                 <div className="max-w-5xl mx-auto">
                    <div className="flex items-center space-x-3 mb-4 opacity-70">
                         <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                             <span className="font-mono text-cyan-400 font-bold">H</span>
                         </div>
                         <span className="font-mono tracking-widest text-sm text-cyan-400">HARVIS DASHBOARD // V.3.1</span>
                    </div>
                    <h1 className="text-4xl font-light">Perfil del Candidato</h1>
                    <p className="text-xl text-slate-300 mt-2 font-light max-w-2xl">{profile.summary || "Perfil profesional procesado y optimizado."}</p>
                 </div>
              </div>

              <div className="max-w-5xl mx-auto px-6 -mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  
                  {/* Left Column */}
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center"><Code className="w-4 h-4 mr-2 text-blue-500"/> Tech Stack</h3>
                          <div className="flex flex-wrap gap-2">
                              {[...profile.techStack.languages, ...profile.techStack.frameworks].map((t, i) => (
                                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-medium">{t}</span>
                              ))}
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-500">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center"><Star className="w-4 h-4 mr-2 text-purple-500"/> Skills</h3>
                          <ul className="space-y-2">
                              {profile.skills.slice(0, 5).map((s, i) => (
                                  <li key={i} className="flex items-center text-sm text-slate-600">
                                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
                                      {s}
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-pink-500">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center"><Globe className="w-4 h-4 mr-2 text-pink-500"/> Idiomas</h3>
                          <div className="space-y-3">
                              {profile.languages.map((l, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                      <span className="font-medium text-slate-700">{l.language}</span>
                                      <span className="text-slate-400">{l.level}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Right Column (Wider) */}
                  <div className="md:col-span-2 space-y-6">
                       
                       {/* Experience */}
                       <div className="bg-white p-8 rounded-lg shadow-sm">
                           <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-slate-400"/> Experiencia Profesional</h3>
                           <div className="space-y-8 border-l-2 border-slate-100 pl-8 ml-2 relative">
                               {profile.experience.map((exp, i) => (
                                   <div key={i} className="relative">
                                       <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-200"></div>
                                       <h4 className="font-bold text-lg text-slate-800">{exp.role}</h4>
                                       <div className="flex justify-between items-center mb-2">
                                            <span className="text-blue-600 font-medium">{exp.company}</span>
                                            <span className="text-xs text-slate-400 uppercase tracking-wider">{exp.period}</span>
                                       </div>
                                       <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                                   </div>
                               ))}
                           </div>
                       </div>

                       {/* Projects */}
                       {profile.projects.length > 0 && (
                           <div className="bg-white p-8 rounded-lg shadow-sm">
                               <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center"><Terminal className="w-5 h-5 mr-2 text-slate-400"/> Proyectos Destacados</h3>
                               <div className="grid gap-4">
                                   {profile.projects.map((proj, i) => (
                                       <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                           <div className="flex justify-between items-start">
                                               <h4 className="font-bold text-slate-800">{proj.name}</h4>
                                               {proj.link && <a href={proj.link} className="text-blue-500 text-xs hover:underline">Ver link</a>}
                                           </div>
                                           <p className="text-sm text-slate-600 mt-1">{proj.description}</p>
                                           <p className="text-xs text-slate-400 mt-2 font-mono">{proj.technologies}</p>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}

                       {/* Action Bar */}
                       <div className="flex justify-end space-x-4 pt-6">
                           <Button variant="outline" onClick={() => {
                               setCurrentStep(1);
                               setAppState(AppState.WIZARD);
                           }}>Editar Datos</Button>
                           <Button onClick={() => window.print()}>Exportar PDF</Button>
                       </div>
                  </div>
              </div>
          </div>
      );
  };

  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );

  return (
    <>
        {appState === AppState.IDLE && renderRotenmeir()}
        {appState === AppState.ANALYZING && renderRotenmeir()}
        {appState === AppState.ERROR && renderRotenmeir()} 
        {appState === AppState.WIZARD && renderGooglitoStep()}
        {appState === AppState.HARVIS && renderHarvis()}
    </>
  );
}

export default App;
