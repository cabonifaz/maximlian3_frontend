import React from "react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-brand-white z-[9999]">
      <div className="relative">
        {/* Outer pulse */}
        <div className="absolute inset-0 rounded-full bg-brand-wine/10 animate-ping scale-150" />

        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-gray-100 border-t-brand-wine rounded-full animate-spin shadow-lg" />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-brand-wine rounded-full shadow-[0_0_10px_rgba(114,47,55,0.5)]" />
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold text-brand-black tracking-tight">
          Cargando Maximilian
        </h2>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-brand-wine rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 bg-brand-wine rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 bg-brand-wine rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
