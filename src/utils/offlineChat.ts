import { CVProfile } from "../types_brain";

export const getOfflineResponse = (
  query: string,
  profile: CVProfile | null
): string => {
  if (!profile) return "No tengo acceso al perfil en este momento.";

  const q = query.toLowerCase();

  // Experience
  if (
    q.includes("experiencia") ||
    q.includes("trabajo") ||
    q.includes("laboral") ||
    q.includes("trayectoria")
  ) {
    if (profile.experience.length === 0)
      return "Este perfil no detalla experiencia laboral.";
    const recent = profile.experience[0];
    return `Mi experiencia más reciente fue como **${recent.role}** en **${recent.company}**. \n\nEn total cuento con ${profile.experience.length} experiencias registradas. Si quieres saber más detalles de alguna en particular, pregúntame.`;
  }

  // Skills
  if (
    q.includes("habilidad") ||
    q.includes("skill") ||
    q.includes("sabes fazer") ||
    q.includes("tecnología") ||
    q.includes("stack")
  ) {
    const skills = profile.skills.slice(0, 5).join(", ");
    const techs = [
      ...profile.techStack.languages,
      ...profile.techStack.frameworks,
    ]
      .slice(0, 5)
      .join(", ");
    return `Mis habilidades principales incluyen: **${skills}**. \n\nEn cuanto a tecnologías, trabajo con: **${techs}**, entre otras.`;
  }

  // Education
  if (
    q.includes("estudio") ||
    q.includes("educación") ||
    q.includes("formación") ||
    q.includes("universidad") ||
    q.includes("título")
  ) {
    if (profile.education.length === 0)
      return "No hay información de educación formal registrada.";
    const edu = profile.education[0];
    return `Estudié **${edu.title}** en **${edu.institution}** (${edu.period}).`;
  }

  // Projects
  if (q.includes("proyecto") || q.includes("portafolio")) {
    if (profile.projects.length === 0)
      return "No tengo proyectos destacados en este perfil.";
    const proj = profile.projects[0];
    return `Uno de mis proyectos destacados es **${proj.name}**: ${proj.description}. \n\nPuedes ver más en la pestaña de Proyectos.`;
  }

  // Summary / Who are you
  if (
    q.includes("quién eres") ||
    q.includes("resumen") ||
    q.includes("cuéntame") ||
    q.includes("presentate") ||
    q.includes("hola")
  ) {
    return (
      profile.summary ||
      `Hola, soy un asistente virtual basado en el perfil de ${
        profile.experience[0]?.role || "este candidato"
      }. ¿En qué puedo ayudarte?`
    );
  }

  // Contact
  if (
    q.includes("contacto") ||
    q.includes("email") ||
    q.includes("correo") ||
    q.includes("teléfono") ||
    q.includes("llamar")
  ) {
    return "Para contactar, por favor revisa la información de contacto en la cabecera del CV (si está disponible) o utiliza los canales oficiales.";
  }

  return "Lo siento, en modo offline tengo respuestas limitadas. Intenta preguntar sobre mi experiencia, educación, habilidades o proyectos.";
};

export const PREDEFINED_QUESTIONS = [
  "¿Cuéntame sobre tu experiencia",
  "¿Cuáles son tus habilidades?",
  "¿Qué proyectos has realizado?",
  "¿Cuál es tu formación?",
  "Dame un resumen del perfil",
];
