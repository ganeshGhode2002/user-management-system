import React from 'react';

export default function Container({ children, className='' }) {
  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 ${className}`}>
      {children}
    </div>
  );
}
