import mongoose from "mongoose";
import "dotenv/config"


const dbConnector = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("MongoDB has connected");
    } catch (error) {
        console.log("MongoDB connection error:", error.message);
    }
}

export default dbConnector