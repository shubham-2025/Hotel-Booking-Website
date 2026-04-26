import Stripe from "stripe";
import { env, hasStripeSecretEnv } from "@/src/backend/config/env";

let stripeClient;

export function getStripeClient() {
  if (!hasStripeSecretEnv()) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }

  return stripeClient;
}
