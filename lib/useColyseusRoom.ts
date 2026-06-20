"use client";
import { useEffect, useRef, useCallback } from "react";
import * as Colyseus from "colyseus.js";
import { useGameStore } from "@/store/gameStore";
import { ClientGameState, Card } from "@/types/game";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "ws://localhost:3001";

let clientInstance: Colyseus.Client | null = null;

function getClient(): Colyseus.Client {
  if (!clientInstance) {
    clientInstance = new Colyseus.Client(SERVER_URL);
  }
  return clientInstance;
}

export function useColyseusRoom(username: string) {
  const roomRef = useRef<Colyseus.Room | null>(null);
  const {
    setConnectionStatus, setMySessionId, setGameState,
    setMyHand, setPeekCards, setShowPeek, addNotification,
  } = useGameStore();

  const connect = useCallback(async (targetRoomId?: string) => {
    if (roomRef.current) return;
    setConnectionStatus("connecting");

    try {
      const client = getClient();
      let room: Colyseus.Room;

      if (targetRoomId) {
        // Join existing room by ID
        room = await client.joinById(targetRoomId, { username });
      } else {
        // Create new room
        room = await client.create("volcano_cats", { username });
      }

      roomRef.current = room;
      setMySessionId(room.sessionId);
      setConnectionStatus("connected");

      // Handle all messages from server
      room.onMessage("message", (msg: Record<string, unknown>) => {
        switch (msg.type) {
          case "GAME_STATE_UPDATE":
            setGameState(msg.state as ClientGameState);
            break;
          case "YOUR_HAND":
            setMyHand(msg.cards as Card[]);
            break;
          case "PEEK_RESULT":
            setPeekCards(msg.cards as Card[]);
            setShowPeek(true);
            break;
          case "ERROR":
            addNotification(msg.message as string, "error", "⚠️");
            break;
          default:
            break;
        }
      });

      room.onLeave(() => {
        setConnectionStatus("disconnected");
        roomRef.current = null;
        addNotification("Koneksi terputus dari server.", "error", "📡");
      });

      room.onError((code, message) => {
        console.error("Room error:", code, message);
        setConnectionStatus("error");
        addNotification(`Error: ${message}`, "error");
      });

    } catch (err: unknown) {
      console.error("Connect failed:", err);
      setConnectionStatus("error");
      const msg = err instanceof Error ? err.message : "Gagal connect ke server";
      addNotification(msg, "error", "❌");
    }
  }, [username, setConnectionStatus, setMySessionId, setGameState, setMyHand, setPeekCards, setShowPeek, addNotification]);

  const sendMessage = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    if (!roomRef.current) return;
    roomRef.current.send(type, payload);
  }, []);

  const disconnect = useCallback(() => {
    roomRef.current?.leave();
    roomRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  return { connect, sendMessage, disconnect, room: roomRef };
}
