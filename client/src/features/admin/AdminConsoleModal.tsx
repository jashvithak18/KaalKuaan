import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDemo } from '../../context/DemoContext';
import { 
  X, Play, RotateCcw, UserCheck, Shield, AlertTriangle, 
  Layers, CheckSquare, ClipboardList, BarChart3, History, Eye 
} from 'lucide-react';
import { Well, ComplianceRecord, StatisticsData, UserRole } from '../../types';
import { ComplianceLedger } from '../compliance/ComplianceLedger';
import { AdminDrilldownView } from '../analytics/AdminDrilldownView';
import { AuditTrailView } from '../audit/AuditTrailView';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  wells: Well[];
  compliances: ComplianceRecord[];
  stats: StatisticsData | null;
  onSelectWell: (well: Well) => void;
  onIssueNotice: (complianceId: string) => Promise<void>;
  onOpenVerification: (well: Well) => void;
}

type AdminTab = 'OVERVIEW' | 'DETECTIONS' | 'COMPLIANCE' | 'DRILLDOWN' | 'AUDIT';

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  wells,
  compliances,
  stats,
  onSelectWell,
  onIssueNotice,
  onOpenVerification
}) => {
  const { user, switchRole } = useAuth();
  const { startDemo, isDemoActive, resetAllData, isResetting } = useDemo();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-carbon/80 flex items-center justify-center p-2 sm:p-6 backdrop-blur-sm">
      <div className="bg-parchment w-full max-w-5xl h-[88vh] border-2 border-carbon shadow-panel flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-carbon text-parchment px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-parchment text-carbon flex items-center justify-center font-mono font-bold text-xs border border-carbon">
              KK
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-safety-amber uppercase font-bold">
                DISTRICT ADMINISTRATION & DEMO CONSOLE
              </div>
              <div className="font-serif text-lg font-bold">
                Nalgonda District Operational Oversight
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Controls */}
            <button
              onClick={() => {
                onClose();
                startDemo();
              }}
              disabled={isDemoActive}
              className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 transition-all border ${
                isDemoActive
                  ? 'bg-safety-amber text-carbon border-carbon'
                  : 'bg-parchment text-carbon hover:bg-parchment-dark border-carbon'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN SAFETY DEMO</span>
            </button>

            <button
              onClick={resetAllData}
              disabled={isResetting}
              className="flex items-center gap-1 text-xs font-mono text-earth hover:text-warning-red px-2.5 py-1.5 bg-carbon border border-carbon-muted hover:border-warning-red transition-colors text-parchment"
              title="Reset all database records to initial pristine state"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>RESET DEMO</span>
            </button>

            <button onClick={onClose} className="p-1 text-parchment/70 hover:text-parchment">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Switcher & Sub-Navigation */}
        <div className="bg-parchment-surface border-b border-[#DDD7C7] px-4 py-2 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 font-bold border transition-colors ${
                activeTab === 'OVERVIEW'
                  ? 'bg-carbon text-parchment border-carbon'
                  : 'bg-parchment text-earth hover:text-carbon border-transparent'
              }`}
            >
              SYSTEM OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab('DETECTIONS')}
              className={`px-3 py-1.5 font-bold border transition-colors ${
                activeTab === 'DETECTIONS'
                  ? 'bg-carbon text-parchment border-carbon'
                  : 'bg-parchment text-earth hover:text-carbon border-transparent'
              }`}
            >
              DETECTION QUEUE ({wells.filter(w => w.status === 'UNVERIFIED').length})
            </button>
            <button
              onClick={() => setActiveTab('COMPLIANCE')}
              className={`px-3 py-1.5 font-bold border transition-colors ${
                activeTab === 'COMPLIANCE'
                  ? 'bg-carbon text-parchment border-carbon'
                  : 'bg-parchment text-earth hover:text-carbon border-transparent'
              }`}
            >
              COMPLIANCE DESK ({compliances.length})
            </button>
            <button
              onClick={() => setActiveTab('DRILLDOWN')}
              className={`px-3 py-1.5 font-bold border transition-colors ${
                activeTab === 'DRILLDOWN'
                  ? 'bg-carbon text-parchment border-carbon'
                  : 'bg-parchment text-earth hover:text-carbon border-transparent'
              }`}
            >
              DISTRICT DRILLDOWN
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 font-bold border transition-colors ${
                activeTab === 'AUDIT'
                  ? 'bg-carbon text-parchment border-carbon'
                  : 'bg-parchment text-earth hover:text-carbon border-transparent'
              }`}
            >
              AUDIT JOURNAL
            </button>
          </div>

          {/* Role Selector */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <UserCheck className="w-4 h-4 text-earth" />
            <span className="text-earth font-bold">OPERATOR ROLE:</span>
            <select
              value={user?.role || 'DISTRICT_ADMIN'}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="bg-parchment border border-[#CFC7B4] py-1 px-2 text-carbon focus:outline-none font-semibold"
            >
              <option value="DISTRICT_ADMIN">District Admin (Collector)</option>
              <option value="FIELD_OFFICER">Field Officer (AFO)</option>
              <option value="PANCHAYAT">Panchayat Secretary</option>
              <option value="PUBLIC">Public Citizen</option>
            </select>
          </div>
        </div>

        {/* Tab Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-parchment">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Metric Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                <div className="p-3 bg-parchment-surface border border-[#DDD7C7]">
                  <div className="text-[10px] text-earth uppercase font-bold">HIGH RISK SITES</div>
                  <div className="text-2xl font-bold text-warning-red mt-1">{stats?.highRisk ?? 2}</div>
                  <div className="text-[10px] text-earth mt-0.5">Unprotected excavations</div>
                </div>
                <div className="p-3 bg-parchment-surface border border-[#DDD7C7]">
                  <div className="text-[10px] text-earth uppercase font-bold">AWAITING VERIFICATION</div>
                  <div className="text-2xl font-bold text-safety-amber mt-1">{stats?.unverified ?? 2}</div>
                  <div className="text-[10px] text-earth mt-0.5">Assigned to Mandal AFO</div>
                </div>
                <div className="p-3 bg-parchment-surface border border-[#DDD7C7]">
                  <div className="text-[10px] text-earth uppercase font-bold">ACTION REQUIRED</div>
                  <div className="text-2xl font-bold text-carbon mt-1">{stats?.actionRequired ?? 2}</div>
                  <div className="text-[10px] text-earth mt-0.5">Statutory notice active</div>
                </div>
                <div className="p-3 bg-parchment-surface border border-[#DDD7C7]">
                  <div className="text-[10px] text-earth uppercase font-bold">VERIFIED SAFE</div>
                  <div className="text-2xl font-bold text-muted-green mt-1">{stats?.verifiedSafe ?? 2}</div>
                  <div className="text-[10px] text-earth mt-0.5">Concrete slab sealed</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 bg-parchment-surface border border-[#DDD7C7] space-y-2 font-sans">
                <h3 className="font-serif text-base font-bold text-carbon">
                  Administrative Workflow Engine
                </h3>
                <p className="text-xs text-earth leading-relaxed">
                  This console provides deep access to statutory enforcement tools, satellite scan queues, and tamper-evident audit logs. The primary public view remains a simple field safety map for citizens and ground observers.
                </p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setActiveTab('DETECTIONS')}
                    className="px-3 py-1.5 bg-carbon text-parchment text-xs font-mono font-bold hover:bg-carbon-muted"
                  >
                    Review Anomaly Queue →
                  </button>
                  <button
                    onClick={() => setActiveTab('COMPLIANCE')}
                    className="px-3 py-1.5 bg-parchment border border-[#CFC7B4] text-carbon text-xs font-mono font-bold hover:bg-parchment-dark"
                  >
                    Open Compliance Register →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DETECTIONS' && (
            <div className="space-y-4">
              <div className="text-xs font-mono font-bold text-earth uppercase">
                REMOTE SENSING & SATELLITE ANOMALY QUEUE
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {wells.filter(w => w.status === 'UNVERIFIED').map(w => (
                  <div key={w.wellId} className="p-4 bg-parchment-surface border border-warning-red/40 shadow-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-carbon">{w.wellId}</span>
                      <span className="bg-warning-red text-white text-[10px] font-mono font-bold px-1.5 py-0.2">
                        UNVERIFIED ANOMALY
                      </span>
                    </div>
                    <div className="text-xs text-earth font-mono">
                      Plot Sy. No. <strong className="text-carbon">{w.surveyNumber}</strong> ({w.village}, {w.mandal})
                    </div>
                    <div className="text-xs text-carbon">
                      {w.evidence.voidSignature} • {w.evidence.distanceToSchool}
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectWell(w);
                        }}
                        className="flex-1 py-1.5 bg-carbon text-parchment text-xs font-mono font-bold hover:bg-carbon-muted"
                      >
                        Inspect on Map
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenVerification(w);
                        }}
                        className="flex-1 py-1.5 bg-warning-red text-white text-xs font-mono font-bold hover:bg-deep-red"
                      >
                        Dispatch Field Worker
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'COMPLIANCE' && (
            <ComplianceLedger
              records={compliances}
              onIssueNotice={onIssueNotice}
              onSelectWellById={(id) => {
                onClose();
                const found = wells.find(w => w.wellId === id);
                if (found) onSelectWell(found);
              }}
            />
          )}

          {activeTab === 'DRILLDOWN' && (
            <AdminDrilldownView
              wells={wells}
              stats={stats}
              onSelectWell={(w) => {
                onClose();
                onSelectWell(w);
              }}
              onNavigateToMap={onClose}
            />
          )}

          {activeTab === 'AUDIT' && (
            <AuditTrailView />
          )}
        </div>
      </div>
    </div>
  );
};
