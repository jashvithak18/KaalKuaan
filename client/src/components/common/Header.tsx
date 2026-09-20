import React from 'react';
import { Shield, Settings, AlertCircle, Eye, MapPin, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenReportModal: () => void;
  onOpenAdminModal: () => void;
  publicView: boolean;
  onTogglePublicView: (enabled: boolean) => void;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenReportModal,
  onOpenAdminModal,
  publicView,
  onTogglePublicView,
  selectedDistrict,
  onSelectDistrict
}) => {
  return (
    <header className="bg-parchment-surface border-b border-[#DDD7C7] px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-subtle select-none">
      {/* Left: Grounded Branding */}
      <div className="flex items-center gap-3">
        {/* Logo Mark */}
        <img
          src="/logo.jpg"
          alt="Kaal Kuaan Logo"
          className="w-8 h-8 rounded-sm object-cover border border-carbon flex-shrink-0"
        />

        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg md:text-xl tracking-tight font-bold text-carbon">
              KAAL KUAAN
            </span>
            <span className="text-[10px] font-mono tracking-widest text-earth uppercase px-1.5 py-0.2 bg-parchment-dark border border-[#D5CFBF]">
              DANGER BENEATH EVERY STEP
            </span>
          </div>
          <div className="text-[11px] text-earth font-sans block">
            Danger Beneath Every Step
          </div>
        </div>
      </div>

      {/* Center: District Selector */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-parchment border border-[#DDD7C7] font-mono text-xs">
        <MapPin className="w-3.5 h-3.5 text-earth flex-shrink-0" />
        <span className="text-earth text-[11px]">LOCATION:</span>
        <select
          value={selectedDistrict}
          onChange={(e) => onSelectDistrict(e.target.value)}
          className="bg-transparent font-bold text-carbon focus:outline-none cursor-pointer text-xs"
        >
          <option value="Nalgonda">Nalgonda District (Pilot Grid)</option>
          <option value="Vemulapally">Vemulapally Mandal</option>
          <option value="Miryalaguda">Miryalaguda Mandal</option>
          <option value="Chityal">Chityal Mandal</option>
        </select>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Public Safety Map Toggle */}
        <button
          onClick={() => onTogglePublicView(!publicView)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold transition-all border ${
            publicView
              ? 'bg-carbon text-parchment border-carbon shadow-sm'
              : 'bg-parchment text-carbon hover:bg-parchment-dark border-[#D5CFBF]'
          }`}
          title="Toggle Public Safety Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{publicView ? 'PUBLIC RADAR ACTIVE' : 'PUBLIC SAFETY MAP'}</span>
        </button>

        {/* Primary CTA: Report an Open Well */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-2 bg-warning-red hover:bg-deep-red text-white transition-colors border border-deep-red shadow-subtle uppercase tracking-wider"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>REPORT AN OPEN WELL</span>
        </button>

        {/* Subtle Admin & Demo Console Trigger */}
        <button
          onClick={onOpenAdminModal}
          className="p-2 text-earth hover:text-carbon hover:bg-parchment border border-[#D5CFBF] transition-colors"
          title="Open Administrative & Demo Console"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
