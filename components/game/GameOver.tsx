"use client";
import { ClientGameState } from "@/types/game";
import { useRouter } from "next/navigation";
import { EmberParticles } from "@/components/animations/EmberParticles";

interface GameOverProps {
  gameState: ClientGameState;
  mySessionId: string | null;
}

export function GameOver({ gameState, mySessionId }: GameOverProps) {
  const router = useRouter();
  const winner = gameState.players.find(p => p.sessionId === gameState.winner);
  const iWon = gameState.winner === mySessionId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <EmberParticles count={iWon ? 30 : 8} />
      <div className="relative z-10 text-center px-4 animate-bounce-in max-w-md w-full">
        {iWon ? (
          <>
            <div className="text-8xl mb-4 animate-lava-pulse">🏆</div>
            <h2 className="font-display text-5xl text-gold drop-shadow-[0_0_30px_rgba(255,181,71,0.8)]">
              KAMU MENANG!
            </h2>
            <p className="text-cream mt-3 text-lg">Semua kucing lain sudah meledak! 🌋</p>
          </>
        ) : (
          <>
            <div className="text-8xl mb-4">💀</div>
            <h2 className="font-display text-5xl text-ember">GAME OVER</h2>
            {winner && (
              <p className="text-cream mt-3 text-lg">
                <span className="text-gold font-display">{winner.username}</span> menang!
              </p>
            )}
          </>
        )}

        <div className="mt-8 bg-obsidian-3 border border-card-border rounded-2xl p-4 mb-6">
          <h3 className="font-display text-ash text-sm tracking-wide mb-3">Hasil Akhir</h3>
          <div className="flex flex-col gap-2">
            {gameState.players.map((p, i) => (
              <div key={p.sessionId} className="flex items-center gap-3 text-sm">
                <span className="text-ash w-5">{i + 1}.</span>
                <span className={p.sessionId === gameState.winner ? "text-gold font-display" : "text-ash"}>
                  {p.username}
                </span>
                {p.sessionId === gameState.winner && <span className="ml-auto">🏆</span>}
                {!p.isAlive && p.sessionId !== gameState.winner && <span className="ml-auto">💀</span>}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full py-4 rounded-xl font-display text-xl text-white bg-lava-gradient hover:shadow-lava-glow transition-all active:scale-95"
        >
          🏠 Kembali ke Menu
        </button>
      </div>
    </div>
  );
}
