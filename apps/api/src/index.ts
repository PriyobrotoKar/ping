import app from "./app";
import { connectToDb } from "@ping/db";
const port = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectToDb(
      process.env.DATABASE_URL || "mongodb://localhost:27017/mydb",
    );

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error during bootstrap:", error);
    process.exit(1);
  }
}

bootstrap();
