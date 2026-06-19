"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useColyseusRoom } from "@/lib/useColyseusRoom";
import { Lobby } from "@/components/game/Lobby";
import { GameTable } from "@/components/game/GameTable";
import { PlayerHand } from "@/components/game/PlayerHand";
import { GameOver } from "@/components/game/GameOver";
import { GameLog } from "@/components/game/GameLog";
import { NotificationToasts } from "@/components/ui/NotificationToasts";
import { PeekModal } from "@/components/game/PeekModal";
import { WaterBucketModal } from "@/components/game/WaterBucketModal";
import { BribeModal } from "@/components/game/BribeModal";
import { FloodModal, TimeWarpModal } from "@/components/game/FloodModal";
import { GangPlayerPicker } from "@/components/game/GangPlayerPicker";
import { TargetingBanner } from "@/components/game/TargetingBanner";
import { FreezeButton } from "@/components/game/FreezeButton";
import { EmberParticles } from "@/components/animations/EmberParticles";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.id as string;
  const isCreating = searchParams.get("create") === "true";

  const {
    username, gameState, myHand, mySessionId, connectionStatus,
    targetingMode, exitTargetingMode, enterTargetingMode, pendingCardId,
    isMyTurn, getMe, showLog, toggleLog,
  } = useGameStore();

  const { connect, sendMessage } = useColyseusRoom(roomId, username);
  const [connectAttempted, setConnectAttempted] = useState(false);
  const [pendingGangCardIds, setPendingGangCardIds] = useState<string[] | null>(null);

  // Connect on mount
  useEffect(() => {
    if (!username) {
      router.push("/");
      return;
    }
    if (!connectAttempted) {
      setConnectAttempted(true);
      if (isCreating) {
        connect(); // create new room
      } else {
        connect(roomId); // join existing room
      }
    }
  }, [username, connectAttempted, isCreating, roomId, connect, router]);

  // ============================================================
  // ACTION HANDLERS
  // ============================================================
  const handleStartGame = useCallback(() => sendMessage("START_GAME"), [sendMessage]);
  const handleDrawCard = useCallback(() => sendMessage("DRAW_CARD"), [sendMessage]);

  const handlePlayCard = useCallback((cardId: string, needsTarget: boolean) => {
    if (needsTarget) {
      enterTargetingMode(cardId);
    } else {
      sendMessage("PLAY_CARD", { cardId });
    }
  }, [sendMessage, enterTargetingMode]);

  const handleSelectTarget = useCallback((targetId: string) => {
    if (pendingCardId) {
      sendMessage("PLAY_CARD", { cardId: pendingCardId, targetId });
      exitTargetingMode();
    }
  }, [pendingCardId, sendMessage, exitTargetingMode]);

  const handlePlayGang = useCallback((cardIds: string[], needsTarget: boolean) => {
    if (needsTarget) {
      setPendingGangCardIds(cardIds);
    } else {
      sendMessage("PLAY_GANG", { cardIds });
    }
  }, [sendMessage]);

  const handleGangTargetSelect = useCallback((targetId: string) => {
    if (pendingGangCardIds) {
      sendMessage("PLAY_GANG", { cardIds: pendingGangCardIds, targetId });
      setPendingGangCardIds(null);
    }
  }, [pendingGangCardIds, sendMessage]);

  const handleWaterBucket = useCallback((position: number) => {
    sendMessage("USE_WATER_BUCKET", { insertPosition: position });
  }, [sendMessage]);

  const handleBribeGive = useCallback((cardId: string) => {
    sendMessage("BRIBE_GIVE_CARD", { cardId });
  }, [sendMessage]);

  const handlePeekSwap = useCallback((swap: boolean, cardId?: string) => {
    sendMessage("PEEK_SWAP_DECISION", { swap, cardId });
  }, [sendMessage]);

  const handleFloodDiscard = useCallback((cardId: string) => {
    sendMessage("FLOOD_DISCARD", { cardId });
  }, [sendMessage]);

  const handleFreeze = useCallback(() => sendMessage("FREEZE_PLAY"), [sendMessage]);

  // ============================================================
  // LOADING / CONNECTION STATES
  // ============================================================
  if (connectionStatus === "connecting" || connectionStatus === "idle") {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-in">🌋</div>
          <p className="text-ash animate-pulse">Menyambungkan ke room...</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === "error" || connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">📡</div>
          <h2 className="font-display text-2xl text-ember mb-2">Gagal Terhubung</h2>
          <p className="text-ash text-sm mb-6">
            Room tidak ditemukan, sudah penuh, atau server sedang bermasalah.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-lava-gradient rounded-xl font-display text-white"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  if (!gameState || !mySessionId) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <p className="text-ash animate-pulse">Memuat game...</p>
      </div>
    );
  }

  // ============================================================
  // LOBBY STATE
  // ============================================================
  if (gameState.status === "lobby") {
    return (
      <>
        <NotificationToasts />
        <Lobby gameState={gameState} roomId={roomId} onStartGame={handleStartGame} />
      </>
    );
  }

  // ============================================================
  // FINISHED STATE
  // ============================================================
  if (gameState.status === "finished") {
    return (
      <>
        <NotificationToasts />
        <GameOver gameState={gameState} mySessionId={mySessionId} />
      </>
    );
  }

  // ============================================================
  // PLAYING STATE
  // ============================================================
  const me = getMe();
  const myTurn = isMyTurn();
  const pendingAction = gameState.pendingAction;
  const hasPendingAction = !!pendingAction;

  // Determine which modal to show based on pending action
  const showWaterBucketModal = pendingAction?.type === "WATER_BUCKET_PLACE" && pendingAction.initiatorId === mySessionId;
  const showBribeModal = pendingAction?.type === "BRIBE_WAITING" && pendingAction.targetId === mySessionId;
  const showPeekSwapModal = pendingAction?.type === "PEEK_AND_SWAP_DECIDE" && pendingAction.initiatorId === mySessionId;
  const showFloodModal = pendingAction?.type === "FLOOD_WAITING" && !pendingAction.data?.isTimeWarp
    && me?.isAlive && !pendingAction.floodDiscarded?.includes(mySessionId);
  const showFloodWaitingModal = pendingAction?.type === "FLOOD_WAITING" && !pendingAction.data?.isTimeWarp
    && me?.isAlive && pendingAction.floodDiscarded?.includes(mySessionId);
  const showTimeWarpModal = pendingAction?.type === "FLOOD_WAITING" && pendingAction.data?.isTimeWarp
    && pendingAction.initiatorId === mySessionId;

  // Gang target picker — dipicu lokal sebelum kartu dikirim ke server
  const showGangPicker = pendingGangCardIds !== null;
  const gangCardCount = pendingGangCardIds?.length ?? 0;
  const isGangRainbow = gangCardCount === 5;

  const canDraw = myTurn && !hasPendingAction;

  const initiatorName = pendingAction
    ? gameState.players.find(p => p.sessionId === pendingAction.initiatorId)?.username ?? "Seseorang"
    : "";

  return (
    <div className="min-h-screen bg-table-felt flex flex-col relative overflow-hidden">
      <EmberParticles count={6} />
      <NotificationToasts />

      {/* Top bar */}
      <div className="relative z-20 flex justify-between items-center px-4 py-3">
        <div className="font-display text-lava text-sm">🌋 {roomId}</div>
        <button
          onClick={toggleLog}
          className="text-ash hover:text-gold text-sm px-3 py-1.5 rounded-lg border border-card-border transition-colors"
        >
          📜 Log
        </button>
      </div>

      {/* Game table */}
      <GameTable
        gameState={gameState}
        mySessionId={mySessionId}
        onDrawCard={handleDrawCard}
        canDraw={canDraw}
        onSelectTarget={targetingMode ? handleSelectTarget : undefined}
        targetingMode={targetingMode}
      />

      {/* Player hand */}
      {me?.isAlive && (
        <PlayerHand
          hand={myHand}
          isMyTurn={myTurn}
          onPlayCard={handlePlayCard}
          onPlayGang={handlePlayGang}
          hasPendingAction={hasPendingAction || targetingMode || showGangPicker}
        />
      )}

      {!me?.isAlive && (
        <div className="fixed bottom-0 left-0 right-0 bg-obsidian-2 border-t border-ember/30 p-6 text-center">
          <p className="text-ember font-display">💀 Kamu sudah tereliminasi. Tonton sisa permainan!</p>
        </div>
      )}

      {/* Targeting banner */}
      <TargetingBanner onCancel={exitTargetingMode} />

      {/* Freeze interrupt button - visible to everyone except current turn player during pending actions */}
      <FreezeButton
        hand={myHand}
        onFreeze={handleFreeze}
        visible={hasPendingAction && pendingAction?.initiatorId !== mySessionId}
      />

      {/* Game log sidebar */}
      <GameLog entries={gameState.log} visible={showLog} />

      {/* ============ MODALS ============ */}
      {showPeekSwapModal ? (
        <PeekModal isSwapMode myHand={myHand} onSwapDecide={handlePeekSwap} />
      ) : (
        <PeekModal />
      )}

      {showWaterBucketModal && (
        <WaterBucketModal deckCount={gameState.deckCount} onConfirm={handleWaterBucket} />
      )}

      {showBribeModal && (
        <BribeModal myHand={myHand} initiatorName={initiatorName} onGiveCard={handleBribeGive} />
      )}

      {showFloodModal && (
        <FloodModal myHand={myHand} alreadyDiscarded={false} onDiscard={handleFloodDiscard} />
      )}

      {showFloodWaitingModal && (
        <FloodModal myHand={myHand} alreadyDiscarded={true} onDiscard={handleFloodDiscard} />
      )}

      {showTimeWarpModal && (
        <TimeWarpModal discardPile={gameState.discardPile} onPick={handleFloodDiscard} />
      )}

      {showGangPicker && (
        <GangPlayerPicker
          title={isGangRainbow ? "Full Riot!" : gangCardCount === 3 ? "Pilih Target & Kartu" : "Pilih Target"}
          description={
            isGangRainbow ? "Pilih pemain untuk swap seluruh tangan" :
            gangCardCount === 3 ? "Steal 1 kartu random dari pemain ini" :
            "Steal 1 kartu random dari pemain ini"
          }
          emoji={isGangRainbow ? "🌈" : gangCardCount === 3 ? "🎯" : "👥"}
          players={gameState.players}
          excludeId={mySessionId}
          onPick={handleGangTargetSelect}
          onCancel={() => setPendingGangCardIds(null)}
        />
      )}
    </div>
  );
}
