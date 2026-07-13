import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Download, Share2, MessageCircle, X } from 'lucide-react';

function MemberCard({ member, onClose }) {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = async () => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      return canvas.toDataURL('image/png');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `carte_${member.first_name}_${member.last_name}.png`;
    link.click();
  };

  const handleWhatsApp = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    // Télécharger l'image d'abord
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `carte_${member.first_name}_${member.last_name}.png`;
    link.click();

    // Ouvrir WhatsApp Web avec message pré-rempli
    const phone = member.phone ? member.phone.replace(/\D/g, '') : '';
    const text = encodeURIComponent(
      `Bonjour ${member.first_name}, voici votre carte membre pour la salle de sport. Merci de la présenter à l'entrée !`
    );
    const waUrl = phone
      ? `https://wa.me/${phone}?text=${text}`
      : `https://web.whatsapp.com/send?text=${text}`;

    // Essayer Web Share API d'abord (mobile)
    if (navigator.share && navigator.canShare) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `carte_${member.first_name}_${member.last_name}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Carte Membre',
            text: `Carte membre de ${member.first_name} ${member.last_name}`,
            files: [file],
          });
          return;
        }
      } catch (e) {
        // fallback
      }
    }

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Carte Membre</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-5 flex justify-center bg-gray-50">
          <div
            ref={cardRef}
            className="relative w-[320px] h-[200px] rounded-2xl overflow-hidden shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3d7ab5 100%)',
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5" />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

            {/* Content */}
            <div className="relative z-10 p-4 h-full flex flex-col justify-between">
              {/* Logo area */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-bold text-xs">SS</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">SALLE DE SPORT</p>
                    <p className="text-white/70 text-[10px] leading-tight">MEMBER ACCESS</p>
                  </div>
                </div>
                <span className="text-white/60 text-[10px] font-mono">{member.member_number}</span>
              </div>

              {/* Body: info left, QR right */}
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl border-2 border-white/40 overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                      {member.photo ? (
                        <img src={member.photo} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {(member.first_name?.[0] || '') + (member.last_name?.[0] || '')}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-base leading-snug whitespace-nowrap">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-white/70 text-xs mt-1 leading-normal whitespace-nowrap">{member.phone || '---'}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`w-2 h-2 rounded-full ${member.status === 'Actif' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-white/80 text-[10px] uppercase tracking-wider">{member.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-2 shadow-lg shrink-0">
                  <QRCodeSVG
                    value={member.qr_code || member.member_number || ''}
                    size={72}
                    bgColor="#ffffff"
                    fgColor="#1e3a5f"
                    level="M"
                  />
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="h-0.5 w-full bg-gradient-to-r from-white/0 via-white/25 to-white/0" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Génération...' : 'Télécharger la carte'}
          </button>

          <button
            onClick={handleWhatsApp}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4" />
            Envoyer par WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberCard;
