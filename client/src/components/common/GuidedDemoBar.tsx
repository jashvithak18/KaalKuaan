import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { ChevronRight, ChevronLeft, X, CheckCircle2, AlertOctagon } from 'lucide-react';

export const GuidedDemoBar: React.FC = () => {
  const { currentStep, isDemoActive, nextStep, prevStep, exitDemo } = useDemo();

  if (!isDemoActive) return null;

  const stepDetails = {
    STEP_1_DETECT: {
      index: '1/6',
      title: 'ANOMALY DETECTED',
      instruction: 'Simulated Sentinel-2 scan detected dark void anomaly at Survey 142/3A Ramanapet. Click marker KK-TS-04281 or Next.',
      actionText: 'Inspect Evidence →'
    },
    STEP_2_OPEN_EVIDENCE: {
      index: '2/6',
      title: 'EXPLAINABLE EVIDENCE & PERMIT CROSS-CHECK',
      instruction: 'Dark circular void (0.68m), 180m from Zilla Parishad Primary School. Cross-check confirms NO WALTA DRILLING PERMIT.',
      actionText: 'Dispatch Field Officer →'
    },
    STEP_3_FIELD_DISPATCH: {
      index: '3/6',
      title: 'MOBILE FIELD VERIFICATION',
      instruction: 'Field Officer AFO-NL-884 reaches site. Dual-frame camera comparison confirms unprotected casing. Submit verification.',
      actionText: 'Enforce Capping →'
    },
    STEP_4_CAPPING_ACTION: {
      index: '4/6',
      title: 'COMPLIANCE & CAPPING VERIFICATION',
      instruction: 'Panchayat enforces statutory capping. 150mm reinforced concrete slab installed. Confirm capping to issue certificate.',
      actionText: 'Generate Safety Certificate →'
    },
    STEP_5_QR_CERTIFICATE: {
      index: '5/6',
      title: 'PHYSICAL QR SAFETY CERTIFICATE',
      instruction: 'Official certificate CERT-NL-2026 issued with cryptographic hash and QR code for site affixing.',
      actionText: 'View Public Map →'
    },
    STEP_6_PUBLIC_MAP: {
      index: '6/6',
      title: 'PUBLIC SAFETY RADAR UPDATED',
      instruction: 'Well KK-TS-04281 marker turns GREEN (VERIFIED SAFE). Public radar confirms zero open risks within school perimeter.',
      actionText: 'Finish Evaluation'
    }
  }[currentStep as keyof typeof stepDetails] || {
    index: '0/0',
    title: 'GUIDED DEMO',
    instruction: '',
    actionText: 'Next'
  };

  return (
    <div className="bg-carbon text-parchment px-4 py-2.5 flex items-center justify-between border-b-2 border-safety-amber sticky top-[53px] z-30 shadow-panel animate-fadeIn">
      {/* Step Badge & Instruction */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-safety-amber text-carbon px-2 py-0.5 text-xs font-mono font-bold">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>STEP {stepDetails.index}</span>
        </div>

        <div>
          <span className="font-mono text-xs font-bold text-safety-amber uppercase mr-2 tracking-wider">
            {stepDetails.title}:
          </span>
          <span className="text-xs text-[#E2DCСC] font-medium">
            {stepDetails.instruction}
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={prevStep}
          disabled={currentStep === 'STEP_1_DETECT'}
          className="p-1 text-parchment/70 hover:text-parchment disabled:opacity-30 border border-carbon-muted hover:border-parchment/40"
          title="Previous demo step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={nextStep}
          className="flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 bg-safety-amber text-carbon hover:bg-safety-amber/90 transition-colors border border-safety-amber"
        >
          <span>{stepDetails.actionText}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={exitDemo}
          className="p-1 text-parchment/50 hover:text-parchment hover:bg-carbon-muted border border-transparent ml-1"
          title="Exit guided demo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
