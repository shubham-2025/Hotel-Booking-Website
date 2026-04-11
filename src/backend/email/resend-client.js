import { Resend } from "resend";
import { env, hasResendEnv } from "../config/env";

let resendClient;

export function getResendClient() {
  if (!hasResendEnv()) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(env.resendApiKey);
  }

  return resendClient;
}
