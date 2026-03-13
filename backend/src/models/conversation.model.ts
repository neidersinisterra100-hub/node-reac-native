import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  adminId?: mongoose.Types.ObjectId;
  status: 'open' | 'closed';
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadByAdmin: number;
  unreadByUser: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByUser: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for fast queries
ConversationSchema.index({ userId: 1 });
ConversationSchema.index({ status: 1, lastMessageAt: -1 });

export const ConversationModel = mongoose.model<IConversation>('Conversation', ConversationSchema);
