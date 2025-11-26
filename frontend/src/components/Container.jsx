import React from 'react';

export default function Container({ children, className = '', maxWidth = '7xl', padding = 'py-8' }) {
  return (
    <div className={`max-w-${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${padding} ${className}`}>
      {children}
    </div>
  );
}