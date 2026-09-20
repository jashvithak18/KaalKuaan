import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CitizenReport, ReportLifecycleStatus } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  RefreshCw,
  Eye,
  PlusCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface MyReportsViewProps {
  onReportNew: () => void;
  onViewHazard: (wellId?: string) => void;
}

const LIFECYCLE_STEPS: ReportLifecycleStatus[] = ['Pending', 'Under Review', 'Verified', 'Resolved'];

export const MyReportsView: React.FC<MyReportsViewProps> = ({ onReportNew, onViewHazard }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);

  const fetchReports = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getMyReports(user.userId);
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const getStatusBadge = (status: ReportLifecycleStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 rounded-md inline-flex items-center space-x-1">
            <Clock size={12} />
            <span>Pending Panchayat Triage</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300 rounded-md inline-flex items-center space-x-1">
            <RefreshCw size={12} className="animate-spin" />
            <span>Under Field Review</span>
          </span>
        );
      case 'Verified':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300 rounded-md inline-flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>Verified Borewell Void</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md inline-flex items-center space-x-1">
            <CheckCircle2 size={12} />
            <span>Resolved & Capped</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getStepIndex = (status: ReportLifecycleStatus) => {
    const idx = LIFECYCLE_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-stone-50 border border-stone-300 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            Public Safety Tracking
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">
            My Submitted Borewell Reports
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Monitor the real-time field triage, physical inspection, and capping progress of borewells you flagged.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchReports}
            className="p-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition"
            title="Refresh reports"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onReportNew}
            className="px-4 py-2 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer ring-1 ring-white/20"
          >
            <PlusCircle size={15} />
            <span>Report Unsafe Borewell</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center bg-stone-50 border border-stone-200 rounded-xl">
          <RefreshCw size={24} className="animate-spin mx-auto text-stone-400 mb-2" />
          <p className="text-sm font-medium text-stone-600">Retrieving official status records...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 border border-stone-300 rounded-xl">
          <FileText size={36} className="mx-auto text-stone-400 mb-3" />
          <h3 className="text-base font-serif font-bold text-stone-900">No Reports Filed Yet</h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 mb-5">
            You haven't submitted any borewell alerts. When you spot an uncapped casing pipe or abandoned drilling hole, report it here for immediate district response.
          </p>
          <button
            onClick={onReportNew}
            className="px-5 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium text-xs rounded-lg shadow-sm transition"
          >
            Submit First Borewell Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const currentStepIdx = getStepIndex(report.status);

            return (
              <div
                key={report._id || report.reportId}
                className="bg-white border border-stone-300 rounded-xl p-5 shadow-2xs hover:border-stone-400 transition"
              >
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        {report.reportId}
                      </span>
                      {report.wellId && (
                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          Linked Well: {report.wellId}
                        </span>
                      )}
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500">
                        {new Date(report.submittedAt || report.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900 mt-1">
                      {report.hazardType}
                    </h4>

                    <div className="flex items-center space-x-1.5 text-xs text-stone-600 mt-1">
                      <MapPin size={13} className="text-stone-400 shrink-0" />
                      <span>{report.area || report.locationName}</span>
                      {report.coordinates && (
                        <span className="font-mono text-stone-600">
                          ({report.coordinates.lat?.toFixed(4)}°, {report.coordinates.lng?.toFixed(4)}°)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="self-start sm:self-center">
                    {getStatusBadge(report.status)}
                  </div>
                </div>

                {/* Description */}
                {report.description && (
                  <p className="text-xs text-stone-700 py-3 leading-relaxed">
                    <strong>Reported Notes:</strong> {report.description}
                  </p>
                )}

                {/* Lifecycle Progress Bar: Pending -> Under Review -> Verified -> Resolved */}
                <div className="pt-3 pb-2">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-stone-200 w-full z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-terracotta-600 transition-all duration-500 z-0"
                      style={{
                        width: `${(currentStepIdx / (LIFECYCLE_STEPS.length - 1)) * 100}%`
                      }}
                    />

                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition ${
                              isCompleted
                                ? 'bg-terracotta-600 border-terracotta-600 text-white'
                                : 'bg-white border-stone-300 text-stone-400'
                            }`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                              isCurrent
                                ? 'text-stone-900 font-bold'
                                : isCompleted
                                ? 'text-stone-700'
                                : 'text-stone-600'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span className="text-[11px] text-stone-600">
                    {report.status === 'Resolved'
                      ? 'Action complete: Iron safety flange sealed & audited.'
                      : report.status === 'Verified'
                      ? 'Notice served to landowner under Section 19 WALTA Act.'
                      : report.status === 'Under Review'
                      ? 'Mandal officer dispatched for ground inspection.'
                      : 'Logged in Panchayat queue awaiting officer review.'}
                  </span>

                  {report.wellId && (
                    <button
                      onClick={() => onViewHazard(report.wellId)}
                      className="text-terracotta-700 hover:text-terracotta-900 font-semibold text-xs flex items-center space-x-1"
                    >
                      <span>Locate on Map</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
