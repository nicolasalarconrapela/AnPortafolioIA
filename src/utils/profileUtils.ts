import { CVProfile } from "../types_brain";

export const cleanProfile = (p: CVProfile): CVProfile => {
  const isDirty = (s: string) => {
    if (!s || typeof s !== "string") return true;
    const trimmed = s.trim();
    if (
      trimmed === "" ||
      trimmed.includes("[ACCIÓN REQUERIDA") ||
      trimmed.includes("[FALTA:") ||
      trimmed.includes("[COMPLETAR:") ||
      trimmed.includes("[INSERTAR")
    )
      return true;
    return false;
  };
  return {
    ...p,
    summary: isDirty(p.summary) ? "" : p.summary,
    experience: p.experience
      .filter((e) => !isDirty(e.role) && !isDirty(e.company))
      .map((e) => ({
        ...e,
        description: isDirty(e.description) ? "" : e.description,
      })),
    education: p.education.filter((e) => !isDirty(e.institution)),
    skills: p.skills.filter((s) => !isDirty(s)),
    techStack: {
      languages: p.techStack.languages.filter((s) => !isDirty(s)),
      ides: p.techStack.ides.filter((s) => !isDirty(s)),
      frameworks: p.techStack.frameworks.filter((s) => !isDirty(s)),
      tools: p.techStack.tools.filter((s) => !isDirty(s)),
    },
    projects: p.projects
      .filter((pr) => !isDirty(pr.name))
      .map((pr) => ({
        ...pr,
        description: isDirty(pr.description) ? "" : pr.description,
        technologies: isDirty(pr.technologies) ? "" : pr.technologies,
        link: isDirty(pr.link || "") ? undefined : pr.link,
      })),
    volunteering: p.volunteering
      .filter((v) => !isDirty(v.company))
      .map((v) => ({
        ...v,
        description: isDirty(v.description) ? "" : v.description,
      })),
    awards: p.awards.filter((a) => !isDirty(a)),
    languages: p.languages.filter((l) => !isDirty(l.language)),
    hobbies: p.hobbies.filter((h) => !isDirty(h)),
  };
};
