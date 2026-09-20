import React, { useState } from 'react';
import { ComplianceRecord, Well } from '../../types';
import { FileText, AlertTriangle, CheckCircle, Clock, ShieldAlert, Send } from 'lucide-react';

interface ComplianceLedgerProps {
  records: ComplianceRecord[];
  onIssueNotice: (complianceId: string) => Promise<void>;
  onSelectWellById: (wellId: string) => void;
}

export const ComplianceLedger: React.FC<ComplianceLedgerProps> = ({
  records,
  onIssueNotice,
  onSelectWellById
}) => {
  const [filterMandal, setFilterMandal] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredRecords = records.filter((r) => {
    if (filterMandal !== 'ALL' && r.mandal !== filterMandal) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex-1 bg-parchment p-4 md:p-6 overflow-y-auto">
      {/* Institutional Paper Register Header */}
      <div className="border border-[#D8D2C2] bg-parchment-surface p-4 shadow-subtle mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E8E2D2] pb-3">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-earth uppercase font-bold">
              GOVERNMENT OF TELANGANA — WATER, LAND AND TREES ACT (WALTA)
            </div>
            <h1 className="font-serif text-2xl font-bold text-carbon">
              Statutory Borewell Capping Inspection Register
            </h1>
            <p className="text-xs text-earth mt-0.5">
              Legal enforcement desk for abandoned, unregistered, and hazardous agricultural excavations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="paper-stamp">
              PANCHAYAT ENFORCEMENT
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-earth">MANDAL:</span>
            <select
              value={filterMandal}
              onChange={(e) => setFilterMandal(e.target.value)}
              className="bg-parchment border border-[#CFC7B4] py-1 px-2 text-carbon focus:outline-none"
            >
              <option value="ALL">All Mandals (Nalgonda District)</option>
              <option value="Vemulapally">Vemulapally</option>
              <option value="Miryalaguda">Miryalaguda</option>
              <option value="Chityal">Chityal</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-earth">STATUS:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-parchment border border-[#CFC7B4] py-1 px-2 text-carbon focus:outline-none"
            >
              <option value="ALL">All Statutory Stages</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="NOTICE_SERVED">Notice Served</option>
              <option value="OVERDUE">Overdue / Penalty Enforced</option>
              <option value="VERIFIED_SAFE">Verified Safe / Capped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inspection Ledger Table (Physical Paper Register Style) */}
      <div className="border border-[#D8D2C2] bg-parchment-surface shadow-subtle overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-parchment-dark border-b border-[#D8D2C2] font-mono text-[11px] text-earth uppercase font-bold">
              <th className="p-3 border-r border-[#D8D2C2]">Entry No.</th>
              <th className="p-3 border-r border-[#D8D2C2]">Well ID / Parcel</th>
              <th className="p-3 border-r border-[#D8D2C2]">Landowner / Location</th>
              <th className="p-3 border-r border-[#D8D2C2]">Statutory Deadline</th>
              <th className="p-3 border-r border-[#D8D2C2]">Enforcement Status</th>
              <th className="p-3 border-r border-[#D8D2C2]">Assigned Authority</th>
              <th className="p-3">Official Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E2D2]">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-earth font-mono">
                  No statutory compliance records match the active criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record, index) => {
                const isOverdue = record.status === 'OVERDUE';
                const isSafe = record.status === 'VERIFIED_SAFE';
                const isActionRequired = record.status === 'ACTION_REQUIRED';

                return (
                  <tr key={record.complianceId} className="hover:bg-parchment/60 transition-colors font-mono">
                    <td className="p-3 border-r border-[#D8D2C2] text-carbon font-bold">
                      {record.complianceId}
                    </td>

                    <td className="p-3 border-r border-[#D8D2C2]">
                      <button
                        onClick={() => onSelectWellById(record.wellId)}
                        className="text-carbon hover:text-warning-red font-bold underline text-left"
                      >
                        {record.wellId}
                      </button>
                      <div className="text-[10px] text-earth">Sy. {record.surveyNumber}</div>
                    </td>

                    <td className="p-3 border-r border-[#D8D2C2] font-sans">
                      <div className="font-semibold text-carbon">{record.landownerName}</div>
                      <div className="text-[11px] text-earth">
                        {record.village}, {record.mandal} Mandal
                      </div>
                    </td>

                    <td className="p-3 border-r border-[#D8D2C2]">
                      <div className={`font-bold ${isOverdue ? 'text-warning-red' : 'text-carbon'}`}>
                        {record.statutoryDeadline}
                      </div>
                      <div className="text-[10px] text-earth">Flagged: {record.flaggedDate}</div>
                    </td>

                    <td className="p-3 border-r border-[#D8D2C2]">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold inline-block ${
                        isSafe
                          ? 'bg-muted-green/15 text-muted-green border-muted-green/40'
                          : isOverdue
                          ? 'bg-warning-red-light text-warning-red border-warning-red font-black'
                          : isActionRequired
                          ? 'bg-safety-amber-light text-safety-amber border-safety-amber'
                          : 'bg-parchment text-carbon border-[#CFC7B4]'
                      }`}>
                        {record.status.replace(/_/g, ' ')}
                      </span>

                      {record.penaltyApplicable && (
                        <div className="text-[10px] text-warning-red font-bold mt-0.5">
                          ₹{record.penaltyAmount} Penalty Levied
                        </div>
                      )}
                    </td>

                    <td className="p-3 border-r border-[#D8D2C2] text-earth">
                      {record.assignedOfficer}
                    </td>

                    <td className="p-3">
                      {isActionRequired ? (
                        <button
                          onClick={() => onIssueNotice(record.complianceId)}
                          className="px-2.5 py-1 bg-carbon hover:bg-carbon-muted text-parchment text-[11px] font-bold tracking-wide flex items-center gap-1 transition-colors border border-carbon"
                        >
                          <Send className="w-3 h-3" />
                          <span>SERVE 48H NOTICE</span>
                        </button>
                      ) : isSafe ? (
                        <span className="text-muted-green font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>COMPLIED & SEALED</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectWellById(record.wellId)}
                          className="px-2 py-1 bg-parchment hover:bg-parchment-dark text-carbon text-[11px] border border-[#CFC7B4]"
                        >
                          INSPECT SITE
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
