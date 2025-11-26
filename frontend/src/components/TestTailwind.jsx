// src/components/TailwindTest.jsx
import React from 'react';

export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4 text-xl font-bold">
          🔴 If this is RED, Tailwind is NOT working
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg mb-4 text-xl font-bold">
          🟢 If this is GREEN, Tailwind IS working
        </div>
        <div className="glass p-6 rounded-xl text-white">
          🪞 If this has glass effect, custom CSS works!
        </div>
      </div>
    </div>
  );
}