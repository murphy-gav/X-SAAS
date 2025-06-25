// src/components/Loader.tsx
'use client';

import React from 'react';
import Lottie from 'lottie-react';
import animationData from '@/public/assets/icon/StratSync.json';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-115 h-55">
        <Lottie 
          animationData={animationData} 
          loop 
        />
      </div>
    </div>
  );
}