import React from 'react';
import { Shield, ArrowRight, Eye, AlertTriangle, CheckCircle2, Navigation, Layers, Bell } from 'lucide-react';

interface PublicLandingPageProps {
  onCheckSurroundings: () => void;
  onOpenMap: () => void;
  onReportHazard: () => void;
  onSignIn: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onCheckSurroundings,
  onOpenMap,
  onReportHazard,
  onSignIn
}) => {
  return (
    <div className="w-full bg-[#F3F0E8] text-stone-900 min-h-screen flex flex-col font-sans">
      {/* 1. Hero Section */}
      <section className="relative px-4 sm:px-6 pt-8 pb-16 md:pt-14 md:pb-24 max-w-5xl mx-auto text-center">
        {/* Brand Emblem */}
        <div className="flex justify-center mb-5">
          <img
            src="/logo.jpg"
            alt="Kaal Kuaan Emblem"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-xl border-2 border-stone-800 object-cover hover:scale-105 transition-transform"
          />
        </div>

        {/* State Tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-200 border border-stone-300 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-terracotta-600 animate-pulse" />
          <span>Telangana Public Borewell Safety Network</span>
        </div>

        {/* Large Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Know what lies beneath your next step.
        </h1>

        {/* Supporting Text */}
        <p className="mt-5 text-base sm:text-xl text-stone-700 max-w-2xl mx-auto leading-relaxed font-sans">
          Kaal Kuaan helps you identify reported borewells and open-well hazards around you before they become a danger.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onCheckSurroundings}
            className="w-full sm:w-auto px-7 py-3.5 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white font-bold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <Navigation size={18} className="text-white shrink-0" />
            <span className="text-white font-bold">Check My Surroundings</span>
            <ArrowRight size={18} className="text-white shrink-0" />
          </button>

          <button
            onClick={onReportHazard}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white font-bold text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2.5 cursor-pointer ring-2 ring-[#B84A3A]/30"
          >
            <AlertTriangle size={18} className="text-white shrink-0" />
            <span className="text-white font-bold">Report Unsafe Borewell</span>
          </button>

          <button
            onClick={onOpenMap}
            className="w-full sm:w-auto px-6 py-3.5 bg-stone-200 hover:bg-stone-300 active:bg-stone-400 text-stone-800 font-semibold text-sm sm:text-base rounded-lg transition flex items-center justify-center space-x-2"
          >
            <Eye size={18} />
            <span>Explore Hazards on Map</span>
          </button>
        </div>

        <p className="mt-4 text-xs text-stone-600 flex items-center justify-center space-x-1.5">
          <span>📍 Zero configuration • Location queried only on-device within 1km radius</span>
        </p>
      </section>

      {/* 2. Ground-Cross-Section Hidden Borewell Diagram */}
      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-10 border border-stone-800 shadow-xl overflow-hidden relative">
          <div className="text-center sm:text-left mb-8">
            <span className="text-xs font-mono font-bold tracking-widest text-terracotta-400 uppercase">
              Field Reality Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Why Uncovered Borewells Are Invisible Killers
            </h2>
            <p className="text-sm text-stone-400 max-w-2xl mt-1">
              Agricultural plots, school paths, and rural fringes contain unrecorded drilling holes flush with dry grass and clay.
            </p>
          </div>

          {/* Graphical cross-section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-stone-800">
            {/* Diagram Card 1 */}
            <div className="p-5 bg-stone-800/60 rounded-xl border border-stone-700">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-bold uppercase mb-2">
                <AlertTriangle size={16} />
                <span>01. Surface Obscurity</span>
              </div>
              <h3 className="font-bold text-base text-white">0.60m Uncapped Void</h3>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                Pipes protrude less than 10 centimeters or sit flush with the soil. Wild shrubs and cart-track dust conceal the void from children walking home from school.
              </p>
            </div>

            {/* Diagram Card 2 */}
            <div className="p-5 bg-stone-800/60 rounded-xl border border-stone-700">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase mb-2">
                <Navigation size={16} />
                <span>02. 100m Proximity Radar</span>
              </div>
              <h3 className="font-bold text-base text-white">Critical Audio/Visual Alert</h3>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                When a smartphone moves within 100 meters of a recorded void, Kaal Kuaan activates a high-priority warning banner before the traveler reaches the hazard.
              </p>
            </div>

            {/* Diagram Card 3 */}
            <div className="p-5 bg-stone-800/60 rounded-xl border border-stone-700">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold uppercase mb-2">
                <CheckCircle2 size={16} />
                <span>03. Panchayat Enforcement</span>
              </div>
              <h3 className="font-bold text-base text-white">Section 19 WALTA Capping</h3>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                Citizen flags trigger statutory notices to the landowner, dispatching Mandal officers to verify welded steel flanges and permanent safety capping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (4 Clean Steps) */}
      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-terracotta-700">
            Operational Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            From Ground Detection to Sealed Borewell
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-stone-300 rounded-xl shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-900 font-bold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h3 className="font-bold text-sm text-stone-900">Check Surroundings</h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Open the web app in any browser. Grant location access or pick your Telangana district corridor.
            </p>
          </div>

          <div className="p-5 bg-white border border-stone-300 rounded-xl shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-900 font-bold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h3 className="font-bold text-sm text-stone-900">Receive Safety Alert</h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Get classified distance alerts: Critical (&lt;100m), Nearby (&lt;500m), or Vicinity (&lt;1km).
            </p>
          </div>

          <div className="p-5 bg-white border border-stone-300 rounded-xl shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-900 font-bold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h3 className="font-bold text-sm text-stone-900">Inspect on Map</h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              View your pulsing position alongside color-coded borewells with exact surveyor survey numbers.
            </p>
          </div>

          <div className="p-5 bg-white border border-stone-300 rounded-xl shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-900 font-bold flex items-center justify-center text-sm mb-3">
              4
            </div>
            <h3 className="font-bold text-sm text-stone-900">Report & Track Resolution</h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Flag an unrecorded hole with one click. Follow the lifecycle from Pending to Verified to Resolved.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Proximity Alert Levels Explanation */}
      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="bg-stone-50 border border-stone-300 rounded-xl p-6 sm:p-8 shadow-2xs">
          <h3 className="text-lg font-serif font-bold text-stone-900 mb-4 text-center sm:text-left">
            Standard Safety Alert Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Critical Hazard (&lt; 100m)
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-2 leading-relaxed">
                High emergency alert. Immediate risk to pedestrians, grazing livestock, and school children. Avoid unlit paths.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Nearby Open Well (&lt; 500m)
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                Elevated vigilance required. Unbarricaded casing or irrigation pit situated in your adjoining parcel.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Verified Safe / Capped
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                Structure verified with welded iron cover and approved by Mandal revenue officer. Zero hazard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Direct Citizen Report Intervention Section */}
      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-[#7E302A] text-white rounded-2xl p-6 sm:p-10 border border-stone-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-rose-600/30 border border-rose-500/40 rounded-md text-rose-300 text-xs font-mono font-bold uppercase tracking-wider">
              <AlertTriangle size={13} />
              <span>Immediate Public Intervention</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Spotted an Uncovered or Abandoned Borewell?
            </h3>
            <p className="text-sm text-stone-300 max-w-xl">
              Do not leave it unmarked. Submit a geo-tagged report with photo evidence in under 60 seconds to notify nearby residents and dispatch the Mandal Revenue Office.
            </p>
          </div>
          <button
            onClick={onReportHazard}
            className="px-8 py-4 bg-[#B84A3A] hover:bg-[#94382B] active:bg-[#7E302A] text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-xl transition flex items-center space-x-2.5 cursor-pointer shrink-0 border-2 border-white/30 hover:scale-105 transform"
          >
            <AlertTriangle size={20} className="text-white shrink-0" />
            <span>Report Unsafe Borewell</span>
          </button>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto border-t border-stone-300 bg-stone-100 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.jpg"
              alt="Kaal Kuaan Logo"
              className="w-9 h-9 rounded-lg object-cover shadow-sm border border-stone-300"
            />
            <div>
              <span className="font-serif font-bold text-stone-900 text-sm">KAAL KUAAN</span>
              <span className="mx-2">•</span>
              <span>The Wells That Wait</span>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Public safety technology for Telangana under the WALTA Act, 2002 framework.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onReportHazard}
              className="px-3 py-1.5 bg-[#B84A3A] hover:bg-[#94382B] text-white font-bold uppercase tracking-wider text-[11px] rounded-md shadow-sm transition flex items-center space-x-1 cursor-pointer"
            >
              <AlertTriangle size={12} />
              <span>Report Unsafe Borewell</span>
            </button>
            <button
              onClick={onSignIn}
              className="text-stone-700 hover:text-stone-900 font-semibold uppercase tracking-wider text-[11px]"
            >
              Citizen Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
