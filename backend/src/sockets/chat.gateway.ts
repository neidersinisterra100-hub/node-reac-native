/**
 * Chat Gateway — Socket.IO
 *
 * Architecture:
 *  Client → authenticate (JWT) → join_conversation → send_message
 *                                                   → Redis pub/sub → all subscribers → receive_message
 *  Redis stores: online users, recent message cache
 *  MongoDB: persistent storage (written async)
 */
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { ConversationModel } from '../models/conversation.model.js';
import { ChatMessageModel } from '../models/chatMessage.model.js';
import { getRedis } from '../lib/redis.client.js';

/* ─── Redis helpers ──────────────────────────── */
const ONLINE_KEY = 'chat:online';
const MSG_CACHE_TTL = 3600; // 1 hour

async function setUserOnline(userId: string) {
  const redis = getRedis();
  if (redis) await redis.hSet(ONLINE_KEY, userId, '1');
}

async function setUserOffline(userId: string) {
  const redis = getRedis();
  if (redis) await redis.hDel(ONLINE_KEY, userId);
}

async function cacheMessage(convId: string, msg: object) {
  const redis = getRedis();
  if (!redis) return;
  const key = `chat:msgs:${convId}`;
  await redis.rPush(key, JSON.stringify(msg));
  await redis.lTrim(key, -100, -1); // keep last 100 per conversation
  await redis.expire(key, MSG_CACHE_TTL);
}

/* ─── Gateway init ───────────────────────────── */
export async function initChatGateway(httpServer: HttpServer) {
  // Dynamic import so the file compiles even before npm install
  const { Server } = await import('socket.io').catch(() => {
    console.warn('[Chat] socket.io not installed — chat disabled. Run: npm install socket.io');
    return { Server: null };
  });

  if (!Server) return;

  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
    transports: ['websocket', 'polling'], // polling fallback for slow networks
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // ── Auth middleware ──────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      (socket as any).userId = decoded.id;
      (socket as any).userRole = decoded.role;
      (socket as any).userName = decoded.name || 'Usuario';
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId: string = (socket as any).userId;
    const role: string = (socket as any).userRole;
    const name: string = (socket as any).userName;
    const isAdmin = role === 'admin' || role === 'owner' || role === 'super_owner';

    await setUserOnline(userId);

    // Admin joins global admins room to receive all conversation events
    if (isAdmin) socket.join('admins');

    console.log(`[Chat] ${role} ${userId} connected`);

    /* ── join_conversation ─────────────────────────────── */
    socket.on('join_conversation', async (convId: string) => {
      const conv = await ConversationModel.findById(convId).lean();
      if (!conv) return;
      if (!isAdmin && (conv as any).userId.toString() !== userId) return;

      socket.join(`conv:${convId}`);
      socket.emit('conversation_joined', { convId });

      // When joining, mark any undelivered messages from the other side as delivered
      const otherRole = isAdmin ? 'user' : 'admin';
      const undelivered = await ChatMessageModel.find({
        conversationId: convId,
        senderRole: otherRole,
        status: 'sent'
      }).lean();

      if (undelivered.length > 0) {
        await ChatMessageModel.updateMany(
          { conversationId: convId, senderRole: otherRole, status: 'sent' },
          { status: 'delivered' }
        );
        // Notify the sender that their messages were delivered
        socket.to(`conv:${convId}`).emit('messages_delivered', {
          conversationId: convId,
          messageIds: undelivered.map(m => m._id),
        });
      }

      if (isAdmin) {
        socket.to(`conv:${convId}`).emit('admin_presence', { online: true });
      }
    });

    /* ── send_message ─────────────────────────────────── */
    socket.on('send_message', async (payload: {
      conversationId: string;
      text: string;
      clientId?: string;
    }) => {
      const { conversationId, text, clientId } = payload;
      if (!text?.trim() || !conversationId) return;

      const conv = await ConversationModel.findById(conversationId);
      if (!conv) return;
      if (!isAdmin && (conv as any).userId.toString() !== userId) return;

      // Deduplication: offline messages sent multiple times
      if (clientId) {
        const existing = await ChatMessageModel.findOne({ clientId });
        if (existing) {
          socket.emit('message_ack', { clientId, messageId: existing._id, status: 'sent' });
          return;
        }
      }

      const message = await ChatMessageModel.create({
        conversationId,
        senderId: userId,
        senderRole: isAdmin ? 'admin' : 'user',
        senderName: name,
        text: text.trim(),
        status: 'sent',
        clientId,
      });

      await ConversationModel.findByIdAndUpdate(conversationId, {
        lastMessage: text.trim().slice(0, 80),
        lastMessageAt: new Date(),
        $inc: isAdmin ? { unreadByUser: 1 } : { unreadByAdmin: 1 },
      });

      const msgPayload = {
        _id: message._id,
        conversationId,
        senderId: userId,
        senderRole: message.senderRole,
        senderName: name,
        text: message.text,
        status: 'sent',
        clientId,
        createdAt: message.createdAt,
      };

      await cacheMessage(conversationId, msgPayload);

      // Broadcast to conversation room
      io.to(`conv:${conversationId}`).emit('receive_message', msgPayload);

      // Check if the other party is already in the room → immediate 'delivered'
      const roomSockets = await io.in(`conv:${conversationId}`).fetchSockets();
      const othersInRoom = roomSockets.filter(s => (s as any).userId !== userId);
      const isDelivered = othersInRoom.length > 0;

      if (isDelivered) {
        await ChatMessageModel.findByIdAndUpdate(message._id, { status: 'delivered' });
        socket.emit('message_delivered', {
          messageId: message._id,
          clientId,
          conversationId,
        });
      }

      // Ack with the REAL final status so client never regresses
      socket.emit('message_ack', {
        clientId,
        messageId: message._id,
        status: isDelivered ? 'delivered' : 'sent',
      });

      // Notify admins about conversation update (for the list view)
      if (!isAdmin) {
        io.to('admins').emit('conversation_updated', {
          conversationId,
          lastMessage: text.trim().slice(0, 80),
          lastMessageAt: new Date(),
          unreadByAdmin: ((conv as any).unreadByAdmin || 0) + 1,
          userId: (conv as any).userId,
          userName: (conv as any).userName,
        });
      }

    });

    /* ── typing indicators ───────────────────── */
    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit('typing_start', {
        userId, senderRole: isAdmin ? 'admin' : 'user', name,
      });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit('typing_stop', { userId });
    });

    /* ── leave_conversation ───────────────────── */
    socket.on('leave_conversation', ({ conversationId }: { conversationId: string }) => {
      socket.leave(`conv:${conversationId}`);
      // Notify the user the other party left (admin went offline for them)
      socket.to(`conv:${conversationId}`).emit('admin_presence', { online: false });
    });

    /* ── mark read ────────────────────────────── */
    socket.on('message_read', async ({ conversationId }: { conversationId: string }) => {
      const otherRole = isAdmin ? 'user' : 'admin';
      await ChatMessageModel.updateMany(
        { conversationId, senderRole: otherRole, status: { $ne: 'read' } },
        { status: 'read' }
      );
      const resetField = isAdmin ? { unreadByAdmin: 0 } : { unreadByUser: 0 };
      await ConversationModel.findByIdAndUpdate(conversationId, resetField);

      const readPayload = { conversationId, readBy: userId };

      if (!isAdmin) {
        // User read admin's messages → notify ALL admins
        // (admin might be on list view, not inside the specific conv room)
        io.to('admins').emit('messages_read', readPayload);
      } else {
        // Admin read user's messages → notify the user in the conv room
        socket.to(`conv:${conversationId}`).emit('messages_read', readPayload);
      }
    });

    /* ── disconnect ──────────────────────────── */
    socket.on('disconnect', async () => {
      await setUserOffline(userId);
      if (isAdmin) io.emit('admin_presence', { online: false });
      console.log(`[Chat] ${role} ${userId} disconnected`);
    });
  });

  console.log('[Chat] Socket.IO gateway initialized ✅');
  return io;
}
