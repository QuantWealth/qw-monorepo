import mongoose from "mongoose";

export * from "./operations";

// Connect to MongoDB.
mongoose.connect("mongodb://localhost/app")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
