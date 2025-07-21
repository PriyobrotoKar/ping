import mongoose, { InferSchemaType, Types } from "mongoose";

const messageSchema = new mongoose.Schema({
  // Then sender of the message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // The chat to which the message belongs
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  // The content of the message
  content: { type: String, required: true },
  // Users who have read the message
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export type IMessage = InferSchemaType<typeof messageSchema> & {
  _id: Types.ObjectId;
};
export const Message = mongoose.model("Message", messageSchema);
