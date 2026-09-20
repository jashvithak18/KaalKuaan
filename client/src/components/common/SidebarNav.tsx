import React from 'react';
import { Map, AlertCircle, CheckSquare, ClipboardList, Eye, ShieldCheck, History, BarChart3 } from 'lucide-react';

export type NavTab = 
  | 'FIELD_MAP'
  | 'DETECTIONS'
  | 'VERIFICATION'
  | 'COMPLIANCE'
  | 'PUBLIC_MAP'
  | 'AUDIT'
  | 'DRILLDOWN';

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unverifiedCount: number;
  actionRequiredCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  unverifiedCount,
  actionRequiredCount
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: any; count?: number; danger?: boolean }> = [
    { id: 'FIELD_MAP', label: 'FIELD MAP', icon: Map },
    { id: 'DETECTIONS', label: 'DETECTION QUEUE', icon: AlertCircle, count: unverifiedCount, danger: true },
    { id: 'VERIFICATION', label: 'FIELD VERIFICATION', icon: CheckSquare },
    { id: 'COMPLIANCE', label: 'COMPLIANCE DESK', icon: ClipboardList, count: actionRequiredCount },
    { id: 'PUBLIC_MAP', label: 'PUBLIC SAFETY MAP', icon: Eye },
    { id: 'DRILLDOWN', label: 'DISTRICT DRILLDOWN', icon: BarChart3 },
    { id: 'AUDIT', label: 'AUDIT JOURNAL', icon: History },
  ];

  return (
    <aside className="w-60 bg-parchment-surface border-r border-[#DDD7C7] flex flex-col justify-between flex-shrink-0 select-none z-20">
      {/* Navigation Items */}
      <div className="py-3">
        <div className="px-3 pb-2 mb-2 border-b border-[#E8E2D2]">
          <span className="text-[10px] font-mono tracking-widest text-earth uppercase font-semibold">
            OPERATIONAL CONSOLE
          </span>
        </div>

        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-wider transition-all text-left border ${
                  isActive
                    ? 'bg-parchment-dark border-carbon text-carbon font-bold shadow-subtle'
                    : 'bg-transparent border-transparent text-earth hover:text-carbon hover:bg-parchment/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-carbon' : 'text-earth'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 border ${
                      item.danger
                        ? 'bg-warning-red text-white border-deep-red'
                        : 'bg-safety-amber/20 text-carbon border-safety-amber'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Signature Motif & District Authority Footer */}
      <div className="p-3 border-t border-[#E8E2D2] bg-parchment/50">
        {/* The Signature Visual Motif */}
        <div className="mb-3">
          <div className="text-[9px] font-mono tracking-widest text-earth uppercase mb-1">
            CHAIN OF ACCOUNTABILITY
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-carbon font-semibold pb-1 border-b border-[#D5CFBF]">
            <span>LAND</span>
            <span>→</span>
            <span>DATA</span>
            <span>→</span>
            <span>HUMAN</span>
            <span>→</span>
            <span className="text-muted-green font-bold">ACTION</span>
          </div>
          <div className="h-[2px] bg-[#DDD7C7] relative overflow-hidden mt-1">
            <div className="absolute inset-y-0 w-12 bg-safety-amber animate-survey-scan"></div>
          </div>
        </div>

        <div className="text-center text-[10px] text-earth font-mono">
          <div className="font-bold text-carbon">KAAL KUAAN</div>
          <div>District Public Safety Network</div>
          <div className="text-[9px] text-[#A59B85] mt-0.5">Government of Telangana Cadastral Protocol</div>
        </div>
      </div>
    </aside>
  );
};
