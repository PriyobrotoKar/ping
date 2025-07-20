import mongoose, { InferSchemaType, Types } from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  content: { type: String, required: true },
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
