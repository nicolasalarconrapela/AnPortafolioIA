import React from 'react';

export const EmptyState = ({ text }: { text: string }) => (
    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 italic text-sm">
        {text}
    </div>
);
