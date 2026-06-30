"use client";
import { ClientGameState } from "@/types/game";
import { useRouter } from "next/navigation";
import { EmberParticles } from "@/components/animations/EmberParticles";
import clsx from "clsx";

interface GameOverProps {
  gameState: ClientGameState;
  mySessionId: string | null;
  onLeave?: () => void;
}

export function GameOver({ gameState, mySessionId, onLeave }: GameOverProps) {
  const router = useRouter();
  const winner = gameState.players.find(p => p.sessionId === gameState.winner);
  const iWon = gameState.winner === mySessionId;
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (a.sessionId === gameState.winner) return -1;
    if (b.sessionId === gameState.winner) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/95 backdrop-blur-md">
      <EmberParticles count={iWon ? 20 : 5} />

      <div className="relative z-10 w-full max-w-sm mx-4 animate-bounce-in">
        {/* Result header */}
        <div className={clsx(
          "text-center py-8 rounded-t-2xl border-x border-t",
          iWon
            ? "bg-gradient-to-b from-gold/10 to-[#0d1117] border-gold/30"
            : "bg-gradient-to-b from-ember/10 to-[#0d1117] border-[#1e2530]"
        )}>
          <div className="text-6xl mb-3">{iWon ? "🏆" : "💀"}</div>
          <h2 className={clsx(
            "font-display text-4xl",
            iWon ? "text-gold" : "text-ember"
          )}>
            {iWon ? "YOU WIN!" : "GAME OVER"}
          </h2>
          {!iWon && winner && (
            <p className="text-ash text-sm mt-2 font-mono">
              <span className="text-gold">{winner.username}</span> wins!
            </p>
          )}
        </div>

        {/* Results table */}
        <div className="bg-[#0d1117] border-x border-[#1e2530] p-4">
          <p className="text-[10px] font-mono text-[#4a5568] uppercase tracking-widest mb-3">Results</p>
          <div className="space-y-1.5">
            {sortedPlayers.map((p, i) => {
              const colors = ["#FF5C1A","#FFB547","#5CE0FF","#B05CFF","#5CFF8A"];
              const color = colors[p.username.charCodeAt(0) % colors.length];
              const isWinner = p.sessionId === gameState.winner;
              const isMe = p.sessionId === mySessionId;

              return (
                <div key={p.sessionId}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-xl",
                    isWinner ? "bg-gold/8 border border-gold/20" : "bg-[#0a0e14]"
                  )}>
                  <span className="font-mono text-[#4a5568] text-xs w-4">{i + 1}.</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display text-xs"
                    style={{ background: color + "22", color }}>
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={clsx(
                    "font-mono text-sm flex-1",
                    isWinner ? "text-gold" : "text-ash-light"
                  )}>
                    {p.username}
                    {isMe && <span className="text-[#4a5568] ml-1">(you)</span>}
                  </span>
                  <span className="text-base">
                    {isWinner ? "🏆" : "💀"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave button */}
        <div className="bg-[#0d1117] border border-[#1e2530] rounded-b-2xl p-4">
          <button
            onClick={() => { onLeave?.(); router.push("/"); }}
            className="w-full py-3.5 rounded-xl font-display text-base tracking-wide
                       bg-lava-gradient text-white hover:shadow-lava-glow
                       transition-all active:scale-95"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
