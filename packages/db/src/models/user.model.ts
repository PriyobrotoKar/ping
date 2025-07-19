import mongoose, { InferSchemaType } from "mongoose";

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
  },
  { timestamps: true },
);

userSchema.pre("find", function (next) {
  this.select("-password");
  next();
});

export type IUser = InferSchemaType<typeof userSchema> & {
  _id: string;
};
export const User = mongoose.model("User", userSchema);
