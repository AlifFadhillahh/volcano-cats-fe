"use client";
import { ClientGameState } from "@/types/game";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { CardDeckStack, GameCard } from "@/components/game/GameCard";
import { useGameStore } from "@/store/gameStore";
import clsx from "clsx";

interface GameTableProps {
  gameState: ClientGameState;
  mySessionId: string;
  onDrawCard: () => void;
  canDraw: boolean;
  onSelectTarget?: (targetId: string) => void;
  targetingMode: boolean;
}

export function GameTable({ gameState, mySessionId, onDrawCard, canDraw, onSelectTarget, targetingMode }: GameTableProps) {
  const { deadPlayers, isShaking } = useGameStore();
  const otherPlayers = gameState.players.filter(p => p.sessionId !== mySessionId);
  const currentTurnId = gameState.turnOrder[gameState.currentTurnIndex];
  const currentPlayer = gameState.players.find(p => p.sessionId === currentTurnId);
  const lastDiscard = gameState.discardPile[gameState.discardPile.length - 1];

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
    <div className={clsx("relative w-full flex-1 flex flex-col items-center justify-between pt-6 pb-4", isShaking && "animate-shake")}>
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

      {/* Center table: deck + discard */}
      <div className="flex items-center gap-8 my-4">
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
          />
          {canDraw && (
            <span className="text-lava text-xs font-display animate-glow-pulse">👆 Tap untuk draw</span>
          )}
        </div>
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
