import React, { useState } from 'react';
import { ShieldAlert, Sparkles, AlertTriangle, LifeBuoy } from 'lucide-react';

interface SafetyAssistantTriggerProps {
  onClick: () => void;
  hasActiveAlert?: boolean;
}

export const SafetyAssistantTrigger: React.FC<SafetyAssistantTriggerProps> = ({
  onClick,
  hasActiveAlert = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[800] select-none">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group flex items-center space-x-2.5 px-3.5 py-3 rounded-full transition-all duration-200 cursor-pointer shadow-xl border ${
          hasActiveAlert
            ? 'bg-[#B84A3A] hover:bg-[#94382B] text-white border-white/40 ring-4 ring-rose-500/20'
            : 'bg-[#FAF8F2] hover:bg-[#F3F0E8] text-stone-800 border-stone-300 ring-1 ring-stone-900/5'
        }`}
        title="Kaal Kuaan Safety Assistant"
        aria-label="Kaal Kuaan Safety Assistant"
      >
        {/* Understated Safety Assistant Icon */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              hasActiveAlert
                ? 'bg-white text-[#B84A3A]'
                : 'bg-stone-900 text-stone-100 group-hover:bg-[#B84A3A] group-hover:text-white'
            }`}
          >
            <ShieldAlert size={16} />
          </div>
          {hasActiveAlert && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping ring-2 ring-white" />
          )}
        </div>

        {/* Label: Always visible on desktop hover or mobile compact text */}
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5">
            <span
              className={`font-serif font-bold text-xs tracking-tight transition-all ${
                hasActiveAlert ? 'text-white' : 'text-stone-900'
              } ${isHovered ? 'inline' : 'hidden sm:inline'}`}
            >
              Kaal Kuaan Safety Assistant
            </span>
            <span
              className={`sm:hidden text-xs font-serif font-bold ${
                hasActiveAlert ? 'text-white' : 'text-stone-900'
              }`}
            >
              Safety Assistant
            </span>
            {hasActiveAlert && (
              <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase bg-amber-400 text-stone-950 rounded-full">
                ALERT
              </span>
            )}
          </div>
          <span
            className={`text-[9px] font-medium leading-none ${
              hasActiveAlert ? 'text-rose-100' : 'text-stone-500'
            } ${isHovered ? 'block' : 'hidden sm:block'}`}
          >
            Proximity & Hazard Guidance
          </span>
        </div>
      </button>
    </div>
  );
};
