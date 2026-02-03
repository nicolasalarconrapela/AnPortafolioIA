
import React, { useState } from 'react';
import { Link, Globe, Mail } from 'lucide-react';

interface SocialIconProps {
    network: string;
    className?: string;
}

export const SocialIcon: React.FC<SocialIconProps> = ({ network, className = "w-5 h-5" }) => {
    const [error, setError] = useState(false);
    
    // Heuristic to convert network name to domain
    const getDomain = (name: string) => {
        const lower = name.toLowerCase().trim();
        
        // Edge cases
        if (lower === 'x' || lower === 'twitter') return 'twitter.com';
        if (lower.includes('academia.edu')) return 'academia.edu';
        if (lower.includes('stackoverflow')) return 'stackoverflow.com';
        
        // Basic cleanup
        return lower.replace(/[^a-z0-9]/g, '') + '.com';
    };

    const lowerNetwork = network.toLowerCase();

    // Structural fallbacks before attempting image load
    if (lowerNetwork.includes('web') || lowerNetwork.includes('portfolio') || lowerNetwork.includes('site')) return <Globe className={className} />;
    if (lowerNetwork.includes('mail') || lowerNetwork.includes('email')) return <Mail className={className} />;

    if (error) {
        return <Link className={className} />;
    }

    const domain = getDomain(network);
    // Using the same token strategy as CompanyLogo
    const token = 'pk_PnQ8GRcqQDK4cwvIP4rxuQ'; 
    const logoUrl = `https://img.logo.dev/${domain}?token=${token}`;

    return (
        <img 
            src={logoUrl} 
            alt={network} 
            className={`${className} object-contain rounded-sm`}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
};
