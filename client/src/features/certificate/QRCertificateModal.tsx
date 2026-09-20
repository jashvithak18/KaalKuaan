import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Well } from '../../types';
import { X, Printer, ShieldCheck, CheckCircle2, Download } from 'lucide-react';

interface QRCertificateModalProps {
  well: Well | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCertificateModal: React.FC<QRCertificateModalProps> = ({
  well,
  isOpen,
  onClose
}) => {
  if (!isOpen || !well) return null;

  const cert = well.qrCertificate || {
    certificateId: `CERT-NL-2026-${well.surveyNumber.replace('/', '')}`,
    issuedAt: new Date().toISOString(),
    officer: 'Vemulapally Gram Panchayat Safety Authority',
    verificationId: 'KV-928182',
    sealHash: '4C91A07E81BF99D2'
  };

  const verifyUrl = `${window.location.origin}/verify/${well.wellId}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-carbon/80 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm">
      <div className="bg-parchment w-full max-w-xl border-2 border-carbon shadow-panel overflow-hidden flex flex-col">
        {/* Modal Top Controls (Hidden in Print) */}
        <div className="bg-carbon text-parchment px-4 py-2.5 flex items-center justify-between print:hidden">
          <div className="text-xs font-mono font-bold text-safety-amber">
            PHYSICAL ON-SITE SAFETY CERTIFICATE
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-parchment text-carbon hover:bg-parchment-dark text-xs font-mono font-bold flex items-center gap-1 border border-carbon"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT SITE TAG</span>
            </button>
            <button onClick={onClose} className="p-1 text-parchment/70 hover:text-parchment">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Physical Inspection Certificate Canvas */}
        <div className="p-6 md:p-8 bg-parchment-surface border-8 border-double border-carbon m-3 font-serif relative">
          {/* Watermark / Background stamp */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="w-64 h-64 border-8 border-carbon rounded-full flex items-center justify-center">
              <div className="text-4xl font-bold font-mono">SEALED SAFE</div>
            </div>
          </div>

          {/* Certificate Header */}
          <div className="text-center pb-4 border-b-2 border-carbon">
            <div className="text-xs font-mono tracking-widest text-earth uppercase font-bold">
              DISTRICT BOREWELL SAFETY & CAPPING REGISTER • TELANGANA
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-carbon mt-1">
              KAAL KUAAN
            </h2>
            <div className="text-xs font-mono tracking-widest text-carbon uppercase font-bold mt-0.5">
              OFFICIAL CERTIFICATE OF SAFE CAPPING
            </div>
          </div>

          {/* Status Stamp */}
          <div className="flex justify-between items-center my-4">
            <div className="paper-stamp-safe text-sm">
              VERIFIED SAFE / CAPPED
            </div>
            <div className="font-mono text-xs text-earth">
              CERTIFICATE NO: <strong className="text-carbon">{cert.certificateId}</strong>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono border-t border-b border-[#DDD7C7] py-4 my-2">
            <div>
              <span className="text-earth block text-[10px] uppercase">WELL IDENTIFIER</span>
              <strong className="text-carbon text-sm">{well.wellId}</strong>
            </div>
            <div>
              <span className="text-earth block text-[10px] uppercase">CADASTRAL PLOT</span>
              <strong className="text-carbon text-sm">Sy. No. {well.surveyNumber}</strong>
            </div>
            <div>
              <span className="text-earth block text-[10px] uppercase">VILLAGE / MANDAL</span>
              <strong className="text-carbon">{well.village}, {well.mandal}</strong>
            </div>
            <div>
              <span className="text-earth block text-[10px] uppercase">DISTRICT</span>
              <strong className="text-carbon">{well.district}</strong>
            </div>
            <div>
              <span className="text-earth block text-[10px] uppercase">VERIFICATION PROTOCOL</span>
              <strong className="text-carbon">{cert.verificationId}</strong>
            </div>
            <div>
              <span className="text-earth block text-[10px] uppercase">DATE CERTIFIED</span>
              <strong className="text-carbon">{new Date(cert.issuedAt).toLocaleDateString()}</strong>
            </div>
          </div>

          {/* QR Code & Authority Sign-off */}
          <div className="flex items-center justify-between pt-3">
            {/* QR Code Box */}
            <div className="p-2 bg-white border border-carbon flex flex-col items-center">
              <QRCodeSVG value={verifyUrl} size={92} level="H" />
              <div className="text-[9px] font-mono text-carbon mt-1 font-bold">SCAN TO VERIFY</div>
            </div>

            {/* Official Seal / Signatures */}
            <div className="text-right space-y-1 text-xs font-mono">
              <div className="text-[10px] text-earth">AUTHORIZED ENFORCEMENT DESK:</div>
              <div className="font-bold text-carbon">{cert.officer}</div>
              <div className="text-[10px] text-earth">Cryptographic Seal Hash:</div>
              <div className="text-[9px] font-mono text-carbon bg-parchment px-1 border border-[#DDD7C7]">
                {cert.sealHash}
              </div>
              <div className="pt-2 text-[10px] text-[#8C8370] italic">
                Affix weatherproof laminated copy within 1m of well perimeter.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
