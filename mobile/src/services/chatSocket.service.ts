import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { loadSession } from "../utils/authStorage";

// ─── Offline queue ──────────────────────────────────────────────────────────
const PENDING_KEY = "chat_pending_queue";

export interface PendingMessage {
  clientId: string;
  conversationId: string;
  text: string;
  timestamp: number;
}

async function loadQueue(): Promise<PendingMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveQueue(q: PendingMessage[]) {
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(q));
}

async function enqueue(msg: PendingMessage) {
  const q = await loadQueue();
  q.push(msg);
  await saveQueue(q);
}

async function removeFromQueue(clientId: string) {
  const q = await loadQueue();
  await saveQueue(q.filter(m => m.clientId !== clientId));
}

// ─── URL helpers ─────────────────────────────────────────────────────────────
function getSocketUrl(): string {
  try {
    const extra = Constants.expoConfig?.extra?.api;
    if (Platform.OS === "web") return "http://127.0.0.1:3000";
    if (Platform.OS === "android") return "http://10.0.2.2:3000"; // Android Emulator
    if (extra?.cloudflare) return String(extra.cloudflare).replace("/api", "");
    if (extra?.ngrok) return String(extra.ngrok).replace("/api", "");
  } catch { /* noop */ }
  return "http://127.0.0.1:3000";
}

// ─── Singleton state ──────────────────────────────────────────────────────────
let socket: any = null;
let activeConvId = "";        // current conversation room
let listenersRegistered = false; // whether socket event handlers have been set up

export const listeners: {
  onMessage?: (msg: any) => void;
  onTyping?: (data: { userId: string; senderRole: string; name: string }) => void;
  onTypingStop?: (data: { userId: string }) => void;
  onAck?: (data: { clientId: string; messageId: string; status: string }) => void;
  onDelivered?: (data: { messageId: string; clientId?: string }) => void;       // single message delivered
  onBulkDelivered?: (data: { messageIds: string[] }) => void;
// bulk on join
  onAdminPresence?: (data: { online: boolean }) => void;
  onRead?: (data: { conversationId: string; readBy: string }) => void;
  onConversationUpdated?: (data: any) => void;
  onConnectionChange?: (connected: boolean) => void;
} = {};

/** Register all socket event handlers ONCE on the singleton socket */
function registerSocketHandlers() {
  if (listenersRegistered || !socket) return;
  listenersRegistered = true;

  socket.on("connect", async () => {
    console.log("[Chat] ✅ Socket connected, joining conv:", activeConvId);
    listeners.onConnectionChange?.(true);       // ← notify UI
    if (activeConvId) {
      socket.emit("join_conversation", activeConvId);
    }
    // Flush any offline pending messages
    await flushPendingQueue();
  });

  socket.on("connect_error", (err: any) => {
    console.error("[Chat] ❌ Connection error:", err.message);
    listeners.onConnectionChange?.(false);      // ← notify UI
  });

  // join acknowledged by server
  socket.on("conversation_joined", ({ convId }: { convId: string }) => {
    console.log("[Chat] ✅ Joined room conv:", convId);
    // DO NOT auto-fire message_read here — causes read-status confusion
  });

  socket.on("receive_message", (msg: any) => {
    listeners.onMessage?.(msg);
  });

  socket.on("typing_start", (data: any) => {
    listeners.onTyping?.(data);
  });

  socket.on("typing_stop", (data: any) => {
    listeners.onTypingStop?.(data);
  });

  socket.on("message_ack", (data: any) => {
    removeFromQueue(data.clientId);
    listeners.onAck?.(data);
  });

  // Single message delivered (other party was online when message sent)
  socket.on("message_delivered", (data: any) => {
    listeners.onDelivered?.(data);
  });

  // Bulk delivered (other party joined room and received pending messages)
  socket.on("messages_delivered", (data: any) => {
    listeners.onBulkDelivered?.(data);
  });

  socket.on("admin_presence", (data: any) => {
    listeners.onAdminPresence?.(data);
  });

  socket.on("messages_read", (data: any) => {
    listeners.onRead?.(data);
  });

  socket.on("conversation_updated", (data: any) => {
    listeners.onConversationUpdated?.(data);
  });

  socket.on("disconnect", (reason: string) => {
    console.log("[Chat] Socket disconnected:", reason);
  });
}

/**
 * Connect socket (if not connected) and join the conversation room.
 * Safe to call multiple times — idempotent for same convId.
 */
export async function connectChat(convId?: string) {
  if (convId) activeConvId = convId; // update active conv only if provided

  const session = await loadSession();
  if (!session?.token) {
    console.warn("[Chat] No auth token — cannot connect socket");
    return;
  }

  // If socket already exists and is connected, just (re-)join the room
  if (socket?.connected) {
    console.log("[Chat] Socket already connected, joining new conv:", convId);
    if (convId) socket.emit("join_conversation", convId);
    return;
  }

  // If socket exists but is not connected, disconnect cleanly before recreating
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    listenersRegistered = false;
  }

  console.log("[Chat] Creating new socket to:", getSocketUrl());

  socket = io(getSocketUrl(), {
    auth: { token: session.token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: false,
  });

  // Register all handlers ONCE
  registerSocketHandlers();
}

async function flushPendingQueue() {
  if (!socket?.connected) return;
  const q = await loadQueue();
  if (q.length === 0) return;
  // Clear queue FIRST — prevents re-sending on next reconnect if ack is lost
  await saveQueue([]);
  console.log(`[Chat] Flushing ${q.length} queued messages`);
  for (const msg of q) {
    socket.emit("send_message", {
      conversationId: msg.conversationId,
      text: msg.text,
      clientId: msg.clientId, // server deduplicates by clientId
    });
  }
}

/** Send message — goes to socket if connected, AsyncStorage queue if offline */
export async function sendMessage(
  conversationId: string,
  text: string
): Promise<{ clientId: string; isOffline: boolean }> {
  const clientId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (socket?.connected) {
    socket.emit("send_message", { conversationId, text, clientId });
    return { clientId, isOffline: false };
  }

  await enqueue({ clientId, conversationId, text, timestamp: Date.now() });
  return { clientId, isOffline: true };
}

export function sendTypingStart(conversationId: string) {
  socket?.emit("typing_start", { conversationId });
}

export function sendTypingStop(conversationId: string) {
  socket?.emit("typing_stop", { conversationId });
}

export function sendMessageRead(conversationId: string) {
  if (socket?.connected) {
    socket.emit("message_read", { conversationId });
  }
}

/** Tell server we left the conversation room (triggers offline presence for the other party) */
export function leaveConversation(conversationId: string) {
  if (socket?.connected) {
    socket.emit("leave_conversation", { conversationId });
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export function disconnectChat() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    listenersRegistered = false;
    activeConvId = "";
    console.log("[Chat] Socket disconnected and cleaned up");
  }
}

/** Update listener callbacks (screens call this before connectChat) */
export function setListeners(cbs: Partial<typeof listeners>) {
  Object.assign(listeners, cbs);
}
