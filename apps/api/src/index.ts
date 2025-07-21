import app from "./app";
import { connectToDb } from "@ping/db";
import { createServer } from "node:http";
import createWebSocketServer from "./socket";

const port = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // create a http server using the Express app
    const server = createServer(app);

    // connect to the MongoDB database
    await connectToDb(
      process.env.DATABASE_URL || "mongodb://localhost:27017/mydb",
    );

    // create and configure the WebSocket server
    createWebSocketServer(server);

    // start the HTTP server
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`WebSocket server is running on ws://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error during bootstrap:", error);
    process.exit(1);
  }
}

bootstrap();
