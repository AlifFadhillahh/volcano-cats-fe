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
import { CardPlayAnimation } from "@/components/game/CardPlayAnimation";
import { EmberParticles } from "@/components/animations/EmberParticles";
import { RulesModal } from "@/components/game/RulesModal";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const urlRoomId = params.id as string;
  const isCreating = urlRoomId === "_new";
  const [showRules, setShowRules] = useState(false);

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
      // User buka link room tapi belum punya username (tab baru atau belum pernah main).
      // Simpan roomId yang ingin di-join ke localStorage sebagai "pending join",
      // lalu redirect ke home untuk input username. Halaman home akan detect ini
      // dan pre-fill kode room + langsung masuk mode join.
      if (!isCreating) {
        localStorage.setItem("vc_pending_join", urlRoomId);
      }
      router.push("/");
      return;
    }
    if (!connectAttempted) {
      setConnectAttempted(true);
      if (isCreating) {
        connect();
      } else {
        connect(urlRoomId);
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
  const handleKick = useCallback(
    (targetSessionId: string) => sendMessage("KICK_PLAYER", { targetSessionId }),
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

  const handleLeave = useCallback(() => {
    sendMessage("TOGGLE_AWAY", { away: true });
    disconnect();
    router.push("/");
  }, [sendMessage, disconnect, router]);

  // Auto redirect ke home kalau disconnect setelah game (di-kick, atau room bubar)
  // Delay sedikit supaya notification toast sempat terlihat
  useEffect(() => {
    if (connectionStatus === "disconnected" && gameState?.status !== "playing" && gameState?.status !== "finished") {
      const t = setTimeout(() => router.push("/"), 2000);
      return () => clearTimeout(t);
    }
  }, [connectionStatus, gameState?.status, router]);

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
          onKick={handleKick}
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
  // Pemain kena Lockdown: satu-satunya aksi valid adalah draw, semua kartu di
  // tangan harus gelap (hasPendingAction = true supaya PlayerHand disable semua)
  const amILocked = Boolean(me?.isLocked && myTurn);

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
    <div className="min-h-screen bg-[#0a0e14] flex flex-col relative overflow-hidden">
      <EmberParticles count={4} />
      <NotificationToasts />

      {/* Top bar — ala referensi: logo kiri, room id, buttons kanan */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-[#1e2530]">
        {/* Logo + Room */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-lava/20 border border-lava/40 flex items-center justify-center text-sm">
            🌋
          </div>
          <div>
            <p className="font-display text-xs text-[#4a5568] tracking-widest uppercase leading-none">Volcano Cats</p>
            <p className="font-mono text-cream text-sm leading-tight">Room {displayRoomId}</p>
          </div>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-1.5">
          {/* Connected indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e2530] mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono text-[#4a5568]">connected</span>
          </div>

          {me?.isAlive && (
            <button
              onClick={handleToggleAway}
              className={clsx(
                "text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors",
                me.away
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-[#1e2530] text-[#4a5568] hover:text-cream hover:border-[#2e3540]"
              )}
            >
              {me.away ? "😴 Away" : "Away"}
            </button>
          )}
          <button
            onClick={toggleLog}
            className={clsx(
              "text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors",
              showLog
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-[#1e2530] text-[#4a5568] hover:text-cream hover:border-[#2e3540]"
            )}
          >
            Log
          </button>
          <button
            onClick={() => setShowRules(v => !v)}
            className={clsx(
              "text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors",
              showRules
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-[#1e2530] text-[#4a5568] hover:text-cream hover:border-[#2e3540]"
            )}
          >
            Rules
          </button>
          <button
            onClick={handleLeave}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#1e2530] text-[#4a5568] hover:text-ember hover:border-ember/40 font-mono transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Game table — flex-1 mengisi sisa ruang antara top bar dan hand panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <GameTable
          gameState={gameState}
          mySessionId={mySessionId}
          onDrawCard={handleDrawCard}
          canDraw={canDraw}
          onSelectTarget={targetingMode ? handleSelectTarget : undefined}
          targetingMode={targetingMode}
          isMyTurn={myTurn}
          amILocked={amILocked}
          myHandHasFreeze={myHand.some(c => c.type === "FREEZE")}
          onFreeze={handleFreeze}
          pendingAction={pendingAction}
        />
      </div>

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
          hasPendingAction={hasPendingAction || targetingMode || showGangPicker || amILocked}
          hasBunker={me?.hasBunker}
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

      {/* Game log floating panel */}
      <GameLog entries={gameState.log} visible={showLog} onClose={toggleLog} />

      {/* Rules panel */}
      <RulesModal visible={showRules} onClose={() => setShowRules(false)} />

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
