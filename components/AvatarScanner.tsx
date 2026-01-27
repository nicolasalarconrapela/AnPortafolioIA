import React from 'react';

export const AvatarScanner: React.FC = () => {
  return (
    <div className="relative z-10 w-full max-w-[320px] md:max-w-[380px] aspect-[4/5] flex items-end justify-center animate-float mt-[-60px]">
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl opacity-80">
        <div className="absolute left-[-20%] right-[-20%] h-[2px] bg-cyan-400 laser-line animate-scan z-30"></div>
        <div className="absolute left-0 right-0 top-0 h-full scanner-trail animate-scan z-20 origin-top opacity-40"></div>
      </div>
      
      <img 
        alt="Professional AI Avatar" 
        className="w-full h-full object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)] avatar-mask filter brightness-105 contrast-110" 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuv0QyRaPOfIybWdvHNlvkw-J2bW8asA6dXfBKO8LCgbCBK0VM-nXGWLvwv8RvaFfy2vmkt-7qKC_Ofrwxpl2luDUVDVORQSJq3kjU_bsmNyOFLGJd7TEP2-nXU7pD52I-izW6Ii268Fv40bi6LSAYyGf8uCXqpS013DYW4tgVBlGle4uCSvDt_Z8TZFFXQjmYqaB6rKqyPVo9h0XHXvZQKhYMXdSs9RvMXJ5lyLFRPt-i7Xft07tAiE82nR41WSJGHzZ8lcDB9Qs"
      />
      
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-0">
        <div className="w-[130%] h-[130%] border border-cyan-500/30 rounded-full absolute top-[10%] border-dashed animate-spin-slow"></div>
        <div className="w-[110%] h-[110%] border border-indigo-500/20 rounded-full absolute top-[15%] animate-spin-reverse-slow"></div>
      </div>
    </div>
  );
};