"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
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
import { CardPlayAnimation } from "@/components/game/CardPlayAnimation";
import { EmberParticles } from "@/components/animations/EmberParticles";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const urlRoomId = params.id as string;
  const isCreating = urlRoomId === "_new";

  const {
    username,
    gameState,
    myHand,
    mySessionId,
    connectionStatus,
    targetingMode,
    exitTargetingMode,
    enterTargetingMode,
    pendingCardId,
    isMyTurn,
    getMe,
    showLog,
    toggleLog,
    setRoomId,
  } = useGameStore();

  // Saat join, roomId yang dipakai untuk connect = ID asli dari URL (Colyseus room ID).
  // Saat create, kita belum punya ID sampai Colyseus merespons (lihat useEffect di bawah).
  const { connect, sendMessage, disconnect } = useColyseusRoom(username);
  const [connectAttempted, setConnectAttempted] = useState(false);
  const [pendingGangCardIds, setPendingGangCardIds] = useState<string[] | null>(
    null,
  );

  // Connect on mount
  useEffect(() => {
    if (!username) {
      router.push("/");
      return;
    }
    if (!connectAttempted) {
      setConnectAttempted(true);
      if (isCreating) {
        connect(); // create new room — Colyseus generate roomId sendiri
      } else {
        connect(urlRoomId); // join existing room pakai roomId asli dari Colyseus
      }
    }
  }, [username, connectAttempted, isCreating, urlRoomId, connect, router]);

  // Begitu room berhasil dibuat & roomId asli Colyseus diketahui (lewat gameState.roomId),
  // perbaiki URL di address bar dari /room/_new jadi /room/<roomId-asli> agar bisa di-share/bookmark.
  //
  // PENTING: pakai window.history.replaceState (bukan router.replace dari Next.js).
  // router.replace() mengganti params.id pada dynamic route [id], yang membuat Next.js
  // unmount + remount komponen RoomPage ini. Remount itu memicu cleanup effect di
  // useColyseusRoom yang leave() room — padahal room itu baru saja dibuat dan masih kosong.
  // Akibatnya room langsung auto-dispose di server, dan siapa pun yang join lewat link
  // hasil copy akan dapat "room not found". history.replaceState mengubah URL bar tanpa
  // menyentuh siklus render React sama sekali, jadi koneksi WebSocket yang sudah jalan tetap utuh.
  useEffect(() => {
    if (isCreating && gameState?.roomId) {
      setRoomId(gameState.roomId);
      window.history.replaceState(null, "", `/room/${gameState.roomId}`);
    }
  }, [isCreating, gameState?.roomId, setRoomId]);

  // roomId yang ditampilkan di UI (lobby code, top bar, dll) — selalu pakai ID asli dari server kalau sudah ada
  const displayRoomId = gameState?.roomId ?? (isCreating ? "..." : urlRoomId);

  // ============================================================
  // ACTION HANDLERS
  // ============================================================
  const handleStartGame = useCallback(
    () => sendMessage("START_GAME"),
    [sendMessage],
  );
  const handleDrawCard = useCallback(
    () => sendMessage("DRAW_CARD"),
    [sendMessage],
  );

  const handlePlayCard = useCallback(
    (cardId: string, needsTarget: boolean) => {
      if (needsTarget) {
        enterTargetingMode(cardId);
      } else {
        sendMessage("PLAY_CARD", { cardId });
      }
    },
    [sendMessage, enterTargetingMode],
  );

  const handleSelectTarget = useCallback(
    (targetId: string) => {
      if (pendingCardId) {
        sendMessage("PLAY_CARD", { cardId: pendingCardId, targetId });
        exitTargetingMode();
      }
    },
    [pendingCardId, sendMessage, exitTargetingMode],
  );

  const handlePlayGang = useCallback(
    (cardIds: string[], needsTarget: boolean) => {
      if (needsTarget) {
        setPendingGangCardIds(cardIds);
      } else {
        sendMessage("PLAY_GANG", { cardIds });
      }
    },
    [sendMessage],
  );

  const handleGangTargetSelect = useCallback(
    (targetId: string) => {
      if (pendingGangCardIds) {
        sendMessage("PLAY_GANG", { cardIds: pendingGangCardIds, targetId });
        setPendingGangCardIds(null);
      }
    },
    [pendingGangCardIds, sendMessage],
  );

  const handleWaterBucket = useCallback(
    (position: number) => {
      sendMessage("USE_WATER_BUCKET", { insertPosition: position });
    },
    [sendMessage],
  );

  const handleBribeGive = useCallback(
    (cardId: string) => {
      sendMessage("BRIBE_GIVE_CARD", { cardId });
    },
    [sendMessage],
  );

  const handlePeekSwap = useCallback(
    (swap: boolean, cardId?: string) => {
      sendMessage("PEEK_SWAP_DECISION", { swap, cardId });
    },
    [sendMessage],
  );

  const handleFloodDiscard = useCallback(
    (cardId: string) => {
      sendMessage("FLOOD_DISCARD", { cardId });
    },
    [sendMessage],
  );

  const handleFreeze = useCallback(
    () => sendMessage("FREEZE_PLAY"),
    [sendMessage],
  );

  const handleToggleAway = useCallback(() => {
    const me = getMe();
    sendMessage("TOGGLE_AWAY", { away: !me?.away });
  }, [sendMessage, getMe]);

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
          <h2 className="font-display text-2xl text-ember mb-2">
            Gagal Terhubung
          </h2>
          <p className="text-ash text-sm mb-6">
            Room tidak ditemukan, sudah penuh, atau server sedang bermasalah.
          </p>
          <button
            onClick={() => { disconnect(); router.push("/"); }}
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
        <Lobby
          gameState={gameState}
          roomId={displayRoomId}
          onStartGame={handleStartGame}
        />
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
        <GameOver gameState={gameState} mySessionId={mySessionId} onLeave={disconnect} />
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
  const showWaterBucketModal =
    pendingAction?.type === "WATER_BUCKET_PLACE" &&
    pendingAction.initiatorId === mySessionId;
  const showBribeModal =
    pendingAction?.type === "BRIBE_WAITING" &&
    pendingAction.targetId === mySessionId;
  const showPeekSwapModal =
    pendingAction?.type === "PEEK_AND_SWAP_DECIDE" &&
    pendingAction.initiatorId === mySessionId;
  const showFloodModal =
    pendingAction?.type === "FLOOD_WAITING" &&
    !pendingAction.data?.isTimeWarp &&
    me?.isAlive &&
    !pendingAction.floodDiscarded?.includes(mySessionId);
  const showFloodWaitingModal =
    pendingAction?.type === "FLOOD_WAITING" &&
    !pendingAction.data?.isTimeWarp &&
    me?.isAlive &&
    pendingAction.floodDiscarded?.includes(mySessionId);
  const showTimeWarpModal =
    pendingAction?.type === "FLOOD_WAITING" &&
    Boolean(pendingAction.data?.isTimeWarp) &&
    pendingAction.initiatorId === mySessionId;

  // Gang target picker — dipicu lokal sebelum kartu dikirim ke server
  const showGangPicker = pendingGangCardIds !== null;
  const gangCardCount = pendingGangCardIds?.length ?? 0;
  const isGangRainbow = gangCardCount === 5;

  const canDraw = myTurn && !hasPendingAction;

  const initiatorName = pendingAction
    ? (gameState.players.find((p) => p.sessionId === pendingAction.initiatorId)
        ?.username ?? "Seseorang")
    : "";

  // Nama pemain untuk caption animasi kartu — best-effort, ambil dari log
  // entry "action" terakhir (format pesan log selalu diawali "{username} ...").
  const lastActionPlayerName = (() => {
    const lastAction = [...gameState.log].reverse().find((e) => e.type === "action");
    if (!lastAction) return undefined;
    const firstSpace = lastAction.message.indexOf(" ");
    return firstSpace > 0 ? lastAction.message.slice(0, firstSpace) : undefined;
  })();

  return (
    <div className="min-h-screen bg-table-felt flex flex-col relative overflow-hidden">
      <EmberParticles count={6} />
      <NotificationToasts />

      {/* Top bar */}
      <div className="relative z-20 flex justify-between items-center px-4 py-3">
        <div className="font-display text-lava text-sm">🌋 {displayRoomId}</div>
        <div className="flex items-center gap-2">
          {me?.isAlive && (
            <button
              onClick={handleToggleAway}
              className={clsx(
                "text-sm px-3 py-1.5 rounded-lg border transition-colors",
                me.away
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-card-border text-ash hover:text-cream"
              )}
            >
              {me.away ? "😴 Away (tap untuk aktif)" : "💤 Set Away"}
            </button>
          )}
          <button
            onClick={toggleLog}
            className="text-ash hover:text-gold text-sm px-3 py-1.5 rounded-lg border border-card-border transition-colors"
          >
            📜 Log
          </button>
        </div>
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

      {/* Animasi kartu dimainkan — trigger otomatis tiap discard pile berubah */}
      <CardPlayAnimation
        lastDiscardedCard={gameState.discardPile[gameState.discardPile.length - 1] ?? null}
        playerName={lastActionPlayerName}
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
          <p className="text-ember font-display">
            💀 Kamu sudah tereliminasi. Tonton sisa permainan!
          </p>
        </div>
      )}

      {/* Targeting banner */}
      <TargetingBanner onCancel={exitTargetingMode} />

      {/* Freeze interrupt window — cuma muncul untuk kartu yang sedang menunggu
          freeze window (AWAITING_FREEZE), bukan pending action lain seperti
          Bribe/Flood yang punya alur input sendiri */}
      <FreezeButton
        hand={myHand}
        onFreeze={handleFreeze}
        visible={pendingAction?.type === "AWAITING_FREEZE" && pendingAction?.initiatorId !== mySessionId}
        freezeWindowEndsAt={pendingAction?.freezeWindowEndsAt}
        initiatorName={initiatorName}
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
        <WaterBucketModal
          deckCount={gameState.deckCount}
          onConfirm={handleWaterBucket}
        />
      )}

      {showBribeModal && (
        <BribeModal
          myHand={myHand}
          initiatorName={initiatorName}
          onGiveCard={handleBribeGive}
        />
      )}

      {showFloodModal && (
        <FloodModal
          myHand={myHand}
          alreadyDiscarded={false}
          onDiscard={handleFloodDiscard}
        />
      )}

      {showFloodWaitingModal && (
        <FloodModal
          myHand={myHand}
          alreadyDiscarded={true}
          onDiscard={handleFloodDiscard}
        />
      )}

      {showTimeWarpModal && (
        <TimeWarpModal
          discardPile={gameState.discardPile}
          onPick={handleFloodDiscard}
        />
      )}

      {showGangPicker && (
        <GangPlayerPicker
          title={
            isGangRainbow
              ? "Full Riot!"
              : gangCardCount === 3
                ? "Pilih Target & Kartu"
                : "Pilih Target"
          }
          description={
            isGangRainbow
              ? "Pilih pemain untuk swap seluruh tangan"
              : gangCardCount === 3
                ? "Steal 1 kartu random dari pemain ini"
                : "Steal 1 kartu random dari pemain ini"
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
