"use client";
import { useEffect, useState } from "react";
import { ClientGameState, PendingAction } from "@/types/game";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { CardDeckStack, GameCard } from "@/components/game/GameCard";
import { TurnTimer } from "@/components/game/TurnTimer";
import { useGameStore } from "@/store/gameStore";
import clsx from "clsx";

// ============================================================
// Freeze Countdown Button — tampil di dalam GameTable sebelah deck
// ============================================================
function FreezeCountdownButton({ onFreeze, freezeWindowEndsAt }: { onFreeze: () => void; freezeWindowEndsAt?: number }) {
  const [remainingMs, setRemainingMs] = useState<number>(
    freezeWindowEndsAt ? Math.max(0, freezeWindowEndsAt - Date.now()) : 4000
  );

  useEffect(() => {
    if (!freezeWindowEndsAt) return;
    const tick = () => setRemainingMs(Math.max(0, freezeWindowEndsAt - Date.now()));
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [freezeWindowEndsAt]);

  const totalMs = 4000;
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
  const secondsLeft = Math.ceil(remainingMs / 1000);

  return (
    <button
      onClick={onFreeze}
      className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl
                 bg-blue-500/20 border-2 border-blue-300 text-blue-200
                 hover:bg-blue-500/30 active:scale-95
                 transition-all duration-150 shadow-[0_0_20px_rgba(133,193,233,0.35)]
                 animate-bounce-in min-w-[72px]"
    >
      <span className="text-2xl">❄️</span>
      <span className="font-display text-xs tracking-wide">Freeze!</span>
      {/* Mini countdown bar */}
      <div className="w-full h-1 bg-blue-900/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-300 rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-blue-300/70">{secondsLeft}s</span>
    </button>
  );
}

interface GameTableProps {
  gameState: ClientGameState;
  mySessionId: string;
  onDrawCard: () => void;
  canDraw: boolean;
  onSelectTarget?: (targetId: string) => void;
  targetingMode: boolean;
  isMyTurn: boolean;
  amILocked: boolean;
  // Freeze props — pindahkan di sini supaya Freeze button dekat deck (lebih terjangkau)
  myHandHasFreeze: boolean;
  onFreeze: () => void;
  pendingAction: PendingAction | null;
}

export function GameTable({
  gameState, mySessionId, onDrawCard, canDraw, onSelectTarget,
  targetingMode, isMyTurn, amILocked,
  myHandHasFreeze, onFreeze, pendingAction,
}: GameTableProps) {
  const { deadPlayers, isShaking } = useGameStore();
  const otherPlayers = gameState.players.filter(p => p.sessionId !== mySessionId);
  const currentTurnId = gameState.turnOrder[gameState.currentTurnIndex];
  const currentPlayer = gameState.players.find(p => p.sessionId === currentTurnId);
  const lastDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  const myPlayer = gameState.players.find(p => p.sessionId === mySessionId);

  const showFreezeButton =
    pendingAction?.type === "AWAITING_FREEZE" &&
    pendingAction.initiatorId !== mySessionId &&
    myHandHasFreeze &&
    myPlayer?.isAlive;

  // Arrange other players in an arc around the top
  const radius = 130;
  const positions = otherPlayers.map((_, i) => {
    const total = otherPlayers.length;
    const angle = total === 1 ? Math.PI / 2 : (Math.PI / (total - 1 || 1)) * i;
    const x = Math.cos(Math.PI - angle) * radius;
    const y = Math.sin(angle) * (radius * 0.5);
    return { x, y };
  });

  return (
    <div className={clsx("relative w-full flex-1 flex flex-col items-center justify-between pt-6 pb-44", isShaking && "animate-shake")}>
      {/* Turn banner */}
      <div className="text-center mb-2 h-8">
        {gameState.pendingTurns > 1 && (
          <p className="text-ember font-display text-sm animate-glow-pulse">
            🌀 {currentPlayer?.username} harus draw {gameState.pendingTurns}x lagi!
          </p>
        )}
      </div>

      {/* Other players arc */}
      <div className="relative w-full max-w-xl h-40 flex items-start justify-center">
        {otherPlayers.map((player, i) => (
          <div
            key={player.sessionId}
            className="absolute transition-all duration-500"
            style={{
              left: `calc(50% + ${positions[i].x}px)`,
              top: `${positions[i].y}px`,
              transform: "translateX(-50%)",
            }}
          >
            <PlayerAvatar
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

      {/* Center table: deck + discard + freeze button + turn timer */}
      <div className="flex flex-col items-center gap-3 my-2 w-full px-8">
        {/* Deck + Discard + Freeze row */}
        <div className="flex items-center gap-6">
          {/* Discard pile */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-24 h-36 rounded-xl border border-dashed border-card-border flex items-center justify-center relative">
              {lastDiscard ? (
                <div className="animate-card-deal">
                  <GameCard card={lastDiscard} disabled />
                </div>
              ) : (
                <span className="text-ash text-xs">Discard</span>
              )}
            </div>
            <span className="text-ash text-[10px] uppercase tracking-wider">
              {gameState.discardPile.length} dibuang
            </span>
          </div>

          {/* Deck */}
          <div className="flex flex-col items-center gap-1">
            <CardDeckStack
              count={gameState.deckCount}
              onClick={canDraw ? onDrawCard : undefined}
              highlight={amILocked && isMyTurn}
            />
            {canDraw && (
              <span className={clsx(
                "text-xs font-display animate-glow-pulse",
                amILocked ? "text-ember" : "text-lava"
              )}>
                {amILocked ? "🔒 Wajib draw!" : "👆 Tap untuk draw"}
              </span>
            )}
          </div>

          {/* Freeze button — sebelah deck, lebih terjangkau dari pojok layar.
              Muncul saat ada AWAITING_FREEZE dan pemain punya kartu Freeze. */}
          {showFreezeButton && (
            <FreezeCountdownButton
              onFreeze={onFreeze}
              freezeWindowEndsAt={pendingAction?.freezeWindowEndsAt}
            />
          )}
        </div>

        {/* Turn timer */}
        <TurnTimer
          turnEndsAt={gameState.turnEndsAt}
          isMyTurn={isMyTurn}
          isLocked={amILocked}
        />
      </div>

      {/* Current turn indicator */}
      <div className="text-center mb-2">
        {currentPlayer && (
          <div className={clsx(
            "px-4 py-1.5 rounded-full text-sm font-display tracking-wide inline-flex items-center gap-2",
            currentPlayer.sessionId === mySessionId
              ? "bg-lava/20 text-lava border border-lava/40"
              : "bg-obsidian-3 text-ash-light border border-card-border"
          )}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {currentPlayer.sessionId === mySessionId ? "Giliranmu!" : `Giliran ${currentPlayer.username}`}
          </div>
        )}
      </div>
    </div>
  );
}
