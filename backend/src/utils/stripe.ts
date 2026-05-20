import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";

const envPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "../config/config.env")
    : path.resolve(__dirname, "../../src/config/config.env");

dotenv.config({ path: envPath });
console.log("[ENV LOADED FROM]:", envPath);

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing in config.env");
}

export const stripe = new Stripe(stripeSecretKey);
