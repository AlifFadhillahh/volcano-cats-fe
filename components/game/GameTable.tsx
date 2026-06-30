"use client";
import { useEffect, useState, useRef } from "react";
import { ClientGameState, PendingAction } from "@/types/game";
import { GameCard, CardDeckStack } from "@/components/game/GameCard";
import { TurnTimer } from "@/components/game/TurnTimer";
import { useGameStore } from "@/store/gameStore";
import clsx from "clsx";

// ============================================================
// FreezeCountdownButton
// ============================================================
function FreezeCountdownButton({ onFreeze, freezeWindowEndsAt }: {
  onFreeze: () => void;
  freezeWindowEndsAt?: number;
}) {
  const [remainingMs, setRemainingMs] = useState<number>(4000);
  const endsAtRef = useRef(freezeWindowEndsAt);

  useEffect(() => {
    endsAtRef.current = freezeWindowEndsAt;
    const endTs = freezeWindowEndsAt;
    if (!endTs) return;
    const tick = () => setRemainingMs(Math.max(0, endTs - Date.now()));
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [freezeWindowEndsAt]);

  const progress = Math.max(0, Math.min(1, remainingMs / 4000));
  const secondsLeft = Math.ceil(remainingMs / 1000);

  return (
    <button
      onClick={onFreeze}
      className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl
                 bg-blue-500/25 border-2 border-blue-300 text-blue-100
                 hover:bg-blue-500/40 active:scale-95 transition-all duration-150
                 shadow-[0_0_24px_rgba(133,193,233,0.4)] animate-bounce-in"
    >
      <span className="text-3xl">❄️</span>
      <span className="font-display text-sm tracking-wide">Freeze!</span>
      <div className="w-14 h-1.5 bg-blue-900/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-300 rounded-full transition-[width] duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-blue-300/80 font-mono">{secondsLeft}s</span>
    </button>
  );
}

// ============================================================
// PlayerCard — avatar redesign ala referensi
// ============================================================
function PlayerCard({
  player, isCurrentTurn, isMe, isDying, targeting, onClick,
}: {
  player: ClientGameState["players"][0];
  isCurrentTurn: boolean;
  isMe: boolean;
  isDying: boolean;
  targeting: boolean;
  onClick?: () => void;
}) {
  const initials = player.username.slice(0, 2).toUpperCase();
  const colors = ["#FF5C1A","#FFB547","#5CE0FF","#B05CFF","#5CFF8A","#FF5C8A","#5C8AFF","#8AFF5C"];
  const color = colors[player.username.charCodeAt(0) % colors.length];
  const statusIcon = !player.connected ? "📡" : player.away ? "😴" : null;

  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-1.5 transition-all duration-300 select-none",
        !player.isAlive && "opacity-30",
        targeting && player.isAlive && !isMe && "cursor-pointer",
        isDying && "animate-death-flash",
      )}
      onClick={targeting && player.isAlive && !isMe ? onClick : undefined}
    >
      {/* Avatar box */}
      <div
        className={clsx(
          "relative rounded-2xl overflow-hidden flex items-center justify-center",
          "border-2 transition-all duration-200",
          isCurrentTurn && "scale-110",
          targeting && player.isAlive && !isMe && "ring-2 ring-gold ring-offset-1 ring-offset-obsidian",
        )}
        style={{
          width: 68,
          height: 72,
          background: `linear-gradient(145deg, ${color}22, ${color}08)`,
          borderColor: isCurrentTurn ? color : (player.isAlive ? color + "66" : "#3A3A55"),
          boxShadow: isCurrentTurn ? `0 0 20px ${color}55` : "none",
        }}
      >
        <span className="font-display text-2xl" style={{ color }}>
          {player.isAlive ? initials : "💀"}
        </span>

        {/* Status overlay */}
        {statusIcon && player.isAlive && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-xl">
            {statusIcon}
          </div>
        )}

        {/* Bunker badge */}
        {player.hasBunker && (
          <div className="absolute top-0.5 right-0.5 text-xs leading-none">🛡️</div>
        )}
        {/* Lockdown badge */}
        {player.isLocked && (
          <div className="absolute bottom-0.5 right-0.5 text-xs leading-none">🔒</div>
        )}

        {/* Current turn glow ring */}
        {isCurrentTurn && (
          <div
            className="absolute inset-0 rounded-2xl animate-lava-pulse pointer-events-none"
            style={{ boxShadow: `inset 0 0 0 2px ${color}` }}
          />
        )}
      </div>

      {/* Name + card count */}
      <div className="text-center" style={{ maxWidth: 80 }}>
        <p className={clsx(
          "font-display text-[11px] leading-tight truncate",
          isMe ? "text-gold" : isCurrentTurn ? "text-cream" : "text-ash-light",
        )}>
          {player.username}{isMe ? " ★" : ""}
        </p>
        <p className="text-[9px] font-mono mt-0.5" style={{ color: color + "99" }}>
          {!player.isAlive
            ? "💀"
            : !player.connected
            ? "offline"
            : player.away
            ? "away"
            : `${player.handCount} cards`}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Main GameTable
// ============================================================
interface GameTableProps {
  gameState: ClientGameState;
  mySessionId: string;
  onDrawCard: () => void;
  canDraw: boolean;
  onSelectTarget?: (targetId: string) => void;
  targetingMode: boolean;
  isMyTurn: boolean;
  amILocked: boolean;
  myHandHasFreeze: boolean;
  onFreeze: () => void;
  pendingAction: PendingAction | null;
}

export function GameTable({
  gameState, mySessionId, onDrawCard, canDraw,
  onSelectTarget, targetingMode, isMyTurn, amILocked,
  myHandHasFreeze, onFreeze, pendingAction,
}: GameTableProps) {
  const { deadPlayers, isShaking } = useGameStore();

  const otherPlayers = gameState.players.filter(p => p.sessionId !== mySessionId);
  const myPlayer = gameState.players.find(p => p.sessionId === mySessionId);
  const currentTurnId = gameState.turnOrder[gameState.currentTurnIndex];
  const currentPlayer = gameState.players.find(p => p.sessionId === currentTurnId);
  const lastDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  const showFreezeButton =
    pendingAction?.type === "AWAITING_FREEZE" &&
    pendingAction.initiatorId !== mySessionId &&
    myHandHasFreeze &&
    Boolean(myPlayer?.isAlive);

  // Spread other players horizontally above the table
  const positions = otherPlayers.map((_, i) => {
    const total = otherPlayers.length;
    if (total === 1) return { x: 0, y: 0 };
    const t = total > 1 ? i / (total - 1) : 0.5;
    const x = (t - 0.5) * Math.min(total * 80, 300);
    const y = Math.sin(t * Math.PI) * -20;
    return { x, y };
  });

  return (
    <div className={clsx(
      "relative flex-1 flex flex-col items-center justify-center pb-44 pt-2",
      isShaking && "animate-shake",
    )}>

      {/* ── FELT TABLE ─────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center"
        style={{ width: "min(580px, 96vw)", minHeight: 320 }}
      >
        {/* Oval felt */}
        <div
          className="absolute inset-0 rounded-[48%_48%_50%_50%/38%_38%_62%_62%]"
          style={{
            background: "radial-gradient(ellipse at 50% 45%, #1b3d28 0%, #0f2318 65%, #091810 100%)",
            border: "7px solid #3d2a18",
            boxShadow: "0 12px 48px rgba(0,0,0,0.85), inset 0 1px 6px rgba(255,255,255,0.04), inset 0 -4px 16px rgba(0,0,0,0.4)",
          }}
        />

        {/* Subtle felt grain lines */}
        <div
          className="absolute inset-6 rounded-[50%] opacity-5 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 12px)",
          }}
        />

        {/* Direction label inside felt */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-20 text-white select-none">
          {gameState.turnDirection === 1 ? "↻ Clockwise" : "↺ Counter-clockwise"}
        </div>

        {/* ── OTHER PLAYERS ── */}
        <div className="relative w-full flex justify-center" style={{ height: 104, zIndex: 20 }}>
          {otherPlayers.map((player, i) => (
            <div
              key={player.sessionId}
              className="absolute transition-all duration-500"
              style={{
                left: `calc(50% + ${positions[i].x}px)`,
                top: `${12 + (positions[i].y ?? 0)}px`,
                transform: "translateX(-50%)",
                zIndex: player.sessionId === currentTurnId ? 30 : 20,
              }}
            >
              <PlayerCard
                player={player}
                isCurrentTurn={player.sessionId === currentTurnId}
                isMe={false}
                isDying={deadPlayers.includes(player.sessionId)}
                targeting={targetingMode}
                onClick={() => onSelectTarget?.(player.sessionId)}
              />
            </div>
          ))}
        </div>

        {/* ── CENTER: TURN BADGE + DECK + TIMER ── */}
        <div className="relative flex flex-col items-center gap-3 py-3" style={{ zIndex: 15 }}>

          {/* Turn badge */}
          {isMyTurn ? (
            <div className="bg-gold/20 border border-gold/60 rounded-full px-5 py-1 shadow-gold-glow animate-bounce-in">
              <span className="font-display text-gold text-sm tracking-widest">
                ★ YOUR TURN!{gameState.pendingTurns > 1 ? ` ×${gameState.pendingTurns}` : ""}
              </span>
            </div>
          ) : currentPlayer ? (
            <div className="bg-black/30 border border-white/10 rounded-full px-3 py-0.5">
              <span className="text-ash-light text-xs font-display">
                {currentPlayer.username}&apos;s turn
              </span>
            </div>
          ) : null}

          {/* Deck + Discard row */}
          <div className="flex items-end gap-6">
            {/* Discard */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-20 h-28 rounded-xl border border-dashed border-white/15 flex items-center justify-center">
                {lastDiscard ? (
                  <div className="animate-card-deal">
                    <GameCard card={lastDiscard} small disabled />
                  </div>
                ) : (
                  <span className="text-white/15 text-[10px] font-mono">empty</span>
                )}
              </div>
              <span className="text-white/25 text-[9px] font-mono uppercase tracking-wide">
                {gameState.discardPile.length} discarded
              </span>
            </div>

            {/* Draw deck */}
            <div className="flex flex-col items-center gap-1">
              <CardDeckStack
                count={gameState.deckCount}
                onClick={canDraw ? onDrawCard : undefined}
                highlight={amILocked && isMyTurn}
              />
              <span className={clsx(
                "text-[11px] font-display tracking-widest uppercase mt-0.5",
                canDraw
                  ? amILocked
                    ? "text-ember animate-glow-pulse"
                    : "text-lava animate-glow-pulse"
                  : "text-white/20"
              )}>
                DRAW
              </span>
            </div>

            {/* Freeze button */}
            {showFreezeButton && (
              <FreezeCountdownButton
                onFreeze={onFreeze}
                freezeWindowEndsAt={pendingAction?.freezeWindowEndsAt}
              />
            )}
          </div>

          {/* Turn timer */}
          <div style={{ width: 200 }}>
            <TurnTimer
              turnEndsAt={gameState.turnEndsAt}
              isMyTurn={isMyTurn}
              isLocked={amILocked}
              currentPlayerName={currentPlayer?.username}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
