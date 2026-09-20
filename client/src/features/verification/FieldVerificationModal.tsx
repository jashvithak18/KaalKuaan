import React, { useState } from 'react';
import { Well } from '../../types';
import { 
  X, Camera, MapPin, CheckCircle2, AlertOctagon, 
  Upload, Shield, RefreshCw, Eye 
} from 'lucide-react';

interface FieldVerificationModalProps {
  well: Well | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitVerification: (wellId: string, payload: any) => Promise<void>;
}

export const FieldVerificationModal: React.FC<FieldVerificationModalProps> = ({
  well,
  isOpen,
  onClose,
  onSubmitVerification
}) => {
  if (!isOpen || !well) return null;

  const [officerName, setOfficerName] = useState('K. Venkateshwar Rao (AFO-NL-884)');
  const [gpsLocked, setGpsLocked] = useState(true);
  const [statusFound, setStatusFound] = useState<'OPEN_DANGEROUS' | 'CAPPED_TEMPORARY' | 'PERMANENTLY_SEALED' | 'NOT_FOUND_FALSE_ALARM'>('OPEN_DANGEROUS');
  const [dangerPresent, setDangerPresent] = useState(true);
  const [matchVerdict, setMatchVerdict] = useState<'MATCH' | 'NOT_MATCH' | 'UNCERTAIN'>('MATCH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field evidence photo
  const [fieldPhotoUrl, setFieldPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80'
  );

  const satellitePhoto = well.photos.find(p => p.type === 'SATELLITE')?.url || 
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitVerification(well.wellId, {
        officerName,
        statusFound,
        dangerPresent,
        matchVerdict,
        photoUrl: fieldPhotoUrl,
        dualImageMatchConfirmed: matchVerdict === 'MATCH',
        gpsCoordinates: {
          lat: well.coordinates.lat + 0.00003,
          lng: well.coordinates.lng - 0.00002,
          accuracyMeters: 3.8
        },
        remarks: `Field verification confirmed by ${officerName}. Status: ${statusFound.replace(/_/g, ' ')}.`
      });
      onClose();
    } catch (err) {
      console.error('Field verification error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-carbon/80 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm">
      <div className="bg-parchment w-full max-w-2xl border-2 border-carbon shadow-panel overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top High-Contrast Banner for Outdoor Usability */}
        <div className="bg-carbon text-parchment px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-safety-amber uppercase font-bold">
              FIELD WORKER ON-SITE VERIFICATION CONSOLE
            </div>
            <div className="font-serif text-lg font-bold flex items-center gap-2">
              <span>WELL ID: {well.wellId}</span>
              <span className="font-mono text-xs text-parchment/70">
                (Plot {well.surveyNumber}, {well.village})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-parchment/60 hover:text-parchment border border-transparent hover:border-parchment/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* GPS Confirmation Stamp */}
          <div className="bg-parchment-surface border border-[#DDD7C7] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-muted-green animate-pulse"></div>
              <div>
                <div className="text-xs font-mono font-bold text-carbon">
                  GPS POSITION CALIBRATED & LOCKED
                </div>
                <div className="text-[11px] font-mono text-earth">
                  LAT: {well.coordinates.lat.toFixed(5)}°N | LNG: {well.coordinates.lng.toFixed(5)}°E (±3.8m accuracy)
                </div>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-muted-green px-2 py-0.5 border border-muted-green/40 bg-muted-green/10">
              LOCATION CONFIRMED
            </span>
          </div>

          {/* Dual-Frame Photo Verification: Detected Image vs Field Camera Photo */}
          <div>
            <div className="text-xs font-mono font-bold text-carbon uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>PHOTO VERIFICATION: DETECTED VOID VS. ON-SITE CAMERA</span>
              <span className="text-[10px] text-earth">DUAL-FRAME COMPARISON</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Frame 1: Satellite / Remote Scan Anomaly */}
              <div className="border border-[#DDD7C7] bg-parchment-surface p-2">
                <div className="text-[10px] font-mono font-bold text-earth mb-1 flex items-center justify-between">
                  <span>DETECTED SATELLITE IMAGE</span>
                  <span className="text-carbon">10m Multispectral</span>
                </div>
                <img
                  src={satellitePhoto}
                  alt="Satellite Detection"
                  className="w-full h-40 object-cover border border-[#D5CFBF]"
                />
                <div className="text-[11px] text-earth mt-1 font-mono">
                  Void reflectance: 0.68m circular diameter
                </div>
              </div>

              {/* Frame 2: On-site Field Camera Photograph */}
              <div className="border border-[#DDD7C7] bg-parchment-surface p-2">
                <div className="text-[10px] font-mono font-bold text-earth mb-1 flex items-center justify-between">
                  <span>ON-SITE FIELD PHOTOGRAPH</span>
                  <span className="text-warning-red font-bold">Uncapped Pipe</span>
                </div>
                <img
                  src={fieldPhotoUrl}
                  alt="Field Ground Inspection"
                  className="w-full h-40 object-cover border border-[#D5CFBF]"
                />
                <div className="text-[11px] text-earth mt-1 font-mono flex items-center justify-between">
                  <span>Ground truth verified</span>
                  <button
                    onClick={() => {
                      // Cycle alternate image
                      setFieldPhotoUrl('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
                    }}
                    className="text-[10px] text-carbon underline hover:text-earth"
                  >
                    Simulate Retake
                  </button>
                </div>
              </div>
            </div>

            {/* Verdict Selector */}
            <div className="mt-2.5 flex items-center gap-2 bg-parchment-dark/50 p-2 border border-[#DDD7C7] text-xs font-mono">
              <span className="font-bold text-carbon text-xs">VISUAL MATCH VERDICT:</span>
              <div className="flex gap-2 flex-1">
                {(['MATCH', 'UNCERTAIN', 'NOT_MATCH'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMatchVerdict(v)}
                    className={`flex-1 py-1 text-xs font-bold border transition-colors ${
                      matchVerdict === v
                        ? 'bg-carbon text-parchment border-carbon'
                        : 'bg-parchment text-earth border-[#D5CFBF] hover:bg-parchment-dark'
                    }`}
                  >
                    {v === 'MATCH' ? '✓ MATCH (CONFIRMED)' : v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Well Physical Status Found - Big tactile buttons */}
          <div>
            <label className="block text-xs font-mono font-bold text-carbon uppercase tracking-wider mb-1.5">
              ON-SITE PHYSICAL WELL STATUS
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setStatusFound('OPEN_DANGEROUS'); setDangerPresent(true); }}
                className={`p-3 text-left border-2 transition-all ${
                  statusFound === 'OPEN_DANGEROUS'
                    ? 'border-warning-red bg-warning-red-light text-warning-red font-bold'
                    : 'border-[#DDD7C7] bg-parchment-surface text-carbon hover:border-earth'
                }`}
              >
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  <span>OPEN & DANGEROUS</span>
                </div>
                <div className="text-[11px] text-earth mt-0.5">Unprotected void / exposed casing</div>
              </button>

              <button
                type="button"
                onClick={() => { setStatusFound('CAPPED_TEMPORARY'); setDangerPresent(true); }}
                className={`p-3 text-left border-2 transition-all ${
                  statusFound === 'CAPPED_TEMPORARY'
                    ? 'border-safety-amber bg-safety-amber-light text-carbon font-bold'
                    : 'border-[#DDD7C7] bg-parchment-surface text-carbon hover:border-earth'
                }`}
              >
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>CAPPED TEMPORARY</span>
                </div>
                <div className="text-[11px] text-earth mt-0.5">Bushes / loose sheet covering</div>
              </button>

              <button
                type="button"
                onClick={() => { setStatusFound('PERMANENTLY_SEALED'); setDangerPresent(false); }}
                className={`p-3 text-left border-2 transition-all ${
                  statusFound === 'PERMANENTLY_SEALED'
                    ? 'border-muted-green bg-muted-green/15 text-muted-green font-bold'
                    : 'border-[#DDD7C7] bg-parchment-surface text-carbon hover:border-earth'
                }`}
              >
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PERMANENTLY SEALED</span>
                </div>
                <div className="text-[11px] text-earth mt-0.5">Concrete slab / welded plate lock</div>
              </button>

              <button
                type="button"
                onClick={() => { setStatusFound('NOT_FOUND_FALSE_ALARM'); setDangerPresent(false); }}
                className={`p-3 text-left border-2 transition-all ${
                  statusFound === 'NOT_FOUND_FALSE_ALARM'
                    ? 'border-carbon bg-parchment-dark text-carbon font-bold'
                    : 'border-[#DDD7C7] bg-parchment-surface text-carbon hover:border-earth'
                }`}
              >
                <div className="text-sm font-bold">NOT FOUND / FALSE ALARM</div>
                <div className="text-[11px] text-earth mt-0.5">Irrigation pit / natural mound</div>
              </button>
            </div>
          </div>

          {/* Inspecting Field Officer ID */}
          <div className="text-xs font-mono text-earth flex items-center justify-between p-2 bg-parchment-dark/40 border border-[#DDD7C7]">
            <span>Inspecting Officer: <strong className="text-carbon">{officerName}</strong></span>
            <span>Telangana Agri Dept</span>
          </div>
        </div>

        {/* Bottom Submission Action */}
        <div className="p-4 bg-parchment-surface border-t border-[#DDD7C7] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-earth hover:text-carbon border border-[#D5CFBF]"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 bg-carbon text-parchment hover:bg-carbon-muted text-xs font-mono font-bold tracking-wider transition-colors border border-carbon flex items-center justify-center gap-2 shadow-subtle"
          >
            <CheckCircle2 className="w-4 h-4 text-safety-amber" />
            <span>{isSubmitting ? 'SUBMITTING VERIFICATION...' : 'MARK AS VERIFIED & DISPATCH ENFORCEMENT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
