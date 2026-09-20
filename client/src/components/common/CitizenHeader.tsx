import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { MapPin, Navigation, Shield, User, FileText, AlertCircle, Eye, LogIn, ChevronDown } from 'lucide-react';

export type ActiveNavView = 'LANDING' | 'PERMISSION' | 'SCAN' | 'MAP' | 'REPORTS' | 'PROFILE';

interface CitizenHeaderProps {
  currentView: ActiveNavView;
  onNavigate: (view: ActiveNavView) => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
}

export const CitizenHeader: React.FC<CitizenHeaderProps> = ({
  currentView,
  onNavigate,
  onOpenReportModal,
  onOpenAuthModal
}) => {
  const { user, isAuthenticated } = useAuth();
  const { locationName, userLocation } = useLocation();

  return (
    <header className="bg-stone-50 border-b border-stone-300 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-[600] shadow-2xs select-none">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavigate('LANDING')}>
        <img
          src="/logo.jpg"
          alt="Kaal Kuaan Logo"
          className="w-9 h-9 rounded-lg object-cover shadow-sm ring-1 ring-stone-900/20 group-hover:scale-105 transition-transform"
        />
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight leading-none">
              KAAL KUAAN
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700 rounded">
              Danger Beneath Every Step
            </span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium hidden md:block">
            Telangana Public Borewell Safety
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
        <button
          onClick={() => onNavigate('LANDING')}
          className={`px-3 py-1.5 rounded-lg transition ${
            currentView === 'LANDING'
              ? 'bg-stone-200 text-stone-900'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => onNavigate('SCAN')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
            currentView === 'SCAN'
              ? 'bg-stone-200 text-stone-900 font-bold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Navigation size={13} className="text-terracotta-600" />
          <span>Safety Scan</span>
        </button>

        <button
          onClick={() => onNavigate('MAP')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
            currentView === 'MAP'
              ? 'bg-stone-200 text-stone-900 font-bold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Eye size={13} />
          <span>Hazard Map</span>
        </button>

        {isAuthenticated && (
          <button
            onClick={() => onNavigate('REPORTS')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
              currentView === 'REPORTS'
                ? 'bg-stone-200 text-stone-900 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileText size={13} />
            <span>My Reports</span>
          </button>
        )}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Report Button */}
        <button
          onClick={onOpenReportModal}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white font-bold text-xs sm:text-sm rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-1.5 cursor-pointer ring-1 ring-white/30 shrink-0"
          title="Report an uncovered or unsafe borewell"
        >
          <AlertCircle size={15} className="text-white shrink-0" />
          <span className="hidden md:inline whitespace-nowrap">Report Unsafe Borewell</span>
          <span className="md:hidden whitespace-nowrap">Report Borewell</span>
        </button>

        {/* User Auth or Profile Button */}
        {isAuthenticated && user ? (
          <button
            onClick={() => onNavigate('PROFILE')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs transition"
          >
            <div className="w-5 h-5 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold text-[10px]">
              {user.name.charAt(0)}
            </div>
            <span className="font-semibold text-stone-800 hidden sm:inline truncate max-w-[100px]">
              {user.name.split(' ')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-xs rounded-lg transition flex items-center space-x-1"
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
