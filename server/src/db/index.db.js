import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database is Connected");
  } catch (err) {
    console.log("❌ Something went wrong Database isn't connected", err);
    process.exit(1);
  }
};

export default connectDB;
