import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#020408]">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-900/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-[-50%] right-[-50%] h-[100vh] bg-grid-pattern perspective-floor opacity-30 origin-bottom"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 blur-[100px] rounded-full"></div>
      
      {/* Dynamic particles could be added here */}
    </div>
  );
};