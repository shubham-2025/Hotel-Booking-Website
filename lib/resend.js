import { Resend } from "resend";
import { env, hasResendEnv } from "./env";

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
