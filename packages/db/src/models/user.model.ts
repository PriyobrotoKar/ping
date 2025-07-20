import mongoose, { InferSchemaType, Types } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.pre("find", function (next) {
  this.select("-password");
  next();
});

export type IUser = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};
export const User = mongoose.model("User", userSchema);
