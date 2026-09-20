import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types';
import { api } from '../../services/api';
import { History, ShieldCheck, Search, Filter, Hash } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchWellId, setSearchWellId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async (id?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs(id);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(searchWellId);
  };

  return (
    <div className="flex-1 bg-parchment p-4 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="border border-[#D8D2C2] bg-parchment-surface p-4 shadow-subtle mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E8E2D2] pb-3">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-earth uppercase font-bold flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-carbon" />
              <span>IMMUTABLE OPERATIONAL AUDIT TRAIL</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-carbon">
              Tamper-Evident Safety Activity Journal
            </h1>
            <p className="text-xs text-earth mt-0.5">
              Cryptographically sequenced audit log enforcing institutional accountability from scan detection to site capping.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="paper-stamp">
              APPEND-ONLY JOURNAL
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-mono">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <span className="text-earth">FILTER WELL ID:</span>
            <input
              type="text"
              value={searchWellId}
              onChange={(e) => setSearchWellId(e.target.value)}
              placeholder="e.g. KK-TS-04281"
              className="bg-parchment border border-[#CFC7B4] px-2 py-1 text-carbon focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-carbon text-parchment font-bold hover:bg-carbon-muted"
            >
              Filter
            </button>
            {searchWellId && (
              <button
                type="button"
                onClick={() => { setSearchWellId(''); fetchLogs(); }}
                className="px-2 py-1 text-earth underline"
              >
                Clear
              </button>
            )}
          </form>

          <div className="text-[11px] text-earth">
            Showing <strong>{logs.length}</strong> sequential actions
          </div>
        </div>
      </div>

      {/* Log Feed */}
      <div className="border border-[#D8D2C2] bg-parchment-surface shadow-subtle divide-y divide-[#E8E2D2] font-mono text-xs">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-earth">
            {isLoading ? 'Reading sequential journal...' : 'No audit entries found.'}
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id || log.logId} className="p-3.5 hover:bg-parchment/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                {/* Timestamp */}
                <div className="w-28 text-earth font-bold flex-shrink-0">
                  {log.timeFormatted || new Date(log.timestamp).toLocaleTimeString()}
                </div>

                {/* Event & Well ID */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 bg-parchment-dark border border-[#CFC7B4] text-[10px] font-bold text-carbon">
                      {log.wellId}
                    </span>
                    <span className="font-bold text-carbon text-xs">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    {log.newState && (
                      <span className="text-[10px] text-muted-green font-bold">
                        → {log.newState}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-carbon-muted mt-0.5 font-sans">
                    {log.details}
                  </div>
                </div>
              </div>

              {/* Actor & Tamper Hash */}
              <div className="flex items-center gap-3 text-[11px] text-earth md:text-right flex-shrink-0">
                <div>
                  <div className="text-carbon font-semibold">{log.actor}</div>
                  <div className="text-[10px] text-[#A59B85]">{log.role}</div>
                </div>

                {log.entryHash && (
                  <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-parchment border border-[#DDD7C7] text-[10px] text-earth">
                    <Hash className="w-3 h-3" />
                    <span>{log.entryHash}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
