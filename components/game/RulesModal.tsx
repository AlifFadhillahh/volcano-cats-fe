"use client";
import clsx from "clsx";

interface RulesModalProps {
  visible: boolean;
  onClose: () => void;
}

const CARD_RULES = [
  { emoji: "🌋", name: "Lava Cat", color: "#FF5C1A", desc: "Draw ini = MATI, kecuali punya Water Bucket." },
  { emoji: "💧", name: "Water Bucket", color: "#5CE0FF", desc: "Otomatis aktif saat draw Lava Cat. Kamu selamat dan bisa taruh Lava Cat di posisi manapun dalam deck." },
  { emoji: "😴", name: "Nap Time", color: "#B0B0CC", desc: "Skip giliran — tidak perlu draw kartu." },
  { emoji: "🌀", name: "Eruption", color: "#FF8C00", desc: "Skip giliranmu. Pemain berikutnya kena 2 giliran sekaligus." },
  { emoji: "🔭", name: "Spy Cat", color: "#9B59B6", desc: "Lihat 3 kartu teratas deck (rahasia, hanya kamu yang lihat)." },
  { emoji: "🔀", name: "Earthquake", color: "#E67E22", desc: "Acak ulang seluruh deck." },
  { emoji: "❄️", name: "Freeze", color: "#85C1E9", desc: "Batalkan aksi siapapun selama window 4 detik berlangsung. Bisa di-Freeze balik!" },
  { emoji: "🎁", name: "Bribe", color: "#FFB547", desc: "Paksa 1 pemain kasih 1 kartu pilihannya ke kamu." },
  { emoji: "🔄", name: "Reverse", color: "#1ABC9C", desc: "Balik arah urutan giliran (clockwise ↔ counter-clockwise)." },
  { emoji: "🎯", name: "Sniper", color: "#E74C3C", desc: "Pilih 1 pemain — mereka harus draw 1 kartu sekarang juga." },
  { emoji: "👁️", name: "Peek & Swap", color: "#8E44AD", desc: "Lihat kartu teratas deck. Boleh tukar dengan 1 kartu dari tanganmu." },
  { emoji: "🛡️", name: "Bunker", color: "#AAB7B8", desc: "Melindungi dari Lava Cat SAJA. Saat draw Lava Cat, Bunker hancur dan Lava Cat kembali ke deck secara acak. Tidak melindungi dari Sniper, Pickpocket, Flood, dll." },
  { emoji: "💸", name: "Pickpocket", color: "#F39C12", desc: "Ambil 1 kartu ACAK dari tangan pemain pilihanmu. Bunker tidak melindungi." },
  { emoji: "🌊", name: "Flood", color: "#3498DB", desc: "Semua pemain wajib buang 1 kartu pilihan mereka." },
  { emoji: "🪄", name: "Time Warp", color: "#A569BD", desc: "Ambil 1 kartu apapun dari discard pile ke tanganmu." },
  { emoji: "🔒", name: "Lockdown", color: "#BDC3C7", desc: "Pilih 1 pemain — giliran berikutnya mereka tidak bisa main kartu, wajib langsung draw." },
];

const GANG_RULES = [
  { count: "2 kartu sama", label: "Pair", effect: "Steal 1 kartu ACAK dari tangan pemain pilihanmu." },
  { count: "3 kartu sama", label: "Triple", effect: "Steal 1 kartu acak dari target pilihanmu." },
  { count: "4 kartu sama", label: "Quad", effect: "Steal 1 kartu acak dari SEMUA pemain lain sekaligus." },
  { count: "5 kartu berbeda jenis", label: "Rainbow", effect: "Tukar seluruh tangan dengan pemain pilihanmu." },
];

export function RulesModal({ visible, onClose }: RulesModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
      <div
        className="pointer-events-auto w-80 max-h-[calc(100vh-2rem)] bg-obsidian-2 border border-card-border
                   rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-card-border flex-shrink-0">
          <h2 className="font-display text-gold text-sm tracking-wide">📖 Cara Main</h2>
          <button
            onClick={onClose}
            className="text-ash hover:text-cream w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Basic rules */}
          <section>
            <h3 className="font-display text-lava text-xs uppercase tracking-widest mb-2">Aturan Dasar</h3>
            <ul className="space-y-1.5 text-ash">
              <li>• Setiap giliran: mainkan kartu (opsional), lalu <strong className="text-cream">wajib draw 1 kartu</strong></li>
              <li>• Draw <strong className="text-lava">Lava Cat</strong> tanpa Water Bucket = <strong className="text-ember">MATI</strong></li>
              <li>• Pemain terakhir yang bertahan = <strong className="text-gold">MENANG</strong></li>
              <li>• Setiap pemain mulai dengan <strong className="text-cream">6 kartu + 1 Water Bucket</strong></li>
              <li>• Timer 10 detik per giliran — jika habis, otomatis draw</li>
            </ul>
          </section>

          {/* Turn timer */}
          <section>
            <h3 className="font-display text-gold text-xs uppercase tracking-widest mb-2">⏱ Timer Giliran</h3>
            <p className="text-ash">Setiap giliran dibatasi <strong className="text-cream">10 detik</strong>. Timer terlihat di tengah layar. Jika habis, server otomatis draw untuk kamu.</p>
          </section>

          {/* Freeze window */}
          <section>
            <h3 className="font-display text-blue-300 text-xs uppercase tracking-widest mb-2">❄️ Freeze Window</h3>
            <p className="text-ash">Saat seseorang memainkan kartu aksi, ada jendela <strong className="text-cream">4 detik</strong> untuk nge-Freeze dan membatalkannya. Tombol Freeze muncul di sebelah deck. Bisa di-Freeze balik!</p>
          </section>

          {/* Gang cards */}
          <section>
            <h3 className="font-display text-gang-fire text-xs uppercase tracking-widest mb-2">👥 Gang Cards</h3>
            <p className="text-ash mb-2">Kumpulkan kartu Gang sejenis dan kombinasikan:</p>
            <div className="space-y-1.5">
              {GANG_RULES.map(r => (
                <div key={r.label} className="bg-obsidian-3 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-display text-gold text-[10px]">{r.label}</span>
                    <span className="text-ash/60 text-[9px]">{r.count}</span>
                  </div>
                  <p className="text-ash text-[10px]">{r.effect}</p>
                </div>
              ))}
            </div>
          </section>

          {/* All cards */}
          <section>
            <h3 className="font-display text-cream text-xs uppercase tracking-widest mb-2">🃏 Semua Kartu</h3>
            <div className="space-y-2">
              {CARD_RULES.map(card => (
                <div key={card.name} className="flex gap-2.5 items-start">
                  <span className="text-base flex-shrink-0 mt-0.5">{card.emoji}</span>
                  <div>
                    <span className="font-display text-[11px]" style={{ color: card.color }}>{card.name}</span>
                    <p className="text-ash text-[10px] leading-relaxed mt-0.5">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Status icons */}
          <section>
            <h3 className="font-display text-cream text-xs uppercase tracking-widest mb-2">🔖 Status Ikon</h3>
            <div className="space-y-1.5 text-ash text-[10px]">
              <div className="flex gap-2 items-center"><span>🛡️</span> Bunker aktif — terlindung dari Lava Cat</div>
              <div className="flex gap-2 items-center"><span>🔒</span> Terkena Lockdown — giliran ini wajib draw langsung</div>
              <div className="flex gap-2 items-center"><span>😴</span> Away — auto-play aktif</div>
              <div className="flex gap-2 items-center"><span>📡</span> Offline — auto-play aktif</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
