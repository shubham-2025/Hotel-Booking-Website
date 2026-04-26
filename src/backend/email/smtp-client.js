import nodemailer from "nodemailer";
import { env, hasSmtpEnv } from "@/src/backend/config/env";

let smtpTransport;

export function getSmtpTransport() {
  if (!hasSmtpEnv()) {
    return null;
  }

  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword,
      },
    });
  }

  return smtpTransport;
}

export async function verifySmtpTransport() {
  const transport = getSmtpTransport();

  if (!transport) {
    return false;
  }

  try {
    await transport.verify();
    return true;
  } catch (error) {
    console.error("verifySmtpTransport failed", error);
    return false;
  }
}
