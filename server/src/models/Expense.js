import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    splitBetween: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: {
          type: Number,
          required: true,
        },
        paidStatus: {
          type: Boolean,
          default: false,
        },
      },
    ],

    splitType: {
      type: String,
      enum: ["EQUAL", "EXACT", "PERCENTAGE"],
      default: "EQUAL",
    },

    category: {
      type: String,
      enum: ["Food", "Travel", "Rent", "Utilities", "Entertainment", "Other"],
      default: "Other"
    },
    currency: {
      type: String,
      default: "INR"
    },
    originalAmount: {
      type: Number,
    },
    exchangeRate: {
      type: Number,
      default: 1
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
