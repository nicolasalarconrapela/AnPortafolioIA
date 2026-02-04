
import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button';

export const SectionHeader = ({
    title,
    description,
    icon,
    aiName,
    onGretchenClick
}: {
    title: string,
    description: string,
    icon: React.ReactElement,
    aiName: string,
    onGretchenClick: () => void
}) => (
    <div className="mb-8 pb-6 border-b border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary-container text-secondary-onContainer rounded-xl shrink-0 shadow-sm">
                    {React.cloneElement(icon, { className: "w-6 h-6" } as any)}
                </div>
                <div>
                    <h2 className="text-2xl font-display font-medium text-[var(--md-sys-color-on-background)]">{title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <div className="w-4 h-4 rounded-full overflow-hidden ring-1 ring-outline/20">
                            <img src="/googlito.jpg" alt="Googlito" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-medium text-outline uppercase tracking-wider">{aiName} Active</span>
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                onClick={onGretchenClick}
                className="text-error hover:bg-error/10 hover:text-error px-4 gap-2 flex items-center group"
            >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-error/30 shadow-sm transition-transform group-hover:scale-110">
                    <img src="/gretchen.jpg" alt="Gretchen" className="w-full h-full object-cover" />
                </div>
                <span>Gretchen</span>
            </Button>
        </div>
        <p className="mt-4 text-outline max-w-3xl leading-relaxed text-sm md:text-base">{description}</p>
    </div>
);
