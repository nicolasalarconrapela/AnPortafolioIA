import React, { useState, useRef } from 'react';

// Tipos definidos localmente para portabilidad
type SkillType = 'Hard' | 'Soft';

interface Skill {
  id: string;
  label: string;
  type: SkillType;
}

interface SkillsStepProps {
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({ 
  onNext, 
  onBack, 
  currentStep = 3, 
  totalSteps = 5 
}) => {
  // --- Estado ---
  const [skills, setSkills] = useState<Skill[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedType, setSelectedType] = useState<SkillType>('Hard');
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      label: inputValue.trim(),
      type: selectedType,
    };

    setSkills((prev) => [...prev, newSkill]);
    setInputValue('');
    // Mantener foco para ingreso rápido (Power User UX)
    inputRef.current?.focus();
  };

  const handleRemoveSkill = (id: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  };

  const handleTypeToggle = () => {
    setSelectedType((prev) => (prev === 'Hard' ? 'Soft' : 'Hard'));
  };

  // --- Render Helpers ---
  const hasSkills = skills.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 1. HEADER COMPACTO */}
      <header className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-gray-900">Skills</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Tus superpoderes y habilidades blandas.
            </p>
          </div>
          <div className="text-xs font-medium text-gray-400 tabular-nums bg-gray-50 px-2 py-1 rounded-md">
            Paso {currentStep} de {totalSteps}
          </div>
        </div>
        
        {/* Chip de Estado - Feedback del sistema */}
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Googlito activo
          </span>
        </div>
      </header>

      {/* 2. ZONA PRINCIPAL (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        
        {/* Helper Text - Contexto inmediato */}
        <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-800 leading-5 font-medium">
            Mezcla habilidades técnicas (Hard) y sociales (Soft) para un perfil equilibrado.
          </p>
        </div>

        {/* Card Principal: Ingreso de Datos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <form onSubmit={handleAddSkill} className="p-4">
            <label htmlFor="skillInput" className="block text-sm font-semibold text-gray-700 mb-2">
              Nueva habilidad
            </label>
            
            <div className="flex gap-2 mb-3">
              <input
                ref={inputRef}
                id="skillInput"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ej. React, Liderazgo..."
                className="flex-1 min-w-0 block w-full px-3 py-3 rounded-lg border border-gray-300 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                autoComplete="off"
              />
              
              {/* Toggle Tipo (Hard/Soft) - Switch visual simple */}
              <button
                type="button"
                onClick={handleTypeToggle}
                className={`px-3 py-2 rounded-lg border text-sm font-bold transition-colors w-24 shrink-0 flex items-center justify-center shadow-sm ${
                  selectedType === 'Hard' 
                    ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' 
                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                }`}
                aria-label={`Tipo de habilidad: ${selectedType}. Toca para cambiar.`}
              >
                {selectedType}
              </button>
            </div>

            {/* Acción Primaria Local: Añadir */}
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Añadir skill
            </button>
          </form>
        </div>

        {/* Lista de Skills / Empty State */}
        <section aria-label="Lista de habilidades añadidas">
          {!hasSkills ? (
            <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-semibold">Tu lista está vacía</p>
              <p className="text-xs text-gray-500 mt-1">Añade al menos 3 habilidades clave para continuar.</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                Tus Skills ({skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div 
                    key={skill.id}
                    className={`inline-flex items-center pl-3 pr-2 py-1.5 rounded-full text-sm border transition-all shadow-sm ${
                      skill.type === 'Hard'
                        ? 'bg-white border-gray-200 text-gray-800' 
                        : 'bg-green-50 border-green-200 text-green-800'
                    }`}
                  >
                    <span className="mr-2 font-medium">{skill.label}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="p-1 hover:bg-black/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
                      aria-label={`Eliminar ${skill.label}`}
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 4. FOOTER FIJO (Sticky) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 safe-pb z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-full border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
          >
            Anterior
          </button>
          <button
            onClick={onNext}
            disabled={!hasSkills}
            className="flex-[2] py-3 px-4 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-md touch-manipulation"
          >
            Siguiente
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SkillsStep;