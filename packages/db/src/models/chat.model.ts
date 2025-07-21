import mongoose, { InferSchemaType, Types } from "mongoose";

// This model represents a chat between users, which can be either a one-on-one chat or a group chat.
const chatSchema = new mongoose.Schema({
  // Chat can have multiple participants, but at least one is required.
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  // whether the chat is a group chat or a one-on-one chat.
  isGroupChat: { type: Boolean, default: false },
  groupName: { type: String, default: "" },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // reference to the last message sent in the chat.
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  createdAt: { type: Date, default: Date.now },
});

export type IChat = InferSchemaType<typeof chatSchema> & {
  _id: Types.ObjectId;
};
export const Chat = mongoose.model("Chat", chatSchema);
