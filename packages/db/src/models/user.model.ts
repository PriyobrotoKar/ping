import mongoose, { InferSchemaType, Types } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // email of the user
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // full name of the user
    fullName: {
      type: String,
      required: true,
    },
    // password of the user
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // profile picture of the user
    profilePic: {
      type: String,
      default: "",
    },
    // status of the user
    online: { type: Boolean, default: false },
    // last seen time of the user
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
