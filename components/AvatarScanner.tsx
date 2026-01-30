import React from 'react';

export const AvatarScanner: React.FC = () => {
  return (
    <div className="relative z-10 w-full max-w-[350px] md:max-w-[450px] aspect-[4/5] flex items-end justify-center animate-float mt-[-40px] perspective-1000">
      
      {/* Holographic Container */}
      <div className="relative w-full h-full flex items-end justify-center group">
        
        {/* Scanning Effect Overlay - Defines the bounds */}
        <div className="absolute inset-x-4 top-4 bottom-0 z-30 pointer-events-none overflow-hidden rounded-t-[100px] rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute left-[-20%] right-[-20%] h-[2px] bg-cyan-400 laser-line animate-scan z-30 shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
          <div className="absolute left-0 right-0 top-0 h-full scanner-trail animate-scan z-20 origin-top opacity-30 mix-blend-screen"></div>
        </div>
        
        {/* 3D Avatar Image */}
        {/* Using a 3D Render style image */}
        <div className="relative z-20 w-[90%] h-[90%] transition-transform duration-500 group-hover:scale-[1.02]">
            <img 
              alt="AI 3D Avatar" 
              className="w-full h-full object-cover object-top mask-linear-fade filter brightness-110 contrast-115 drop-shadow-[0_0_30px_rgba(34,211,238,0.15)]" 
              src="https://img.freepik.com/free-photo/3d-rendering-boy-wearing-cap-with-letter-r_1142-40526.jpg?t=st=1710345000~exp=1710348600~hmac=xyz" // Fallback generic 3D
              srcSet="https://img.freepik.com/free-psd/3d-render-avatar-character_23-2150611765.jpg 1x"
            />
            
            {/* Hologram Noise/Glitch effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-cyan-500/20 mix-blend-overlay opacity-50 pointer-events-none mask-linear-fade"></div>
        </div>

        {/* 3D Platform / Base */}
        <div className="absolute bottom-[5%] w-[80%] h-[60px] z-10 pointer-events-none">
            {/* Rotating Rings */}
            <div className="absolute inset-0 border-[1px] border-cyan-500/30 rounded-[100%] transform rotate-x-70 animate-spin-slow"></div>
            <div className="absolute inset-2 border-[1px] border-indigo-500/30 rounded-[100%] transform rotate-x-70 animate-spin-reverse-slow"></div>
            <div className="absolute inset-[-10px] border-[1px] border-dashed border-cyan-400/20 rounded-[100%] transform rotate-x-70 animate-spin-slow" style={{ animationDuration: '20s' }}></div>
            
            {/* Central Glow */}
            <div className="absolute inset-0 bg-radial-glow opacity-60 transform scale-y-50"></div>
            
            {/* Rising Particles (Simulated) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-1 h-20 bg-gradient-to-t from-cyan-400/0 via-cyan-400/50 to-transparent blur-md"></div>
        </div>
      </div>
    </div>
  );
};