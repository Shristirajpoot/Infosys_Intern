import React from 'react';

const Logo = ({ className = 'w-8 h-8', alt = 'WasteZero' }) => {
  return (
    <img src="/logo.webp" alt={alt} className={className} />
  );
};

export default Logo;
