import React from 'react';
import {
    Codepen,
    Terminal,
    Database,
    Server,
    Globe,
    Cpu,
    Layout,
    Smartphone,
    Cloud,
    Code2,
    Box,
    Coffee,
    FileType,
    Hash,
    Braces
} from 'lucide-react';

interface TechIconProps {
    name: string;
    className?: string;
}

export const TechIcon: React.FC<TechIconProps> = ({ name, className = "w-4 h-4" }) => {
    const normalize = (s: string) => s.toLowerCase().trim();
    const n = normalize(name);

    // Map common tech names to simpleicons standard slugs
    const getLogoUrl = (techName: string) => {
        const map: { [key: string]: string } = {
            'c#': 'csharp',
            '.net': 'dotnet',
            'c++': 'cplusplus',
            'next': 'nextdotjs',
            'next.js': 'nextdotjs',
            'node': 'nodedotjs',
            'node.js': 'nodedotjs',
            'react': 'react',
            'react.js': 'react',
            'vue': 'vuedotjs',
            'vue.js': 'vuedotjs',
            'aws': 'amazonaws',
            'angular': 'angular',
            'mongo': 'mongodb',
            'db': 'postgresql' // Generic DB fallback
        };

        const query = map[techName] || techName.replace(/\s+/g, ''); // SimpleIcons usually removes spaces
        return `https://cdn.simpleicons.org/${query}`;
    };

    return (
        <img
            src={getLogoUrl(n)}
            alt={name}
            className={`${className} object-contain opacity-80 hover:opacity-100 transition-opacity`}
            onError={(e) => {
                // Hide if icon not found
                e.currentTarget.style.display = 'none';
            }}
        />
    );
};
