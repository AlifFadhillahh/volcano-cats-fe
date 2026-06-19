"use client";
import { useState } from "react";
import { ClientGameState } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import clsx from "clsx";

interface LobbyProps {
  gameState: ClientGameState;
  roomId: string;
  onStartGame: () => void;
}

export function Lobby({ gameState, roomId, onStartGame }: LobbyProps) {
  const { mySessionId } = useGameStore();
  const [copied, setCopied] = useState(false);
  const isHost = mySessionId === gameState.hostId;
  const canStart = gameState.players.length >= 2;

  function copyLink() {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-4 py-8">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lava/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-lava">🌋 VOLCANO CATS</h1>
          <p className="text-ash text-sm mt-1">Lobby • Menunggu pemain...</p>
        </div>

        {/* Room code */}
        <div className="bg-obsidian-3 border border-card-border rounded-2xl p-5 mb-4">
          <p className="text-ash text-xs uppercase tracking-widest mb-2 text-center">Kode Room</p>
          <div
            className="font-display text-4xl text-gold text-center tracking-[0.3em] cursor-pointer
                       hover:text-lava transition-colors py-2"
            onClick={copyCode}
          >
            {roomId}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={copyCode}
              className="flex-1 py-2 rounded-xl border border-card-border text-ash hover:border-gold hover:text-gold
                         text-sm transition-all"
            >
              {copied ? "✅ Tersalin!" : "📋 Copy Kode"}
            </button>
            <button
              onClick={copyLink}
              className="flex-1 py-2 rounded-xl border border-card-border text-ash hover:border-gold hover:text-gold
                         text-sm transition-all"
            >
              🔗 Copy Link
            </button>
          </div>
        </div>

        {/* Players list */}
        <div className="bg-obsidian-3 border border-card-border rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-cream text-sm tracking-wide">Pemain</h3>
            <span className="text-ash text-xs">{gameState.players.length}/10</span>
          </div>
          <div className="flex flex-col gap-2">
            {gameState.players.map((player) => (
              <div
                key={player.sessionId}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-xl",
                  player.sessionId === mySessionId
                    ? "bg-lava/10 border border-lava/30"
                    : "bg-obsidian-2",
                )}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display text-sm"
                  style={{ background: `hsl(${player.username.charCodeAt(0) * 15},60%,40%)` }}
                >
                  {player.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-body text-cream text-sm flex-1">{player.username}</span>
                <div className="flex gap-1">
                  {player.sessionId === gameState.hostId && (
                    <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold rounded-full font-display">HOST</span>
                  )}
                  {player.sessionId === mySessionId && (
                    <span className="text-xs px-2 py-0.5 bg-lava/20 text-lava rounded-full font-display">KAMU</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {gameState.players.length < 10 && (
            <p className="text-ash text-xs text-center mt-3">
              Tunggu teman join, atau mulai dengan {gameState.players.length} pemain
            </p>
          )}
        </div>

        {/* Start button */}
        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={clsx(
              "w-full py-4 rounded-xl font-display text-xl tracking-wide transition-all active:scale-95",
              canStart
                ? "bg-lava-gradient text-white hover:shadow-lava-glow"
                : "bg-obsidian-3 text-ash cursor-not-allowed border border-card-border"
            )}
          >
            {canStart ? "🌋 Mulai Game!" : `Butuh minimal 2 pemain (${gameState.players.length}/2)`}
          </button>
        ) : (
          <div className="text-center py-4 text-ash animate-pulse">
            ⏳ Menunggu host memulai game...
          </div>
        )}
      </div>
    </div>
  );
}
