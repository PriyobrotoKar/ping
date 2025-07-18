import mongoose from "mongoose";

export async function connectToDb(url: string) {
  try {
    if (!url) {
      throw new Error("Database URL is required");
    }

    await mongoose.connect(url);
    const connection = mongoose.connection;

    connection.on("error", (error) => {
      console.error("Database connection error:", error);
    });
    connection.once("open", () => {
      console.log("Connected to the database successfully");
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}
