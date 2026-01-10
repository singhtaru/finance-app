import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import passport, { configurePassport } from "./config/passport.js"; // Import passport config
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import settlementRoutes from "./routes/settlementRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";


dotenv.config();
connectDB();
configurePassport(); // Run config AFTER dotenv

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5000", "https://finance-app-lkgu.onrender.com"], // Add your deployed frontend URL here
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize()); // Initialize passport after app creation
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/settlements", settlementRoutes);
app.use("/api/ai", aiRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
