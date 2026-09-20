import React, { useState } from 'react';
import { X, Camera, MapPin, CheckCircle2, AlertCircle, Search, Navigation } from 'lucide-react';
import { api } from '../../services/api';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (reportId: string) => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [locationChoice, setLocationChoice] = useState('CURRENT_GPS');
  const [customLocation, setCustomLocation] = useState('Ramanapet Village, near Primary School footpath');
  const [hazardType, setHazardType] = useState('Open borewell');
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.submitCitizenReport({
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.0542, lng: 79.2685 },
        locationName: customLocation,
        description: `Citizen Report: ${hazardType} observed at ${customLocation}.`,
        language: 'en'
      });

      if (res.success) {
        setSubmittedReportId(res.reportId);
        onReportSubmitted(res.reportId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSubmittedReportId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-carbon/80 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm">
      <div className="bg-parchment w-full max-w-lg border-2 border-carbon shadow-panel flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-carbon text-parchment px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-safety-amber uppercase font-bold">
              PUBLIC SAFETY REPORT
            </div>
            <div className="font-serif text-lg font-bold">
              Report an Open or Abandoned Well
            </div>
          </div>

          <button onClick={handleResetAndClose} className="p-1 text-parchment/70 hover:text-parchment">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Body */}
        <div className="p-5 md:p-6 space-y-5">
          {submittedReportId ? (
            /* Success State */
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-muted-green/20 text-muted-green mx-auto rounded-full flex items-center justify-center border-2 border-muted-green">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-carbon">
                Report Received
              </h3>
              <p className="text-sm text-earth max-w-xs mx-auto">
                Your report will enter the verification chain. The local Mandal Agricultural Officer and Gram Panchayat have been alerted.
              </p>
              <div className="p-3 bg-parchment-surface border border-[#DDD7C7] font-mono text-xs inline-block">
                REPORT TRACKING ID: <strong className="text-carbon">{submittedReportId}</strong>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-carbon text-parchment text-xs font-mono font-bold uppercase tracking-wider hover:bg-carbon-muted"
                >
                  Return to Safety Map
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between border-b border-[#DDD7C7] pb-3 text-xs font-mono">
                <span className={step === 1 ? 'font-bold text-carbon' : 'text-earth'}>1. Location</span>
                <span className="text-earth">→</span>
                <span className={step === 2 ? 'font-bold text-carbon' : 'text-earth'}>2. Observation</span>
                <span className="text-earth">→</span>
                <span className={step === 3 ? 'font-bold text-carbon' : 'text-earth'}>3. Evidence</span>
                <span className="text-earth">→</span>
                <span className={step === 4 ? 'font-bold text-carbon' : 'text-earth'}>4. Submit</span>
              </div>

              {/* STEP 1: WHERE IS THE WELL? */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-carbon uppercase font-mono mb-1">
                      Step 1: Where is the well?
                    </h3>
                    <p className="text-xs text-earth">
                      Identify where this hazard is located so officers can find it.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setLocationChoice('CURRENT_GPS')}
                      className={`w-full p-3 text-left border flex items-center justify-between text-xs transition-colors ${
                        locationChoice === 'CURRENT_GPS'
                          ? 'border-carbon bg-parchment-surface font-bold text-carbon'
                          : 'border-[#DDD7C7] bg-parchment hover:bg-parchment-surface text-earth'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-safety-amber" />
                        <span>Use my current GPS position (17.0542°N, 79.2685°E)</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-green">CALIBRATED</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocationChoice('VILLAGE_SEARCH')}
                      className={`w-full p-3 text-left border flex items-center justify-between text-xs transition-colors ${
                        locationChoice === 'VILLAGE_SEARCH'
                          ? 'border-carbon bg-parchment-surface font-bold text-carbon'
                          : 'border-[#DDD7C7] bg-parchment hover:bg-parchment-surface text-earth'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-earth" />
                        <span>Specify village / landmark manually</span>
                      </div>
                    </button>
                  </div>

                  {locationChoice === 'VILLAGE_SEARCH' && (
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="e.g. Ramanapet Village, near primary school..."
                      className="w-full p-2.5 bg-parchment-surface border border-[#CFC7B4] text-xs text-carbon focus:outline-none"
                    />
                  )}

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-2.5 bg-carbon text-parchment text-xs font-mono font-bold uppercase tracking-wider hover:bg-carbon-muted transition-colors"
                  >
                    Next: What did you see? →
                  </button>
                </div>
              )}

              {/* STEP 2: WHAT DID YOU SEE? */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-carbon uppercase font-mono mb-1">
                      Step 2: What did you see?
                    </h3>
                    <p className="text-xs text-earth">
                      Select the physical condition of the well opening.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      'Open borewell (unprotected pipe or hole)',
                      'Abandoned open dug well',
                      'Damaged or loose safety cover',
                      'Drilling rig left hole uncovered',
                      'Unknown hazard / other'
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setHazardType(opt)}
                        className={`w-full p-2.5 text-left border text-xs transition-colors ${
                          hazardType === opt
                            ? 'border-carbon bg-parchment-surface font-bold text-carbon'
                            : 'border-[#DDD7C7] bg-parchment hover:bg-parchment-surface text-earth'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-[#CFC7B4] text-xs font-mono"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-2.5 bg-carbon text-parchment text-xs font-mono font-bold uppercase tracking-wider hover:bg-carbon-muted transition-colors"
                    >
                      Next: Evidence Photo →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: OPTIONAL EVIDENCE */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-carbon uppercase font-mono mb-1">
                      Step 3: Optional Photo Evidence
                    </h3>
                    <p className="text-xs text-earth">
                      Attaching a photo speeds up field verification significantly.
                    </p>
                  </div>

                  <div className="border border-[#DDD7C7] p-3 bg-parchment-surface text-center">
                    {photoUrl ? (
                      <div>
                        <img
                          src={photoUrl}
                          alt="Borewell capture"
                          className="w-full h-40 object-cover border border-[#D5CFBF] mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoUrl(null)}
                          className="text-xs text-earth underline hover:text-carbon font-mono"
                        >
                          Remove photo
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 space-y-2">
                        <Camera className="w-8 h-8 text-earth mx-auto" />
                        <div className="text-xs text-earth">No photo attached yet</div>
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80')}
                          className="px-3 py-1.5 bg-parchment border border-[#CFC7B4] text-xs text-carbon font-bold"
                        >
                          Simulate Camera Capture
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-[#CFC7B4] text-xs font-mono"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="flex-1 py-2.5 bg-carbon text-parchment text-xs font-mono font-bold uppercase tracking-wider hover:bg-carbon-muted transition-colors"
                    >
                      Review & Submit →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUBMIT REPORT */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-carbon uppercase font-mono mb-1">
                      Step 4: Confirm Safety Submission
                    </h3>
                    <p className="text-xs text-earth">
                      Please confirm details before lodging the safety alert.
                    </p>
                  </div>

                  <div className="p-3.5 bg-parchment-surface border border-[#DDD7C7] space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-earth">LOCATION:</span>
                      <div className="font-bold text-carbon mt-0.5">{customLocation}</div>
                    </div>
                    <div>
                      <span className="text-earth">OBSERVED HAZARD:</span>
                      <div className="font-bold text-warning-red mt-0.5">{hazardType}</div>
                    </div>
                    <div>
                      <span className="text-earth">PHOTO ATTACHED:</span>
                      <div className="font-bold text-carbon mt-0.5">{photoUrl ? 'Yes (Field Capture)' : 'No'}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 border border-[#CFC7B4] text-xs font-mono"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-warning-red hover:bg-deep-red text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-deep-red flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{isSubmitting ? 'SUBMITTING ALERT...' : 'SUBMIT REPORT TO SAFETY NETWORK'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
