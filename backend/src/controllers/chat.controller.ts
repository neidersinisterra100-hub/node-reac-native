import { Request, Response } from 'express';
import { ConversationModel } from '../models/conversation.model.js';
import { ChatMessageModel } from '../models/chatMessage.model.js';
import { UserModel } from '../models/user.model.js';

/* ─────────────────────────────────────────────
   GET /api/chat/conversations
   - user: returns their own conversation
   - admin/owner: returns all open conversations
──────────────────────────────────────────────── */
export const getConversations = async (req: Request, res: Response) => {
  const { id, role } = req.user!;
  const isAdmin = role === 'admin' || role === 'owner' || role === 'super_owner';

  const filter = isAdmin ? { status: 'open' } : { userId: id };
  const conversations = await ConversationModel.find(filter)
    .sort({ lastMessageAt: -1 })
    .limit(50)
    .lean();

  res.json(conversations);
};

/* ─────────────────────────────────────────────
   POST /api/chat/conversations
   Opens or retrieves existing open conversation for user
──────────────────────────────────────────────── */
export const getOrCreateConversation = async (req: Request, res: Response) => {
  const { id, role } = req.user!;

  if (role !== 'user') {
    return res.status(403).json({ message: 'Solo los usuarios pueden iniciar conversaciones' });
  }

  let conversation = await ConversationModel.findOne({ userId: id, status: 'open' });

  if (!conversation) {
    const userDoc = await UserModel.findById(id).lean() as any;
    conversation = await ConversationModel.create({
      userId: id,
      userName: (userDoc as any)?.name || 'Usuario',
      status: 'open',
      unreadByAdmin: 0,
      unreadByUser: 0,
    });
  }

  res.json(conversation);
};

/* ─────────────────────────────────────────────
   GET /api/chat/conversations/:id/messages
   Paginated message history (last 50)
──────────────────────────────────────────────── */
export const getMessages = async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;
  const { id: convId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = 50;

  const conversation = await ConversationModel.findById(convId);
  if (!conversation) return res.status(404).json({ message: 'Conversación no encontrada' });

  const isAdmin = role === 'admin' || role === 'owner' || role === 'super_owner';
  if (!isAdmin && conversation.userId.toString() !== userId) {
    return res.status(403).json({ message: 'Sin acceso' });
  }

  const messages = await ChatMessageModel.find({ conversationId: convId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json(messages.reverse()); // return chronological
};

/* ─────────────────────────────────────────────
   PATCH /api/chat/conversations/:id/read
   Mark all messages in conversation as read
──────────────────────────────────────────────── */
export const markConversationRead = async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;
  const { id: convId } = req.params;
  const isAdmin = role === 'admin' || role === 'owner' || role === 'super_owner';

  const conversation = await ConversationModel.findById(convId);
  if (!conversation) return res.status(404).json({ message: 'Conversación no encontrada' });

  if (!isAdmin && conversation.userId.toString() !== userId) {
    return res.status(403).json({ message: 'Sin acceso' });
  }

  // Mark messages sent by the other party as read
  const senderRole = isAdmin ? 'user' : 'admin';
  await ChatMessageModel.updateMany(
    { conversationId: convId, senderRole, status: { $ne: 'read' } },
    { $set: { status: 'read' } }
  );

  // Reset unread counter
  const update = isAdmin ? { unreadByAdmin: 0 } : { unreadByUser: 0 };
  await ConversationModel.findByIdAndUpdate(convId, update);

  res.json({ ok: true });
};
