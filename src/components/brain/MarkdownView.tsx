import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];
  
  lines.forEach((line, i) => {
    // List Item
    if (line.trim().startsWith('- ')) {
       currentList.push(
         <li key={`li-${i}`} className="ml-4 pl-1 my-1 marker:text-slate-400">
            <span className="flex flex-wrap items-center gap-1">
                {parseContent(line.replace(/^- /, ''))}
            </span>
         </li>
       );
    } else {
       // Flush list if exists
       if (currentList.length > 0) {
           elements.push(
               <ul key={`ul-${i}`} className="list-disc mb-2 space-y-1">
                   {currentList}
               </ul>
           );
           currentList = [];
       }
       
       const trimmed = line.trim();
       
       // Empty line
       if (trimmed === '') {
           elements.push(<div key={`empty-${i}`} className="h-2" />);
       } 
       // Headers
       else if (line.startsWith('## ')) {
           elements.push(<h2 key={`h2-${i}`} className="text-xl font-bold text-slate-800 mt-4 mb-2 flex items-center">{parseContent(line.replace(/^## /, ''))}</h2>);
       }
       else if (line.startsWith('### ')) {
           elements.push(<h3 key={`h3-${i}`} className="text-lg font-semibold text-slate-800 mt-3 mb-1 flex items-center">{parseContent(line.replace(/^### /, ''))}</h3>);
       }
       // Paragraph
       else {
           elements.push(
               <p key={`p-${i}`} className="mb-1 leading-relaxed text-slate-700 flex flex-wrap items-center gap-1">
                   {parseContent(line)}
               </p>
           );
       }
    }
  });

  // Flush remaining list
  if (currentList.length > 0) {
       elements.push(
           <ul key={`ul-end`} className="list-disc mb-2 space-y-1">
               {currentList}
           </ul>
       );
  }

  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
        {elements}
    </div>
  );
};

// Helper to parse bold text AND images inline
const parseContent = (text: string) => {
    // Regex explanation:
    // 1. Matches bold: **text**
    // 2. Matches images: ![alt](url)
    // The capturing groups () allow split to include the separators in the result array
    const parts = text.split(/(\*\*.*?\*\*|!\[.*?\]\(.*?\))/g);
    
    return parts.map((part, index) => {
        // Handle Images: ![Alt](url)
        const imgMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
            return (
                <img 
                    key={index} 
                    src={imgMatch[2]} 
                    alt={imgMatch[1]} 
                    className="w-5 h-5 inline-block object-contain rounded-sm bg-white mx-1 border border-slate-200"
                    onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                    }}
                />
            );
        }

        // Handle Bold: **text**
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }

        // Handle Regular text
        if (!part) return null;
        return <span key={index}>{part}</span>;
    });
};