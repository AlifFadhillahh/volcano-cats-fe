"use client";
import { useState } from "react";
import { ClientGameState } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import clsx from "clsx";

interface LobbyProps {
  gameState: ClientGameState;
  roomId: string;
  onStartGame: () => void;
  onKick?: (sessionId: string) => void;
}

export function Lobby({ gameState, roomId, onStartGame, onKick }: LobbyProps) {
  const { mySessionId } = useGameStore();
  const [copied, setCopied] = useState(false);
  const isHost = mySessionId === gameState.hostId;
  const canStart = gameState.players.length >= 2;

  function copyCode() {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }
  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-lava/20 border border-lava/40 flex items-center justify-center">
          🌋
        </div>
        <div>
          <p className="font-mono text-[10px] text-[#4a5568] uppercase tracking-widest">Volcano Cats</p>
          <h1 className="font-display text-2xl text-lava leading-tight">Lobby</h1>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {/* Room code card */}
        <div className="bg-[#0d1117] border border-[#1e2530] rounded-2xl p-4">
          <p className="text-[10px] font-mono text-[#4a5568] uppercase tracking-widest mb-2">Room Code</p>
          <p className="font-mono text-3xl text-cream tracking-[0.2em] text-center py-2 cursor-pointer hover:text-gold transition-colors"
            onClick={copyCode}>
            {roomId}
          </p>
          <div className="flex gap-2 mt-2">
            <button onClick={copyCode}
              className="flex-1 py-2 rounded-xl bg-[#1e2530] text-[#4a5568] hover:text-cream text-xs font-mono transition-colors">
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
            <button onClick={copyLink}
              className="flex-1 py-2 rounded-xl bg-[#1e2530] text-[#4a5568] hover:text-cream text-xs font-mono transition-colors">
              Copy Link
            </button>
          </div>
        </div>

        {/* Players list */}
        <div className="bg-[#0d1117] border border-[#1e2530] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-mono text-[#4a5568] uppercase tracking-widest">Players</p>
            <p className="text-[10px] font-mono text-[#4a5568]">{gameState.players.length}/10</p>
          </div>

          <div className="space-y-1.5">
            {gameState.players.map((player) => {
              const colors = ["#FF5C1A","#FFB547","#5CE0FF","#B05CFF","#5CFF8A"];
              const color = colors[player.username.charCodeAt(0) % colors.length];
              const isMe = player.sessionId === mySessionId;
              const isPlayerHost = player.sessionId === gameState.hostId;

              return (
                <div key={player.sessionId}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
                    isMe ? "bg-lava/8 border border-lava/20" : "bg-[#0a0e14]"
                  )}>
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm flex-shrink-0"
                    style={{ background: color + "22", color }}>
                    {player.username.slice(0, 2).toUpperCase()}
                  </div>

                  <span className="font-mono text-cream text-sm flex-1 truncate">{player.username}</span>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isPlayerHost && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-gold/15 text-gold rounded">HOST</span>
                    )}
                    {isMe && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-lava/15 text-lava rounded">YOU</span>
                    )}
                    {isHost && !isMe && (
                      <button onClick={() => onKick?.(player.sessionId)}
                        className="text-[9px] font-mono px-1.5 py-0.5 border border-[#2e2028] text-[#6b4050] hover:text-ember hover:border-ember/40 rounded transition-colors">
                        Kick
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {gameState.players.length < 10 && (
            <p className="text-[#4a5568] text-[10px] font-mono text-center mt-3">
              Waiting for players... ({gameState.players.length}/10)
            </p>
          )}
        </div>

        {/* Start button */}
        {isHost ? (
          <button onClick={onStartGame} disabled={!canStart}
            className={clsx(
              "w-full py-4 rounded-xl font-display text-lg tracking-wide transition-all active:scale-95",
              canStart
                ? "bg-lava-gradient text-white hover:shadow-lava-glow"
                : "bg-[#1e2530] text-[#4a5568] cursor-not-allowed"
            )}>
            {canStart ? "Start Game" : `Need ${2 - gameState.players.length} more player(s)`}
          </button>
        ) : (
          <div className="text-center py-4 font-mono text-[#4a5568] text-xs animate-pulse">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
}
