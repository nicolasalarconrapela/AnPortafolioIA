import React from 'react';

export const AvatarScanner: React.FC = () => {
  return (
    <div className="w-full max-w-[320px] aspect-[3/4] bg-surface-variant dark:bg-surface-darkVariant rounded-[24px] overflow-hidden shadow-elevation-1 relative group transition-shadow hover:shadow-elevation-2">
      <img
        src="https://img.freepik.com/free-photo/3d-rendering-boy-wearing-cap-with-letter-r_1142-40526.jpg?t=st=1710345000~exp=1710348600~hmac=xyz"
        alt="AI Assistant Avatar"
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white font-medium text-sm tracking-wide">AI Assistant Ready</p>
      </div> */}
    </div>
  );
};
