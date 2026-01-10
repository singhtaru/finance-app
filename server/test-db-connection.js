import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log("--- MongoDB Connection Test ---");
const uri = process.env.MONGO_URI || "";
// Obscure password for display
const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
console.log("Using URI:", maskedUri);

mongoose.connect(uri)
    .then(() => {
        console.log("✅ Authorization Passed!");
        console.log("✅ Connected to Database:", mongoose.connection.name);
        console.log("-------------------------------");
        console.log("If this implies 'test', but you want 'finance-app', please update your MONGO_URI.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Connection Failed:");
        console.error("Error CodeName:", err.codeName);
        console.error("Error Message:", err.message);
        process.exit(1);
    });
