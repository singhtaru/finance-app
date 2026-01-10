
import mongoose from "mongoose";
import dotenv from "dotenv";
import Group from "./src/models/Group.js";
import path from "path";
import { fileURLToPath } from "url";

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const fixOwnership = async () => {
    await connectDB();

    const groupName = "Goa Trip";
    const newOwnerId = "694526e21f944db6a105543f"; // User from logs

    try {
        const group = await Group.findOne({ name: groupName });

        if (!group) {
            console.log(`Group "${groupName}" not found!`);
            process.exit(1);
        }

        console.log(`Found Group: ${group.name}, Current Owner: ${group.createdBy}`);

        group.createdBy = newOwnerId;
        await group.save();

        console.log(`✅ SUCCESS: Transferred ownership of "${groupName}" to user ${newOwnerId}`);
        process.exit();
    } catch (error) {
        console.error("Error updating group:", error);
        process.exit(1);
    }
};

fixOwnership();
