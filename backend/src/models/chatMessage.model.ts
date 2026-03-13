import mongoose, { Schema, Document } from 'mongoose';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read';
export type SenderRole = 'user' | 'admin';

export interface IChatMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: SenderRole;
  senderName: string;
  text: string;
  status: MessageStatus;
  clientId?: string; // Used for deduplication of offline messages
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'read'], default: 'sent' },
    clientId: { type: String, sparse: true, unique: true }, // prevent duplicate offline messages
  },
  { timestamps: true }
);

ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
