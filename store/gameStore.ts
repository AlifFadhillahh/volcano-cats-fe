import { create } from "zustand";
import { ClientGameState, Card, ClientPlayer } from "@/types/game";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "error" | "success" | "death" | "warning";
  emoji?: string;
}

interface GameStore {
  // Connection
  connectionStatus: ConnectionStatus;
  roomId: string | null;
  mySessionId: string | null;
  username: string;

  // Game state (from server)
  gameState: ClientGameState | null;
  myHand: Card[];

  // UI state
  selectedCards: string[];         // card IDs selected for gang play
  targetingMode: boolean;          // waiting to pick a target player
  pendingCardId: string | null;    // card about to be played (waiting for target)
  peekCards: Card[] | null;        // spy cat / peek result
  showPeek: boolean;
  isShaking: boolean;              // screen shake effect
  deadPlayers: string[];           // sessionIds that just died (for animation)
  notifications: Notification[];
  showLog: boolean;

  // Actions
  setConnectionStatus: (s: ConnectionStatus) => void;
  setRoomId: (id: string) => void;
  setMySessionId: (id: string) => void;
  setUsername: (u: string) => void;
  setGameState: (s: ClientGameState) => void;
  setMyHand: (cards: Card[]) => void;
  setPeekCards: (cards: Card[] | null) => void;
  setShowPeek: (v: boolean) => void;
  triggerShake: () => void;
  triggerDeath: (sessionId: string) => void;
  addNotification: (msg: string, type: Notification["type"], emoji?: string) => void;
  dismissNotification: (id: string) => void;

  toggleCardSelection: (cardId: string) => void;
  clearSelection: () => void;
  enterTargetingMode: (cardId: string) => void;
  exitTargetingMode: () => void;
  toggleLog: () => void;

  // Derived helpers
  getMe: () => ClientPlayer | null;
  isMyTurn: () => boolean;
  getCurrentPlayer: () => ClientPlayer | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  connectionStatus: "idle",
  roomId: null,
  mySessionId: null,
  username: "",
  gameState: null,
  myHand: [],
  selectedCards: [],
  targetingMode: false,
  pendingCardId: null,
  peekCards: null,
  showPeek: false,
  isShaking: false,
  deadPlayers: [],
  notifications: [],
  showLog: false,

  setConnectionStatus: (s) => set({ connectionStatus: s }),
  setRoomId: (id) => set({ roomId: id }),
  setMySessionId: (id) => set({ mySessionId: id }),
  setUsername: (u) => set({ username: u }),

  setGameState: (s) => {
    const prev = get().gameState;
    // Detect new deaths for animation
    if (prev) {
      const prevAlive = new Set(prev.players.filter(p => p.isAlive).map(p => p.sessionId));
      const newDead = s.players.filter(p => !p.isAlive && prevAlive.has(p.sessionId));
      if (newDead.length > 0) {
        get().triggerShake();
        newDead.forEach(p => get().triggerDeath(p.sessionId));
        newDead.forEach(p => {
          get().addNotification(`${p.username} meledak! 💀`, "death");
        });
      }
    }
    set({ gameState: s });
  },

  setMyHand: (cards) => set({ myHand: cards }),
  setPeekCards: (cards) => set({ peekCards: cards }),
  setShowPeek: (v) => set({ showPeek: v }),

  triggerShake: () => {
    set({ isShaking: true });
    setTimeout(() => set({ isShaking: false }), 600);
  },

  triggerDeath: (sessionId) => {
    set(s => ({ deadPlayers: [...s.deadPlayers, sessionId] }));
    setTimeout(() => {
      set(s => ({ deadPlayers: s.deadPlayers.filter(id => id !== sessionId) }));
    }, 1500);
  },

  addNotification: (message, type, emoji) => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ notifications: [...s.notifications, { id, message, type, emoji }] }));
    setTimeout(() => get().dismissNotification(id), 3500);
  },

  dismissNotification: (id) => {
    set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
  },

  toggleCardSelection: (cardId) => {
    set(s => {
      const sel = s.selectedCards;
      if (sel.includes(cardId)) return { selectedCards: sel.filter(id => id !== cardId) };
      return { selectedCards: [...sel, cardId] };
    });
  },

  clearSelection: () => set({ selectedCards: [], targetingMode: false, pendingCardId: null }),

  enterTargetingMode: (cardId) => set({ targetingMode: true, pendingCardId: cardId }),

  exitTargetingMode: () => set({ targetingMode: false, pendingCardId: null }),

  toggleLog: () => set(s => ({ showLog: !s.showLog })),

  getMe: () => {
    const { gameState, mySessionId } = get();
    return gameState?.players.find(p => p.sessionId === mySessionId) ?? null;
  },

  isMyTurn: () => {
    const { gameState, mySessionId } = get();
    if (!gameState) return false;
    const current = gameState.turnOrder[gameState.currentTurnIndex];
    return current === mySessionId;
  },

  getCurrentPlayer: () => {
    const { gameState } = get();
    if (!gameState) return null;
    const currentId = gameState.turnOrder[gameState.currentTurnIndex];
    return gameState.players.find(p => p.sessionId === currentId) ?? null;
  },
}));
