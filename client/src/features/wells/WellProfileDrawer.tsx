import React, { useState } from 'react';
import { Well } from '../../types';
import { 
  X, CheckCircle2, AlertOctagon, ArrowRight, ArrowLeft, 
  ShieldCheck, Camera, CheckCheck, QrCode, FileText 
} from 'lucide-react';

interface WellProfileDrawerProps {
  well: Well | null;
  onClose: () => void;
  onOpenVerification: (well: Well) => void;
  onOpenCappingAction: (well: Well) => void;
  onOpenCertificate: (well: Well) => void;
}

export const WellProfileDrawer: React.FC<WellProfileDrawerProps> = ({
  well,
  onClose,
  onOpenVerification,
  onOpenCappingAction,
  onOpenCertificate
}) => {
  // Mode: 'SUMMARY' or 'CHAIN' (the Accountability Chain)
  const [viewMode, setViewMode] = useState<'SUMMARY' | 'CHAIN'>('SUMMARY');

  if (!well) return null;

  const isSafe = well.status === 'VERIFIED_SAFE';
  const isHighRisk = well.riskLevel === 'HIGH' && !isSafe;
  const isActionRequired = well.status === 'ACTION_REQUIRED';

  // Determine which steps in the 5-step accountability chain are complete
  // 1: DETECTED (always complete)
  // 2: CROSS_CHECKED (always complete in our dataset)
  // 3: FIELD_VERIFIED (complete if status is not UNVERIFIED)
  // 4: ACTION_REQUIRED (active/complete if status is ACTION_REQUIRED or VERIFIED_SAFE)
  // 5: VERIFIED_SAFE (complete if status is VERIFIED_SAFE)
  const isFieldVerified = well.status !== 'UNVERIFIED';
  const isActionEnforced = well.status === 'ACTION_REQUIRED' || well.status === 'VERIFIED_SAFE';

  return (
    <div className="w-96 max-w-full bg-parchment-surface border-l border-[#DDD7C7] flex flex-col h-full shadow-panel overflow-y-auto relative z-30 animate-slideLeft">
      {/* Top Header */}
      <div className="p-4 border-b border-[#E0D9C8] bg-parchment-dark/40 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-carbon tracking-wider">
              {well.wellId}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
              isSafe
                ? 'bg-muted-green/15 text-muted-green border-muted-green/40'
                : isHighRisk
                ? 'bg-warning-red-light text-warning-red border-warning-red/40'
                : 'bg-safety-amber-light text-safety-amber border-safety-amber/40'
            }`}>
              {isSafe ? 'VERIFIED SAFE' : isHighRisk ? 'HIGH RISK' : 'ACTION REQUIRED'}
            </span>
          </div>
          <div className="text-xs text-earth mt-1 font-sans">
            {well.village}, {well.mandal} Mandal • Plot Sy. No. <span className="font-mono font-semibold text-carbon">{well.surveyNumber}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-earth hover:text-carbon transition-colors"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 space-y-5 overflow-y-auto font-sans">
        {viewMode === 'SUMMARY' ? (
          /* ================= STAGE 1: CLEAN INVESTIGATION SUMMARY ================= */
          <div className="space-y-5">
            {/* Plain-Language What Happened */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-earth font-bold mb-1">
                LOCATION CONTEXT
              </div>
              <p className="text-sm text-carbon font-medium leading-relaxed">
                {isSafe
                  ? `Permanently capped borewell at ${well.village}. Reinforced concrete barrier inspected and verified safe.`
                  : `Open borewell detected near agricultural boundary in ${well.village}. Unprotected excavation within walking distance of village paths.`}
              </p>
              {!isSafe && (
                <div className="text-xs text-warning-red font-semibold mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warning-red"></span>
                  <span>{well.evidence.distanceToSchool}</span>
                </div>
              )}
            </div>

            {/* Why Was This Flagged? 3 Simple Evidence Checks */}
            <div className="bg-parchment p-3.5 border border-[#DDD7C7] space-y-2.5">
              <div className="text-[11px] font-mono text-earth font-bold uppercase tracking-wider">
                WHY WAS THIS FLAGGED?
              </div>

              <div className="space-y-2 text-xs">
                {/* Check 1: Satellite Evidence */}
                <div className="flex items-start gap-2">
                  <span className="text-muted-green font-bold text-sm">✓</span>
                  <div>
                    <span className="font-semibold text-carbon">Satellite Anomaly: </span>
                    <span className="text-earth">Possible open shaft detected ({well.evidence.diameterEstimate} void)</span>
                  </div>
                </div>

                {/* Check 2: Permit Records */}
                <div className="flex items-start gap-2">
                  <span className="text-muted-green font-bold text-sm">✓</span>
                  <div>
                    <span className="font-semibold text-carbon">Permit Records: </span>
                    <span className="text-earth">
                      {well.permitStatus === 'NO_RECORD'
                        ? 'No active drilling permit on government file'
                        : `WALTA Permit: ${well.permitStatus}`}
                    </span>
                  </div>
                </div>

                {/* Check 3: Field Verification */}
                <div className="flex items-start gap-2">
                  {isFieldVerified ? (
                    <span className="text-muted-green font-bold text-sm">✓</span>
                  ) : (
                    <span className="text-earth font-bold text-sm">○</span>
                  )}
                  <div>
                    <span className="font-semibold text-carbon">Field Verification: </span>
                    <span className="text-earth">
                      {isFieldVerified ? 'Completed by Mandal Field Officer' : 'Awaiting physical on-site inspection'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button: TRACE THIS WELL */}
            <div>
              <button
                onClick={() => setViewMode('CHAIN')}
                className="w-full py-3 px-4 bg-carbon hover:bg-carbon-muted text-parchment text-xs font-mono font-bold tracking-wider uppercase transition-colors border border-carbon flex items-center justify-center gap-2 shadow-subtle"
              >
                <span>TRACE THIS WELL</span>
                <ArrowRight className="w-4 h-4 text-safety-amber" />
              </button>
              <p className="text-[11px] text-earth text-center mt-1.5">
                View the 5-step accountability journey from detection to safety.
              </p>
            </div>

            {/* Quick Context Photo Preview */}
            {well.photos.length > 0 && (
              <div className="border border-[#DDD7C7] p-2 bg-parchment">
                <img
                  src={well.photos[well.photos.length - 1].url}
                  alt="Inspection site"
                  className="w-full h-32 object-cover border border-[#D5CFBF]"
                />
                <div className="text-[10px] font-mono text-earth mt-1 flex justify-between">
                  <span>{well.photos[well.photos.length - 1].type}</span>
                  <span>{well.photos[well.photos.length - 1].caption || 'Recorded evidence'}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= STAGE 2: THE SIGNATURE ACCOUNTABILITY CHAIN ================= */
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0D9C8]">
              <button
                onClick={() => setViewMode('SUMMARY')}
                className="text-xs font-mono text-earth hover:text-carbon flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Summary</span>
              </button>
              <span className="text-[10px] font-mono font-bold text-safety-amber uppercase tracking-wider">
                SAFETY JOURNEY
              </span>
            </div>

            {/* The 5-Step Visual Timeline */}
            <div className="space-y-4 relative pl-3 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#DDD7C7]">
              {/* Step 1: DETECTED */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-4 h-4 rounded-full bg-carbon text-parchment flex items-center justify-center text-[10px] font-bold z-10">
                  ●
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-carbon uppercase">
                    01 • DETECTED
                  </div>
                  <div className="text-xs text-earth mt-0.5">
                    Multispectral satellite scan flagged circular soil void anomaly ({well.detectionDate}).
                  </div>
                </div>
              </div>

              {/* Step 2: CROSS-CHECKED */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-4 h-4 rounded-full bg-carbon text-parchment flex items-center justify-center text-[10px] font-bold z-10">
                  ●
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-carbon uppercase">
                    02 • CROSS-CHECKED
                  </div>
                  <div className="text-xs text-earth mt-0.5">
                    Permit registry check completed. Zero authorized drilling permits found for Plot {well.surveyNumber}.
                  </div>
                </div>
              </div>

              {/* Step 3: FIELD VERIFIED */}
              <div className="relative flex items-start gap-3.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                  isFieldVerified
                    ? 'bg-carbon text-parchment'
                    : 'bg-parchment-surface border-2 border-earth text-earth'
                }`}>
                  {isFieldVerified ? '●' : '○'}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-carbon uppercase">
                    03 • FIELD VERIFIED
                  </div>
                  <div className="text-xs text-earth mt-0.5">
                    {isFieldVerified
                      ? 'Mandal Agricultural Officer verified location on-site with calibrated GPS lock.'
                      : 'Awaiting ground inspection by local field officer.'}
                  </div>
                </div>
              </div>

              {/* Step 4: ACTION REQUIRED */}
              <div className="relative flex items-start gap-3.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                  isActionEnforced
                    ? 'bg-carbon text-parchment'
                    : 'bg-parchment-surface border-2 border-earth text-earth'
                }`}>
                  {isActionEnforced ? '●' : '○'}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-carbon uppercase">
                    04 • ACTION REQUIRED
                  </div>
                  <div className="text-xs text-earth mt-0.5">
                    {isActionEnforced
                      ? 'Statutory 48-hour concrete capping notice dispatched to landowner.'
                      : 'Pending field confirmation before legal enforcement.'}
                  </div>
                </div>
              </div>

              {/* Step 5: VERIFIED SAFE */}
              <div className="relative flex items-start gap-3.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                  isSafe
                    ? 'bg-muted-green text-white'
                    : 'bg-parchment-surface border-2 border-earth text-earth'
                }`}>
                  {isSafe ? '✓' : '○'}
                </div>
                <div>
                  <div className={`text-xs font-mono font-bold uppercase ${isSafe ? 'text-muted-green' : 'text-carbon'}`}>
                    05 • VERIFIED SAFE
                  </div>
                  <div className="text-xs text-earth mt-0.5">
                    {isSafe
                      ? 'Steel-reinforced concrete slab installed. Official QR safety seal issued.'
                      : 'Site remains unsealed until verified capping is confirmed.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contextual Action Buttons */}
            <div className="pt-2 space-y-2">
              {well.status === 'UNVERIFIED' && (
                <button
                  onClick={() => onOpenVerification(well)}
                  className="w-full py-2.5 px-4 bg-warning-red hover:bg-deep-red text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors border border-deep-red flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Camera className="w-4 h-4" />
                  <span>STEP 3: VERIFY IN FIELD</span>
                </button>
              )}

              {well.status === 'ACTION_REQUIRED' && (
                <button
                  onClick={() => onOpenCappingAction(well)}
                  className="w-full py-2.5 px-4 bg-safety-amber hover:bg-safety-amber/90 text-carbon text-xs font-mono font-bold tracking-wider uppercase transition-colors border border-carbon flex items-center justify-center gap-2 shadow-subtle"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>STEP 5: CONFIRM CAPPING & MARK SAFE</span>
                </button>
              )}

              {isSafe && (
                <button
                  onClick={() => onOpenCertificate(well)}
                  className="w-full py-2.5 px-4 bg-muted-green hover:bg-muted-green/90 text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors border border-[#3F4837] flex items-center justify-center gap-2 shadow-subtle"
                >
                  <QrCode className="w-4 h-4" />
                  <span>VIEW OFFICIAL QR SAFETY CERTIFICATE</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
