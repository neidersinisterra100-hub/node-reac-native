import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  markConversationRead,
} from '../controllers/chat.controller.js';

const router = Router();

// All chat routes require authentication
router.use(requireAuth);

// Conversations
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);

// Messages within a conversation
router.get('/conversations/:id/messages', getMessages);
router.patch('/conversations/:id/read', markConversationRead);

export default router;
