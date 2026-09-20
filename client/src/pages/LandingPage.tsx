import React from 'react';
import { ArrowRight, ShieldCheck, MapPin, Eye, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface LandingPageProps {
  onOpenFieldMap: () => void;
  unverifiedCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenFieldMap, unverifiedCount }) => {
  return (
    <div className="flex-1 bg-parchment overflow-y-auto">
      {/* 1. Hero Split Section */}
      <section className="border-b border-[#DDD7C7] bg-parchment-surface">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Serious Editorial Typography */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="text-xs font-mono tracking-widest text-earth uppercase font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning-red"></span>
                <span>INDIAN PUBLIC-SAFETY INFRASTRUCTURE</span>
              </div>

              <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-carbon leading-[0.95]">
                KAAL<br />
                KUAAN
              </h1>

              <div className="text-lg md:text-xl font-mono tracking-widest text-earth uppercase font-bold mt-2 pb-3 border-b border-[#D5CFBF]">
                DANGER BENEATH EVERY STEP
              </div>
            </div>

            <p className="font-serif text-xl md:text-2xl text-carbon-muted italic leading-snug">
              “An open borewell is invisible until it becomes an emergency.”
            </p>

            <p className="text-sm text-earth leading-relaxed">
              India already has satellite imagery, drone surveys, groundwater drilling permits, cadastral GIS records, field officers, WhatsApp, and Gram Panchayats. The failure is not data. The failure is fragmentation. Kaal Kuaan connects them into one operational public safety network.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenFieldMap}
                className="px-6 py-3.5 bg-carbon text-parchment hover:bg-carbon-muted text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-subtle flex items-center gap-2 border border-carbon"
              >
                <span>OPEN FIELD MAP</span>
                <ArrowRight className="w-4 h-4 text-safety-amber" />
              </button>

              <a
                href="#how-it-works"
                className="px-5 py-3.5 bg-parchment hover:bg-parchment-dark text-carbon text-xs font-mono font-bold tracking-wider uppercase transition-colors border border-[#CFC7B4]"
              >
                HOW IT WORKS
              </a>
            </div>

            <div className="text-[11px] font-mono text-earth flex items-center gap-2 pt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-safety-amber" />
              <span>Pilot Zone: Nalgonda District (Cadastral Survey Grid)</span>
            </div>
          </div>

          {/* Right Column: Realistic Aerial Cadastral Composition */}
          <div className="lg:col-span-6 relative">
            <div className="border-4 border-carbon bg-parchment p-3 shadow-panel relative overflow-hidden">
              {/* Aerial Farmland Photo */}
              <div className="relative h-96 overflow-hidden border border-[#DDD7C7]">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
                  alt="Aerial Indian Agricultural Farmland Cadastral Grid"
                  className="w-full h-full object-cover filter contrast-105"
                />

                {/* Cadastral Survey Grid Overlay */}
                <div className="absolute inset-0 bg-carbon/15 pointer-events-none">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-1/3 h-[1px] bg-white/40 border-dashed"></div>
                  <div className="absolute inset-x-0 top-2/3 h-[1px] bg-white/40 border-dashed"></div>
                  <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/40 border-dashed"></div>
                  <div className="absolute inset-y-0 left-2/3 w-[1px] bg-white/40 border-dashed"></div>
                </div>

                {/* Subtle Detection Circle 1 (Pulsing Target) */}
                <div className="absolute top-[48%] left-[55%] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 rounded-full border-2 border-warning-red animate-ping opacity-75"></div>
                  <div className="w-6 h-6 rounded-none bg-warning-red/90 border-2 border-[#7E302A] absolute top-3 left-3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-7 -left-12 font-mono text-[9px] font-bold px-1.5 py-0.5 bg-carbon text-parchment border border-[#7E302A] whitespace-nowrap shadow-sm">
                    KK-TS-04281 (UNVERIFIED)
                  </div>
                </div>

                {/* Detection Circle 2 (Amber) */}
                <div className="absolute top-[25%] left-[28%] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 rounded-none bg-safety-amber/90 border border-[#966B1E] flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-6 left-0 font-mono text-[9px] font-bold px-1 py-0.2 bg-parchment-surface text-carbon border border-[#DDD7C7] whitespace-nowrap">
                    KK-TS-04282
                  </div>
                </div>

                {/* Detection Circle 3 (Green - Capped) */}
                <div className="absolute top-[75%] left-[80%] -translate-x-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 rounded-none bg-muted-green border border-[#3F4837] flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-6 left-0 font-mono text-[9px] font-bold px-1 py-0.2 bg-parchment-surface text-carbon border border-[#DDD7C7] whitespace-nowrap">
                    KK-TS-04284 (SAFE)
                  </div>
                </div>

                {/* Survey Stamp */}
                <div className="absolute top-3 right-3 font-mono text-[10px] bg-parchment-surface/90 text-carbon p-1.5 border border-[#DDD7C7]">
                  CADASTRAL ANOMALY SCAN #9921
                </div>
              </div>

              {/* Status Bar Below Map */}
              <div className="mt-3 p-2 bg-parchment-surface border border-[#DDD7C7] flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning-red animate-pulse"></span>
                  <span className="font-bold text-carbon">
                    {unverifiedCount} detected locations awaiting field verification
                  </span>
                </div>
                <button
                  onClick={onOpenFieldMap}
                  className="text-earth hover:text-carbon underline font-bold"
                >
                  Locate on Grid →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Core Story: The Connected System */}
      <section className="py-12 px-4 max-w-6xl mx-auto border-b border-[#DDD7C7]">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-mono tracking-widest text-earth uppercase font-bold">
            THE INTEGRATED ARCHITECTURE
          </div>
          <h2 className="font-serif text-3xl font-bold text-carbon mt-1">
            Not Another App. A Missing Connection.
          </h2>
          <p className="text-xs text-earth mt-2">
            The tragedy of borewell fatalities in India is never a lack of technical capacity. It is fragmented accountability across silos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-parchment-surface border border-[#DDD7C7] shadow-subtle">
            <div className="text-xs font-mono font-bold text-safety-amber mb-1">01 • REMOTE DATA</div>
            <h3 className="font-serif text-lg font-bold text-carbon">Satellite & Drone Imagery</h3>
            <p className="text-xs text-earth mt-1 leading-relaxed">
              Automated spectral void scanning flags high-reflectance circular soil voids before crops conceal them.
            </p>
          </div>

          <div className="p-4 bg-parchment-surface border border-[#DDD7C7] shadow-subtle">
            <div className="text-xs font-mono font-bold text-safety-amber mb-1">02 • REGISTRY</div>
            <h3 className="font-serif text-lg font-bold text-carbon">Government Drilling Records</h3>
            <p className="text-xs text-earth mt-1 leading-relaxed">
              Every detected void is cross-checked with the State WALTA groundwater permit database to detect illegal drilling.
            </p>
          </div>

          <div className="p-4 bg-parchment-surface border border-[#DDD7C7] shadow-subtle">
            <div className="text-xs font-mono font-bold text-safety-amber mb-1">03 • HUMAN GROUND TRUTH</div>
            <h3 className="font-serif text-lg font-bold text-carbon">Field Verification Desk</h3>
            <p className="text-xs text-earth mt-1 leading-relaxed">
              Mandal Agricultural Officers visit the exact GPS coordinates to perform side-by-side photo verification.
            </p>
          </div>

          <div className="p-4 bg-parchment-surface border border-[#DDD7C7] shadow-subtle">
            <div className="text-xs font-mono font-bold text-safety-amber mb-1">04 • ACCOUNTABILITY</div>
            <h3 className="font-serif text-lg font-bold text-carbon">Panchayat Enforcement</h3>
            <p className="text-xs text-earth mt-1 leading-relaxed">
              Statutory 48-hour capping notices are served to landowners. Upon concrete sealing, a public QR certificate is issued.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-12 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-mono tracking-widest text-earth uppercase font-bold">
            OPERATIONAL CADENCE
          </div>
          <h2 className="font-serif text-3xl font-bold text-carbon mt-1">
            From Detection to Public Safety
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="space-y-2">
            <div className="font-mono text-3xl font-bold text-carbon/30">01</div>
            <h4 className="font-serif text-lg font-bold text-carbon">DETECT</h4>
            <p className="text-xs text-earth leading-relaxed">
              Satellite scan and citizen reports ingest unverified hole candidates onto the district cadastral map.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-3xl font-bold text-carbon/30">02</div>
            <h4 className="font-serif text-lg font-bold text-carbon">VERIFY</h4>
            <p className="text-xs text-earth leading-relaxed">
              On-site field worker matches satellite void signature with physical camera photograph and locks GPS.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-3xl font-bold text-carbon/30">03</div>
            <h4 className="font-serif text-lg font-bold text-carbon">ACT</h4>
            <p className="text-xs text-earth leading-relaxed">
              Local administrative authority serves legal notice and mandates steel-reinforced concrete capping.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-3xl font-bold text-carbon/30">04</div>
            <h4 className="font-serif text-lg font-bold text-carbon">CERTIFY</h4>
            <p className="text-xs text-earth leading-relaxed">
              Official QR Safety Certificate generated and sealed. Public safety map turns marker safe green.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onOpenFieldMap}
            className="px-8 py-3.5 bg-carbon text-parchment hover:bg-carbon-muted text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-subtle border border-carbon"
          >
            ENTER THE LIVE OPERATIONAL MAP
          </button>
        </div>
      </section>
    </div>
  );
};
