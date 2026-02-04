
import React, { useState } from 'react';
import {
  ChevronLeft, Bot, Send, Calendar, Download, Briefcase, Code, Globe,
  MessageSquare, MapPin, X, Mail, Linkedin, User, Diamond, Clock,
  Github, ExternalLink, Link as LinkIcon, Settings, LogOut, Edit3
} from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { MarkdownView } from './MarkdownView';
import { CVProfile, ChatMessage } from '../../types_brain';
import { Button } from './Button';

interface DonnaViewProps {
  profile: CVProfile;
  chatHistory: ChatMessage[];
  input: string;
  setInput: (val: string) => void;
  loading: boolean;
  activeTab: 'experience' | 'education' | 'projects' | 'skills';
  setActiveTab: (tab: 'experience' | 'education' | 'projects' | 'skills') => void;
  onSend: (e?: React.FormEvent, text?: string) => void;
  onBack: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  suggestedQuestions: string[];
  onExportJSON?: () => void;
  onEdit?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onShare?: () => void;
}

export const DonnaView: React.FC<DonnaViewProps> = ({
  profile,
  chatHistory,
  input,
  setInput,
  loading,
  activeTab,
  setActiveTab,
  onSend,
  onBack,
  chatEndRef,
  isOffline,
  setIsOffline,
  suggestedQuestions,
  onExportJSON,
  onEdit,
  onSettings,
  onLogout,
  onShare
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Calculate detailed skill metrics (Years + Associated Companies)
  const topSkills = React.useMemo(() => {
    if (!profile.skills || profile.skills.length === 0) return [];

    const currentYear = new Date().getFullYear();

    return profile.skills.map(skill => {
      let totalYears = 0;
      const companies = new Set<string>();
      const skillLower = skill.toLowerCase();

      // Check experience for matches
      profile.experience.forEach(exp => {
        const content = `${exp.role} ${exp.description} ${exp.company}`.toLowerCase();
        // Check explicitly associated skills first, then content text match
        const hasExplicitSkill = exp.skills?.some(s => s.toLowerCase() === skillLower);

        if (hasExplicitSkill || content.includes(skillLower)) {
          companies.add(exp.company);

          // Extract years from dates
          const startYearMatch = exp.startDate?.match(/(\d{4})/);
          const startYear = startYearMatch ? parseInt(startYearMatch[0]) : currentYear;

          let endYear = currentYear;
          if (!exp.current && exp.endDate) {
            const endYearMatch = exp.endDate.match(/(\d{4})/);
            if (endYearMatch) endYear = parseInt(endYearMatch[0]);
          }

          // Add duration (min 1 year if matched)
          totalYears += Math.max(1, endYear - startYear);
        }
      });

      // Check projects for matches (adds context, maybe not years if concurrent)
      profile.projects.forEach(proj => {
        if ((proj.technologies + proj.description + proj.name).toLowerCase().includes(skillLower)) {
          // We just mark it as relevant, maybe add a generic "Personal Projects" tag if we wanted
        }
      });

      // If found in experience, use calculated years. If not found but listed in skills, default to 1 or 0 based on logic.
      // Here we prioritize skills that were actually found in the descriptions.
      return {
        name: skill,
        years: totalYears,
        companies: Array.from(companies)
      };
    })
      // Sort: Primary by years, Secondary by number of companies associated
      .sort((a, b) => b.years - a.years || b.companies.length - a.companies.length)
      .slice(0, 5); // Take top 5
  }, [profile]);

  const getSocialIcon = (network: string) => {
    const n = network.toLowerCase();
    if (n.includes('linkedin')) return <Linkedin size={18} />;
    if (n.includes('github')) return <Github size={18} />;
    if (n.includes('twitter') || n.includes('x.com')) return <span className="font-bold text-sm">𝕏</span>;
    if (n.includes('behance')) return <span className="font-bold text-sm">Be</span>;
    if (n.includes('dribbble')) return <span className="font-bold text-sm">Dr</span>;
    return <LinkIcon size={18} />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'experience':
        const groups: { company: string, logo?: string, roles: any[] }[] = [];
        profile.experience?.forEach(exp => {
          const lastGroup = groups[groups.length - 1];
          if (lastGroup && lastGroup.company === exp.company) {
            lastGroup.roles.push(exp);
          } else {
            groups.push({ company: exp.company, logo: exp.logo, roles: [exp] });
          }
        });

        return (
          <div className="space-y-12 animate-fade-in">
            {groups.map((group, groupIdx) => (
              <div key={groupIdx} className="relative pl-0 md:pl-8 group border-l-2 border-slate-100 md:border-none ml-4 md:ml-0">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="hidden md:flex flex-col items-center shrink-0 w-16">
                    <CompanyLogo name={group.company} logoUrl={group.logo} className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 p-1 object-contain" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6 md:mb-4">
                      <div className="md:hidden">
                        <CompanyLogo name={group.company} logoUrl={group.logo} className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{group.company}</h3>
                    </div>

                    <div className="space-y-8">
                      {group.roles.map((role, roleIdx) => (
                        <div key={roleIdx} className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                            <div>
                              <h4 className="font-bold text-lg text-slate-800">{role.role}</h4>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{role.startDate || 'Start'}</span>
                                <span>—</span>
                                <span className={role.current ? "text-green-600 bg-green-50 px-2 py-0.5 rounded-full" : ""}>
                                  {role.current ? 'Present' : (role.endDate || 'End')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-slate-600 leading-relaxed text-sm">
                            <MarkdownView content={role.description} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {profile.experience.length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">No experience listed.</div>
            )}
          </div>
        );
      case 'education':
        return (
          <div className="grid grid-cols-1 gap-4 animate-fade-in">
            {profile.education?.map((edu, i) => (
              <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <CompanyLogo name={edu.institution} className="w-14 h-14 rounded-xl shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{edu.title}</h4>
                  <p className="text-slate-500 font-medium">{edu.institution}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{edu.period}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'projects':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {profile.projects?.map((proj, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                {proj.images && proj.images.length > 0 ? (
                  <div className="h-48 overflow-hidden bg-slate-100 relative group">
                    <img src={proj.images[0]} alt={proj.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100 relative">
                    <div className="absolute bottom-4 left-6 p-2 bg-white rounded-lg shadow-sm">
                      <Code className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 text-xl leading-tight">{proj.name}</h4>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors -mr-2 -mt-2">
                        <Send className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 mb-6 leading-relaxed line-clamp-3">{proj.description}</p>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {(proj.technologies || '').split(',').slice(0, 4).map((tech, t) => (
                        <span key={t} className="text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {tech.trim()}
                        </span>
                      ))}
                      {(proj.technologies || '').split(',').length > 4 && (
                        <span className="text-[10px] font-bold text-slate-400 px-1 py-1">+{(proj.technologies || '').split(',').length - 4}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'skills':
        return (
          <div className="animate-fade-in bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Competencies & Tech Stack</h4>
            <div className="flex flex-wrap gap-3">
              {profile.skills?.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors cursor-default">
                  {s}
                </span>
              ))}
            </div>

            {profile.techStack && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 mb-4">Languages</h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.techStack.languages.map((l, i) => (
                      <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{l}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 mb-4">Frameworks</h5>
                  <div className="flex flex-wrap gap-2">
                    {profile.techStack.frameworks.map((f, i) => (
                      <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-24">

      {/* Top Navigation */}
      <nav
        className="sticky top-0 z-40 bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300 dark:bg-slate-900/70 dark:border-slate-700/60"
        aria-label="Top navigation"
      >
        {/* Left Side: Back */}
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:text-slate-400 dark:hover:text-slate-100"
              aria-label="Back to editor"
            >
              <div className="p-1.5 rounded-full bg-white shadow-sm border border-slate-100 group-hover:border-slate-300 group-hover:shadow transition-all dark:bg-slate-800 dark:border-slate-700">
                <ChevronLeft size={16} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100" aria-hidden="true" />
              </div>
              <span className="hidden sm:inline font-display">Back to Editor</span>
            </button>
          )}
          {!onBack && (
            <div className="flex items-center gap-2 opacity-70">
              <Bot size={20} className="text-slate-500" />
              <span className="font-display font-bold text-slate-700">AnPortafolio</span>
            </div>
          )}
        </div>

        {/* Right Section Cluster */}
        <div className="flex items-center gap-3">
          {/* Edit Profile Button (Capsule) */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#424559] hover:bg-[#2D2F3E] text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>
          )}

          {/* Download Button (Optional) */}
          {onExportJSON && (
            <button
              onClick={onExportJSON}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
              title="Download JSON"
            >
              <Download size={12} />
              JSON
            </button>
          )}

          {/* Share Button (New) */}
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-indigo-200"
              title="Share Public Link"
            >
              <Globe size={12} />
              Share
            </button>
          )}

          {/* Far Right: Actions (Settings & Logout) */}
          {(onSettings || onLogout) && (
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200/60 ml-1">
              {/* Settings Button (Circle) */}
              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-full transition-all shadow-sm hover:shadow active:scale-95 dark:bg-slate-800 dark:border-slate-700"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
              )}

              {/* Logout Button (Circle - Pinkish) */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-full transition-all shadow-sm hover:shadow active:scale-95 dark:bg-red-900/20 dark:border-red-900/40"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </nav>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Profile Content (8 cols) */}
          <div className="lg:col-span-8 space-y-10">

            {/* Above the Fold: Header Card */}
            <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              {/* Decorative background blur */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-[11px] font-bold uppercase tracking-wider rounded-full border border-green-100">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Available for hire
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider rounded-full border border-slate-100">
                        <MapPin size={12} /> Remote / Hybrid
                      </span>
                    </div>

                    {profile.fullName && (
                      <h2 className="text-xl font-medium text-slate-500 mb-2">
                        {profile.fullName}
                      </h2>
                    )}

                    <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                      {profile.experience[0]?.role || "Senior Technical Professional"}
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl font-light">
                      {profile.summary || "Experienced professional ready to deliver impact and drive innovation in forward-thinking teams."}
                    </p>

                    {/* Top Skills (Googlitos with Tooltip and Years) */}
                    {topSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-6 items-center">
                        {topSkills.map((skill, i) => (
                          <div key={i} className="group relative cursor-help">
                            <span className="inline-flex items-center px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100/50 transition-colors group-hover:bg-indigo-100 group-hover:border-indigo-200">
                              <Diamond className="w-3 h-3 mr-1.5 opacity-60 fill-current" />
                              {skill.name} <span className="opacity-60 ml-1">({skill.years})</span>
                            </span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                              <p className="font-bold mb-1 text-slate-300 uppercase tracking-wider text-[9px]">Experiences:</p>
                              {skill.companies.length > 0 ? (
                                <ul className="list-disc list-inside space-y-0.5">
                                  {skill.companies.slice(0, 3).map((co, c) => (
                                    <li key={c} className="truncate">{co}</li>
                                  ))}
                                  {skill.companies.length > 3 && <li>+ {skill.companies.length - 3} more</li>}
                                </ul>
                              ) : (
                                <p className="italic text-slate-500">General competence</p>
                              )}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Social Proof: Logos - CENTERED */}
                  {profile.experience.length > 0 && (
                    <div className="pt-8 mt-4 border-t border-slate-100 text-center flex flex-col items-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Previously at</p>
                      <div className="flex flex-wrap justify-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                        {Array.from(new Set(profile.experience.map(e => e.company))).slice(0, 4).map((company, i) => (
                          <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                            <CompanyLogo name={company} className="w-5 h-5 rounded-md" />
                            <span className="text-sm font-semibold text-slate-700">{company}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Tabs Navigation */}
            <div className="sticky top-[69px] z-30 bg-[#F8FAFC]/90 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex overflow-x-auto gap-2 no-scrollbar p-1">
                {['experience', 'education', 'projects', 'skills'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`
                                            px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border
                                            ${activeTab === tab
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10 scale-105'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
                      }
                                        `}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="min-h-[500px]">
              {renderContent()}
            </div>
          </div>

          {/* Right Column: Socials & Connect (Sticky) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">

              {/* Connect Widget (Replaced Snapshot) */}
              <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[100px] -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    Connect & Socials
                  </h3>

                  <div className="space-y-4 mb-8">
                    {(profile.socials && profile.socials.length > 0) ? (
                      profile.socials.map((social, i) => (
                        <a
                          key={i}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600 group-hover:text-indigo-600 transition-colors">
                              {getSocialIcon(social.network)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{social.network}</p>
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {social.username || "View Profile"}
                              </p>
                            </div>
                          </div>
                          <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-400" />
                        </a>
                      ))
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-400 italic">No social links found</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full h-12 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all border-none">
                      Schedule Interview
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600">
                        <Mail size={18} />
                      </Button>
                      {/* Fallback generic LinkedIn if not in list */}
                      <Button variant="outline" className="flex-1 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600">
                        <Linkedin size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistant Teaser */}
              {!isChatOpen && (
                <div
                  onClick={() => setIsChatOpen(true)}
                  className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl shadow-slate-900/10 cursor-pointer hover:bg-slate-800 transition-all group flex items-center justify-between transform hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <p className="font-bold text-sm">Donna AI is Online</p>
                    </div>
                    <p className="text-xs text-slate-400">Ask anything about this candidate.</p>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                    <MessageSquare size={20} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Interface */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] bg-white rounded-[24px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-scale-up">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md overflow-hidden ${isOffline ? 'grayscale' : ''}`}>
                <img src="/donna_avatar.png" alt="Donna AI" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Donna AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-slate-300' : 'bg-green-500'}`}></span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{isOffline ? 'Offline' : 'Online'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOffline(!isOffline)}
                className={`text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors`}
              >
                {isOffline ? 'GO ONLINE' : 'GO OFFLINE'}
              </button>
              <button onClick={() => setIsChatOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-sm'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                  }`}>
                  <MarkdownView content={msg.text} />
                  <div className={`text-[10px] mt-1 text-right font-medium ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-300'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-4 flex space-x-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Suggestions (Offline/Empty) */}
          {(isOffline || chatHistory.length < 2) && (
            <div className="px-4 py-2 bg-white border-t border-slate-100">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onSend(undefined, q)}
                    className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-medium border border-transparent hover:border-indigo-100 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={onSend} className="relative flex items-center gap-2">
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400"
                placeholder={isOffline ? "Ask about experience..." : "Ask Donna..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`absolute right-2 p-1.5 rounded-full text-white transition-all disabled:opacity-50 disabled:scale-90 ${isOffline ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-white text-white rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all active:scale-95 group border-2 border-slate-100 overflow-hidden"
        >
          <img src="/donna_avatar.png" alt="Donna AI" className="w-full h-full object-cover" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white z-10"></span>
        </button>
      )}
    </div>
  );
};
