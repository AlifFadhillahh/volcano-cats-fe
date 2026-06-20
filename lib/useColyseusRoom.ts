"use client";
import { useRef, useCallback } from "react";
import * as Colyseus from "colyseus.js";
import { useGameStore } from "@/store/gameStore";
import { ClientGameState, Card } from "@/types/game";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "ws://localhost:3001";

let clientInstance: Colyseus.Client | null = null;

// PENTING: koneksi room disimpan di level MODULE, bukan di useRef dalam komponen.
//
// Kenapa: komponen RoomPage bisa unmount/remount karena beberapa alasan yang TIDAK
// berarti "user benar-benar mau keluar dari room" — misalnya React Strict Mode (dev),
// atau perubahan dynamic route param. Kalau state koneksi hidup di useRef komponen,
// setiap remount bikin ref baru yang kosong, dan effect cleanup di useEffect bisa
// trigger leave() pada room yang sebenarnya masih ingin dipakai si user.
//
// Dengan menyimpan koneksi di module scope, sebuah room tetap "hidup" selama proses
// JS berjalan, terlepas dari siklus mount/unmount komponen React mana pun yang
// menggunakannya. Koneksi baru benar-benar ditutup hanya lewat disconnect() eksplisit
// (misalnya saat user pencet tombol "kembali ke menu"), bukan sebagai efek samping
// dari re-render.
let activeRoom: Colyseus.Room | null = null;
let activeRoomId: string | null = null; // roomId yang sedang dipakai activeRoom (anti-double-connect)
let connectingPromise: Promise<void> | null = null; // guard supaya connect() tidak dobel saat sedang in-flight

function getClient(): Colyseus.Client {
  if (!clientInstance) {
    clientInstance = new Colyseus.Client(SERVER_URL);
  }
  return clientInstance;
}

export function useColyseusRoom(username: string) {
  const roomRef = useRef<Colyseus.Room | null>(activeRoom);
  const {
    setConnectionStatus, setMySessionId, setGameState,
    setMyHand, setPeekCards, setShowPeek, addNotification,
  } = useGameStore();

  const connect = useCallback(async (targetRoomId?: string) => {
    // Sudah ada koneksi aktif ke room YANG SAMA yang diminta (atau create tanpa
    // target spesifik) — jangan connect dobel, pakai yang sudah ada.
    if (activeRoom && (!targetRoomId || activeRoomId === targetRoomId)) {
      roomRef.current = activeRoom;
      setConnectionStatus("connected");
      return;
    }
    // Ada koneksi aktif ke room LAIN — ini kondisi yang seharusnya tidak terjadi
    // dalam alur normal aplikasi (satu tab = satu room aktif). Tutup dulu yang lama
    // sebelum connect ke room baru, supaya tidak ada sesi nyangkut di room sebelumnya.
    if (activeRoom && targetRoomId && activeRoomId !== targetRoomId) {
      activeRoom.leave();
      activeRoom = null;
      activeRoomId = null;
    }
    // Ada proses connect lain yang sedang berjalan (misalnya dipanggil 2x beruntun
    // akibat Strict Mode double-invoke) — tunggu yang itu selesai, jangan mulai baru.
    if (connectingPromise) {
      await connectingPromise;
      return;
    }

    setConnectionStatus("connecting");

    connectingPromise = (async () => {
      try {
        const client = getClient();
        let room: Colyseus.Room;

        if (targetRoomId) {
          room = await client.joinById(targetRoomId, { username });
        } else {
          room = await client.create("volcano_cats", { username });
        }

        activeRoom = room;
        activeRoomId = room.roomId;
        roomRef.current = room;
        setMySessionId(room.sessionId);
        setConnectionStatus("connected");

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

        room.onLeave((code) => {
          setConnectionStatus("disconnected");
          activeRoom = null;
          activeRoomId = null;
          roomRef.current = null;

          // Kode 4000/4001 dikirim sengaja oleh server (lihat VolcanoCatsRoom.onJoin) —
          // bukan disconnect jaringan biasa, jadi kasih pesan yang lebih spesifik.
          if (code === 4001) {
            addNotification("Username sudah dipakai di room ini. Coba username lain.", "error", "👥");
          } else if (code === 4000) {
            addNotification("Room sudah mulai bermain, tidak bisa join sekarang.", "error", "🔒");
          } else {
            addNotification("Koneksi terputus dari server.", "error", "📡");
          }
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
      } finally {
        connectingPromise = null;
      }
    })();

    await connectingPromise;
  }, [username, setConnectionStatus, setMySessionId, setGameState, setMyHand, setPeekCards, setShowPeek, addNotification]);

  const sendMessage = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    if (!activeRoom) return;
    activeRoom.send(type, payload);
  }, []);

  // Disconnect EKSPLISIT — dipanggil dari UI (misal tombol "Keluar room"),
  // bukan otomatis dari unmount komponen.
  const disconnect = useCallback(() => {
    activeRoom?.leave();
    activeRoom = null;
    activeRoomId = null;
    roomRef.current = null;
  }, []);

  // TIDAK ADA cleanup otomatis di sini secara sengaja — lihat komentar module-level
  // di atas. Unmount komponen (termasuk akibat Strict Mode atau perubahan URL yang
  // tidak relevan) tidak boleh memutus koneksi WebSocket yang sedang aktif.

  return { connect, sendMessage, disconnect, room: roomRef };
}
