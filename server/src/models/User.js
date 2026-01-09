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
      required: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    monthlyBudget: {
      type: Number,
      default: 0
    },
  },
  {
    timestamps: true //auto adds createdAt, updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;
