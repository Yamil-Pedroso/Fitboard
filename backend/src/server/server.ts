import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import colors from "colors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import userRoutes from "../routes/user";
import mealsRoutes from "../routes/meals";
import recipeRoutes from "../routes/recipe";
import routineRoutes from "../routes/routine";
import progressRoutes from "../routes/progress";
import devRoutes from "../routes/dev";
import adminRoutes from "../routes/admin";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "../config/db";
import { errorHandler } from "../middlewares/error";
import { multerErrorHandler } from "../middlewares/multeError";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../swagger";

dotenv.config({
  path: path.resolve(__dirname, "..", "config", "config.env"),
});

connectDB();
colors;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

if (process.env.NODE_ENV !== "production") {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true })
  );
  app.get("/docs.json", (_req, res) => res.json(swaggerSpec));
}

// Handle cookies
app.use(cookieParser());
const cookieTime = process.env.COOKIE_TIME as any;
const cookieSecret = process.env.COOKIE_SECRET as any;
app.use(
  cookieSession({
    name: "session",
    maxAge: cookieTime * 24 * 60 * 60 * 1000,
    keys: [cookieSecret],
    secure: true, // Only send over HTTPS
    sameSite: "none", // Allow cross-origin requests
    httpOnly: true, // Makes the cookie accessible only on the server-side
  })
);

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hola mundo!!");
});
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", devRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", mealsRoutes);
app.use("/api/v1", recipeRoutes);
app.use("/api/v1", routineRoutes);
app.use("/api/v1", progressRoutes);

// Error handlers
app.use(multerErrorHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`.green.bold);
});
