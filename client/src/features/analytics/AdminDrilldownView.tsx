import React, { useState } from 'react';
import { Well, StatisticsData } from '../../types';
import { ChevronRight, ShieldAlert, CheckCircle, ArrowLeft, BarChart2 } from 'lucide-react';

interface AdminDrilldownViewProps {
  wells: Well[];
  stats: StatisticsData | null;
  onSelectWell: (well: Well) => void;
  onNavigateToMap: () => void;
}

export const AdminDrilldownView: React.FC<AdminDrilldownViewProps> = ({
  wells,
  stats,
  onSelectWell,
  onNavigateToMap
}) => {
  const [drillLevel, setDrillLevel] = useState<'DISTRICT' | 'MANDAL' | 'VILLAGE'>('DISTRICT');
  const [selectedMandal, setSelectedMandal] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);

  // Grouping by Mandal
  const mandals = [
    { name: 'Vemulapally', open: 2, pending: 1, safe: 2, highRiskRatio: 'HIGH RISK' },
    { name: 'Miryalaguda', open: 1, pending: 0, safe: 2, highRiskRatio: 'MODERATE' },
    { name: 'Chityal', open: 1, pending: 0, safe: 0, highRiskRatio: 'WATCHLIST' }
  ];

  // Grouping by Village for selected Mandal
  const getVillagesForMandal = (mandalName: string) => {
    const villages = Array.from(new Set(wells.filter(w => w.mandal === mandalName).map(w => w.village)));
    return villages.map(v => {
      const vWells = wells.filter(w => w.mandal === mandalName && w.village === v);
      const openCount = vWells.filter(w => w.status !== 'VERIFIED_SAFE').length;
      const safeCount = vWells.filter(w => w.status === 'VERIFIED_SAFE').length;
      return {
        name: v,
        wells: vWells,
        openCount,
        safeCount
      };
    });
  };

  return (
    <div className="flex-1 bg-parchment p-4 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="border border-[#D8D2C2] bg-parchment-surface p-4 shadow-subtle mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E8E2D2] pb-3">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-earth uppercase font-bold flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-carbon" />
              <span>GEOGRAPHIC AGGREGATION HIERARCHY</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-carbon">
              District Risk Drill-down Console
            </h1>
            <p className="text-xs text-earth mt-0.5">
              Multi-tiered administrative aggregation: District → Mandal → Village → Field Parcel → Borewell.
            </p>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 font-mono text-xs bg-parchment px-3 py-1.5 border border-[#DDD7C7]">
            <button
              onClick={() => { setDrillLevel('DISTRICT'); setSelectedMandal(null); setSelectedVillage(null); }}
              className={`hover:underline ${drillLevel === 'DISTRICT' ? 'font-bold text-carbon' : 'text-earth'}`}
            >
              Nalgonda (District)
            </button>
            {selectedMandal && (
              <>
                <span>/</span>
                <button
                  onClick={() => { setDrillLevel('MANDAL'); setSelectedVillage(null); }}
                  className={`hover:underline ${drillLevel === 'MANDAL' ? 'font-bold text-carbon' : 'text-earth'}`}
                >
                  {selectedMandal} (Mandal)
                </button>
              </>
            )}
            {selectedVillage && (
              <>
                <span>/</span>
                <span className="font-bold text-carbon">{selectedVillage} (Village)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Level 1: District Overview */}
      {drillLevel === 'DISTRICT' && (
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-earth uppercase">
            SELECT MANDAL TO DRILL DOWN
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mandals.map((m) => (
              <div
                key={m.name}
                onClick={() => { setSelectedMandal(m.name); setDrillLevel('MANDAL'); }}
                className="p-4 bg-parchment-surface border-2 border-[#DDD7C7] hover:border-carbon cursor-pointer transition-all shadow-subtle hover:shadow-card group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D2]">
                  <h3 className="font-serif text-lg font-bold text-carbon group-hover:text-warning-red transition-colors">
                    {m.name}
                  </h3>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 border ${
                    m.open > 1 ? 'bg-warning-red-light text-warning-red border-warning-red' : 'bg-parchment text-earth border-[#CFC7B4]'
                  }`}>
                    {m.highRiskRatio}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center font-mono">
                  <div className="p-2 bg-parchment border border-[#DDD7C7]">
                    <div className="text-xs text-earth text-[10px]">OPEN</div>
                    <div className="text-base font-bold text-warning-red">{m.open}</div>
                  </div>
                  <div className="p-2 bg-parchment border border-[#DDD7C7]">
                    <div className="text-xs text-earth text-[10px]">PENDING</div>
                    <div className="text-base font-bold text-safety-amber">{m.pending}</div>
                  </div>
                  <div className="p-2 bg-parchment border border-[#DDD7C7]">
                    <div className="text-xs text-earth text-[10px]">SAFE</div>
                    <div className="text-base font-bold text-muted-green">{m.safe}</div>
                  </div>
                </div>

                <div className="mt-3 text-right text-[11px] font-mono text-carbon font-semibold group-hover:translate-x-1 transition-transform flex items-center justify-end gap-1">
                  <span>Drill into Villages</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level 2: Mandal Overview */}
      {drillLevel === 'MANDAL' && selectedMandal && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setDrillLevel('DISTRICT'); setSelectedMandal(null); }}
              className="text-xs font-mono text-earth hover:text-carbon flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to District</span>
            </button>
            <div className="text-xs font-mono font-bold text-earth uppercase">
              VILLAGES IN {selectedMandal.toUpperCase()} MANDAL
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getVillagesForMandal(selectedMandal).map((v) => (
              <div
                key={v.name}
                onClick={() => { setSelectedVillage(v.name); setDrillLevel('VILLAGE'); }}
                className="p-4 bg-parchment-surface border border-[#DDD7C7] hover:border-carbon cursor-pointer transition-all shadow-subtle group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D2]">
                  <h4 className="font-serif text-base font-bold text-carbon group-hover:text-warning-red">
                    {v.name} Gram Panchayat
                  </h4>
                  <span className="font-mono text-xs text-earth">
                    {v.wells.length} Plot(s) Monitored
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-warning-red font-bold">{v.openCount} Unresolved</span>
                    <span>•</span>
                    <span className="text-muted-green font-bold">{v.safeCount} Certified Safe</span>
                  </div>
                  <div className="text-carbon font-bold flex items-center gap-1">
                    <span>Inspect Plots</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level 3: Village Borewell Plot Detail */}
      {drillLevel === 'VILLAGE' && selectedVillage && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setDrillLevel('MANDAL'); setSelectedVillage(null); }}
              className="text-xs font-mono text-earth hover:text-carbon flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {selectedMandal}</span>
            </button>
            <div className="text-xs font-mono font-bold text-earth uppercase">
              REGISTERED SITES IN {selectedVillage.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {wells
              .filter(w => w.village === selectedVillage)
              .map((w) => (
                <div
                  key={w.wellId}
                  className="p-3.5 bg-parchment-surface border border-[#DDD7C7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-carbon transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-carbon">{w.wellId}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 font-bold border ${
                        w.status === 'VERIFIED_SAFE'
                          ? 'bg-muted-green/15 text-muted-green border-muted-green/40'
                          : 'bg-warning-red-light text-warning-red border-warning-red'
                      }`}>
                        {w.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-earth mt-0.5">
                      Plot Sy. No. <strong className="text-carbon font-mono">{w.surveyNumber}</strong> • {w.evidence.voidSignature}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectWell(w);
                      onNavigateToMap();
                    }}
                    className="px-3 py-1.5 bg-carbon text-parchment text-xs font-mono font-bold hover:bg-carbon-muted transition-colors flex-shrink-0"
                  >
                    View on Cadastral Map →
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
