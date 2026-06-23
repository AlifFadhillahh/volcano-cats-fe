export type CardType =
  | "LAVA_CAT" | "WATER_BUCKET"
  | "NAP_TIME" | "ERUPTION" | "SPY_CAT" | "EARTHQUAKE" | "FREEZE" | "BRIBE"
  | "REVERSE" | "SNIPER" | "PEEK_AND_SWAP" | "BUNKER" | "PICKPOCKET"
  | "FLOOD" | "TIME_WARP" | "LOCKDOWN"
  | "GANG_FIRE" | "GANG_ICE" | "GANG_STORM" | "GANG_EARTH" | "GANG_SHADOW";

export interface Card {
  id: string;
  type: CardType;
  name: string;
  description: string;
  emoji: string;
}

export interface ClientPlayer {
  sessionId: string;
  username: string;
  handCount: number;
  hand?: Card[];
  isAlive: boolean;
  hasBunker: boolean;
  isLocked: boolean;
  connected: boolean;
  away: boolean;
}

export type GameStatus = "lobby" | "playing" | "finished";
export type TurnDirection = 1 | -1;

export interface PendingAction {
  type: string;
  initiatorId: string;
  targetId?: string;
  data?: Record<string, unknown>;
  floodDiscarded?: string[];
  freezeWindowEndsAt?: number;
}

export interface GameLogEntry {
  timestamp: number;
  message: string;
  type: "action" | "death" | "system" | "win";
}

export interface ClientGameState {
  roomId: string;
  status: GameStatus;
  hostId: string;
  players: ClientPlayer[];
  turnOrder: string[];
  currentTurnIndex: number;
  turnDirection: TurnDirection;
  pendingTurns: number;
  deckCount: number;
  discardPile: Card[];
  pendingAction: PendingAction | null;
  winner: string | null;
  log: GameLogEntry[];
  turnEndsAt: number | null;
}

// Card metadata for UI rendering
export interface CardMeta {
  color: string;
  glowColor: string;
  bgGradient: string;
  category: "danger" | "action" | "new" | "gang";
}

export const CARD_META: Record<CardType, CardMeta> = {
  LAVA_CAT:     { color: "#FF5C1A", glowColor: "rgba(255,92,26,0.8)",  bgGradient: "linear-gradient(135deg,#FF5C1A,#8B0000)", category: "danger" },
  WATER_BUCKET: { color: "#5CE0FF", glowColor: "rgba(92,224,255,0.6)", bgGradient: "linear-gradient(135deg,#1E90FF,#006994)", category: "danger" },
  NAP_TIME:     { color: "#B0B0CC", glowColor: "rgba(176,176,204,0.5)",bgGradient: "linear-gradient(135deg,#4A4A6A,#2A2A44)", category: "action" },
  ERUPTION:     { color: "#FF8C00", glowColor: "rgba(255,140,0,0.6)",  bgGradient: "linear-gradient(135deg,#FF6600,#993D00)", category: "action" },
  SPY_CAT:      { color: "#9B59B6", glowColor: "rgba(155,89,182,0.6)", bgGradient: "linear-gradient(135deg,#6C3483,#1A0A2E)", category: "action" },
  EARTHQUAKE:   { color: "#E67E22", glowColor: "rgba(230,126,34,0.6)", bgGradient: "linear-gradient(135deg,#D35400,#5D2906)", category: "action" },
  FREEZE:       { color: "#85C1E9", glowColor: "rgba(133,193,233,0.6)",bgGradient: "linear-gradient(135deg,#2980B9,#1A4A6B)", category: "action" },
  BRIBE:        { color: "#FFB547", glowColor: "rgba(255,181,71,0.6)", bgGradient: "linear-gradient(135deg,#F39C12,#7D5A00)", category: "action" },
  REVERSE:      { color: "#1ABC9C", glowColor: "rgba(26,188,156,0.6)", bgGradient: "linear-gradient(135deg,#148F77,#0B4F3C)", category: "new" },
  SNIPER:       { color: "#E74C3C", glowColor: "rgba(231,76,60,0.6)",  bgGradient: "linear-gradient(135deg,#C0392B,#5B0000)", category: "new" },
  PEEK_AND_SWAP:{ color: "#8E44AD", glowColor: "rgba(142,68,173,0.6)", bgGradient: "linear-gradient(135deg,#6C3483,#2E0854)", category: "new" },
  BUNKER:       { color: "#AAB7B8", glowColor: "rgba(170,183,184,0.6)",bgGradient: "linear-gradient(135deg,#717D7E,#2C3E50)", category: "new" },
  PICKPOCKET:   { color: "#F39C12", glowColor: "rgba(243,156,18,0.6)", bgGradient: "linear-gradient(135deg,#D68910,#6E4800)", category: "new" },
  FLOOD:        { color: "#3498DB", glowColor: "rgba(52,152,219,0.6)", bgGradient: "linear-gradient(135deg,#1A6FA8,#0A2740)", category: "new" },
  TIME_WARP:    { color: "#A569BD", glowColor: "rgba(165,105,189,0.6)",bgGradient: "linear-gradient(135deg,#7D3C98,#2E0854)", category: "new" },
  LOCKDOWN:     { color: "#BDC3C7", glowColor: "rgba(189,195,199,0.5)",bgGradient: "linear-gradient(135deg,#616A6B,#1C2526)", category: "new" },
  GANG_FIRE:    { color: "#FF5C1A", glowColor: "rgba(255,92,26,0.7)",  bgGradient: "linear-gradient(135deg,#FF5C1A,#7B1900)", category: "gang" },
  GANG_ICE:     { color: "#5CE0FF", glowColor: "rgba(92,224,255,0.7)", bgGradient: "linear-gradient(135deg,#5CE0FF,#005F73)", category: "gang" },
  GANG_STORM:   { color: "#B05CFF", glowColor: "rgba(176,92,255,0.7)", bgGradient: "linear-gradient(135deg,#B05CFF,#3D0080)", category: "gang" },
  GANG_EARTH:   { color: "#5CFF8A", glowColor: "rgba(92,255,138,0.7)", bgGradient: "linear-gradient(135deg,#5CFF8A,#006622)", category: "gang" },
  GANG_SHADOW:  { color: "#8A5CFF", glowColor: "rgba(138,92,255,0.7)", bgGradient: "linear-gradient(135deg,#8A5CFF,#1A0066)", category: "gang" },
};

export const NEEDS_TARGET: CardType[] = ["BRIBE", "SNIPER", "PICKPOCKET", "LOCKDOWN"];
export const GANG_TYPES: CardType[] = ["GANG_FIRE","GANG_ICE","GANG_STORM","GANG_EARTH","GANG_SHADOW"];

export function isGangCard(type: CardType): boolean {
  return GANG_TYPES.includes(type);
}
