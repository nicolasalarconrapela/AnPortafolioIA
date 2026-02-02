import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  name: string;
  className?: string;
  logoUrl?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ name, className = "w-12 h-12", logoUrl }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);

    if (logoUrl) {
      setImgSrc(logoUrl);
      return;
    }

    if (!name) {
        setImgSrc(null);
        return;
    }
    
    // Heurística mejorada para obtener dominio
    let clean = name.trim().toLowerCase()
        // Eliminar sufijos legales comunes
        .replace(/\s+(s\.?a\.?|s\.?l\.?|inc\.?|corp\.?|llc\.?|ltd\.?|gmbh|plc|group|holding)\b/g, '')
        .trim();

    let domain = '';
    // Si el usuario ya puso algo que parece un dominio (tiene punto y no espacios)
    if (clean.includes('.') && !clean.includes(' ')) {
        domain = clean;
    } else {
        // Si no, eliminamos caracteres especiales y añadimos .com
        domain = clean.replace(/[^a-z0-9]/g, '') + '.com';
    }

    // Configuración de Logo.dev
    // Se requiere un token. Si no existe en el entorno, se intenta fallback a Clearbit para no romper la UI.
    const token = import.meta.env.VITE_LOGO_DEV_TOKEN || 'pk_PnQ8GRcqQDK4cwvIP4rxuQ';
    
    if (token) {
        setImgSrc(`https://img.logo.dev/${domain}?token=${token}`);
    } else {
        // Fallback robusto si el usuario no ha configurado el token aún
        setImgSrc(`https://logo.clearbit.com/${domain}`);
    }

  }, [name, logoUrl]);

  if (hasError || !imgSrc || !name) {
    return (
      <div className={`${className} bg-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-200`}>
        <Building2 className="w-1/2 h-1/2 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`${name} logo`}
      className={`${className} object-contain rounded-lg bg-white shadow-sm border border-slate-100`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};