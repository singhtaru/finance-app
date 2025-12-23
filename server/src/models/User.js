import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true, //no duplicate emails
      lowercase: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true //auto adds createdAt, updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;
