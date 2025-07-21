import mongoose from "mongoose";

export async function connectToDb(url: string) {
  try {
    // if the URL is not provided, throw an error
    if (!url) {
      throw new Error("Database URL is required");
    }

    // connect to the database using mongoose
    await mongoose.connect(url);

    // get the connection instance
    const connection = mongoose.connection;

    // if error occurs during connection, log it
    connection.on("error", (error) => {
      console.error("Database connection error:", error);
    });

    // if connection is successful, log a success message
    connection.once("open", () => {
      console.log("Connected to the database successfully");
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}
