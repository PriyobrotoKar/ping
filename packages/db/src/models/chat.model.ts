import mongoose, { InferSchemaType, Types } from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  isGroupChat: { type: Boolean, default: false },
  groupName: { type: String, default: "" },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
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
