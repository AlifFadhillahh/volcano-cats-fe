"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { EmberParticles } from "@/components/animations/EmberParticles";

export default function HomePage() {
  const router = useRouter();
  const { setUsername, setRoomId, username } = useGameStore();
  const [nameInput, setNameInput] = useState(username || "");
  const [roomInput, setRoomInput] = useState("");
  const [mode, setMode] = useState<"home" | "join">("home");
  const [error, setError] = useState("");

  // Load saved username
  useEffect(() => {
    const saved = localStorage.getItem("vc_username");
    if (saved) setNameInput(saved);
  }, []);

  function handleCreate() {
    const name = nameInput.trim();
    if (!name) { setError("Masukkan username dulu!"); return; }
    localStorage.setItem("vc_username", name);
    setUsername(name);
    // Room ID dibuat di halaman room saat connect
    const newRoomId = Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoomId(newRoomId);
    router.push(`/room/${newRoomId}?create=true`);
  }

  function handleJoin() {
    const name = nameInput.trim();
    const code = roomInput.trim().toUpperCase();
    if (!name) { setError("Masukkan username dulu!"); return; }
    if (!code || code.length < 4) { setError("Masukkan kode room yang valid!"); return; }
    localStorage.setItem("vc_username", name);
    setUsername(name);
    setRoomId(code);
    router.push(`/room/${code}`);
  }

  return (
    <div className="relative min-h-screen bg-obsidian flex flex-col items-center justify-center overflow-hidden">
      <EmberParticles count={18} />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-lava/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-ember/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-md">
        {/* Logo */}
        <div className="text-center select-none">
          <div className="text-8xl mb-2 animate-bounce-in" style={{ animationDelay: "0.1s" }}>🌋</div>
          <h1 className="font-display text-6xl text-lava tracking-wide drop-shadow-[0_0_20px_rgba(255,92,26,0.5)]">
            VOLCANO
          </h1>
          <h1 className="font-display text-6xl text-gold tracking-wide">
            CATS
          </h1>
          <p className="mt-2 text-ash text-sm tracking-widest uppercase">
            Multiplayer Card Game • 2–10 Pemain
          </p>
        </div>

        {/* Form */}
        <div className="w-full bg-obsidian-3 border border-card-border rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
          {/* Username */}
          <label className="block text-ash text-xs uppercase tracking-widest mb-2">Username</label>
          <input
            type="text"
            maxLength={20}
            placeholder="Nama panggilanmu..."
            value={nameInput}
            onChange={e => { setNameInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && (mode === "join" ? handleJoin() : handleCreate())}
            className="w-full bg-obsidian-2 border border-card-border rounded-xl px-4 py-3 text-cream placeholder-ash/50
                       focus:outline-none focus:border-lava focus:shadow-[0_0_0_2px_rgba(255,92,26,0.2)]
                       transition-all duration-200 mb-4"
          />

          {mode === "join" && (
            <>
              <label className="block text-ash text-xs uppercase tracking-widest mb-2">Kode Room</label>
              <input
                type="text"
                maxLength={8}
                placeholder="Contoh: XK92BV"
                value={roomInput}
                onChange={e => { setRoomInput(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleJoin()}
                className="w-full bg-obsidian-2 border border-card-border rounded-xl px-4 py-3 text-cream placeholder-ash/50
                           font-display tracking-widest text-center text-xl
                           focus:outline-none focus:border-gold focus:shadow-[0_0_0_2px_rgba(255,181,71,0.2)]
                           transition-all duration-200 mb-4 uppercase"
              />
            </>
          )}

          {error && (
            <p className="text-ember text-sm mb-3 text-center animate-slide-up">⚠️ {error}</p>
          )}

          <div className="flex flex-col gap-3">
            {mode === "home" ? (
              <>
                <button
                  onClick={handleCreate}
                  className="w-full py-4 rounded-xl font-display text-lg tracking-wide text-white
                             bg-lava-gradient hover:shadow-lava-glow
                             transition-all duration-200 active:scale-95"
                >
                  🌋 Buat Room Baru
                </button>
                <button
                  onClick={() => setMode("join")}
                  className="w-full py-3 rounded-xl font-display text-base tracking-wide
                             border border-card-border text-ash-light hover:border-gold hover:text-gold
                             transition-all duration-200 active:scale-95"
                >
                  🔗 Join Room
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleJoin}
                  className="w-full py-4 rounded-xl font-display text-lg tracking-wide text-obsidian
                             bg-gold-gradient hover:shadow-gold-glow
                             transition-all duration-200 active:scale-95"
                >
                  ✅ Join Sekarang
                </button>
                <button
                  onClick={() => { setMode("home"); setError(""); }}
                  className="w-full py-3 rounded-xl font-display text-base tracking-wide
                             border border-card-border text-ash hover:border-ash-light hover:text-ash-light
                             transition-all duration-200"
                >
                  ← Kembali
                </button>
              </>
            )}
          </div>
        </div>

        {/* Card legend hints */}
        <div className="flex gap-3 text-xs text-ash text-center opacity-60">
          <span>🌋 Jangan draw Lava Cat</span>
          <span>•</span>
          <span>💧 Water Bucket = selamat</span>
          <span>•</span>
          <span>🏆 Terakhir bertahan menang</span>
        </div>
      </div>
    </div>
  );
}
