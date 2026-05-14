import { env, hasSmtpEnv } from "@/src/backend/config/env";
import { getResendClient } from "@/src/backend/email/resend-client";
import { getSmtpTransport } from "@/src/backend/email/smtp-client";

const EMAIL_THEME = {
  shell: "#edf3f9",
  card: "#ffffff",
  cardSoft: "#f5f9fd",
  ink: "#162235",
  muted: "#5f6b79",
  line: "#d5e1ef",
  accent: "#3d74a8",
  accentSoft: "#e7f4ff",
  highlight: "#245b9c",
  success: "#1f8f5f",
  successSoft: "#e9f8f1",
  danger: "#b34f5e",
  dangerSoft: "#fff0f3",
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getToneColors(tone) {
  if (tone === "success") {
    return {
      pillBackground: EMAIL_THEME.successSoft,
      pillColor: EMAIL_THEME.success,
      bannerStart: "#e9f8f1",
      bannerEnd: "#d6f1e3",
      buttonStart: "#4fb983",
      buttonEnd: "#1f8f5f",
    };
  }

  if (tone === "danger") {
    return {
      pillBackground: EMAIL_THEME.dangerSoft,
      pillColor: EMAIL_THEME.danger,
      bannerStart: "#fff2f4",
      bannerEnd: "#ffe1e7",
      buttonStart: "#d46a79",
      buttonEnd: "#b34f5e",
    };
  }

  return {
    pillBackground: EMAIL_THEME.accentSoft,
    pillColor: EMAIL_THEME.accent,
    bannerStart: "#eef6ff",
    bannerEnd: "#dfefff",
    buttonStart: "#5ca7e8",
    buttonEnd: "#2f73b5",
  };
}

function renderSummaryRows(rows = []) {
  if (!rows.length) {
    return "";
  }

  return rows
    .map(
      (row) => `
        <tr>
          <td style="padding: 12px 0; font-size: 14px; color: ${EMAIL_THEME.muted}; border-bottom: 1px solid ${EMAIL_THEME.line}; vertical-align: top;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding: 12px 0; font-size: 14px; color: ${EMAIL_THEME.ink}; border-bottom: 1px solid ${EMAIL_THEME.line}; text-align: right; vertical-align: top; font-weight: 600;">
            ${escapeHtml(row.value)}
          </td>
        </tr>`,
    )
    .join("");
}

function renderContentBlocks(blocks = []) {
  return blocks
    .filter(Boolean)
    .map(
      (block) => `
        <div style="margin-top: 18px; border: 1px solid ${EMAIL_THEME.line}; border-radius: 20px; background: ${EMAIL_THEME.cardSoft}; padding: 18px 20px;">
          <p style="margin: 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${EMAIL_THEME.highlight}; font-weight: 700;">
            ${escapeHtml(block.title)}
          </p>
          <div style="margin-top: 10px; font-size: 14px; line-height: 1.75; color: ${EMAIL_THEME.muted};">
            ${block.html}
          </div>
        </div>`,
    )
    .join("");
}

function renderPrimaryActionButton(label, url, buttonStart, buttonEnd) {
  if (!label || !url) {
    return "";
  }

  return `
    <a href="${escapeHtml(url)}" style="display: inline-block; margin: 0 12px 12px 0; min-width: 220px; text-align: center; padding: 14px 24px; border-radius: 999px; background: linear-gradient(135deg, ${buttonStart}, ${buttonEnd}); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700;">
      ${escapeHtml(label)}
    </a>`;
}

function renderSecondaryActionButton(label, url) {
  if (!label || !url) {
    return "";
  }

  return `
    <a href="${escapeHtml(url)}" style="display: inline-block; margin: 0 12px 12px 0; min-width: 220px; text-align: center; padding: 13px 24px; border-radius: 999px; border: 1px solid ${EMAIL_THEME.line}; background: ${EMAIL_THEME.card}; color: ${EMAIL_THEME.ink}; text-decoration: none; font-size: 14px; font-weight: 700;">
      ${escapeHtml(label)}
    </a>`;
}

function renderActionButtons({
  actionLabel,
  actionUrl,
  secondaryActionLabel,
  secondaryActionUrl,
  buttonStart,
  buttonEnd,
}) {
  const primaryAction = renderPrimaryActionButton(
    actionLabel,
    actionUrl,
    buttonStart,
    buttonEnd,
  );
  const secondaryAction = renderSecondaryActionButton(
    secondaryActionLabel,
    secondaryActionUrl,
  );

  if (!primaryAction && !secondaryAction) {
    return "";
  }

  return `
    <div style="margin-top: 28px;">
      <div style="font-size: 0;">
        ${primaryAction}
        ${secondaryAction}
      </div>
    </div>`;
}

export function renderTransactionalEmail({
  preheader = "",
  eyebrow = "QuickStay",
  title,
  lead,
  accentLabel = "",
  tone = "accent",
  summaryRows = [],
  contentBlocks = [],
  actionLabel = "",
  actionUrl = "",
  secondaryActionLabel = "",
  secondaryActionUrl = "",
  closingText = "Thank you for choosing QuickStay.",
}) {
  const colors = getToneColors(tone);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin: 0; padding: 0; background: ${EMAIL_THEME.shell}; font-family: Arial, Helvetica, sans-serif; color: ${EMAIL_THEME.ink};">
        <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden;">
          ${escapeHtml(preheader)}
        </span>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: ${EMAIL_THEME.shell}; padding: 28px 14px;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 680px;">
                <tr>
                  <td style="padding-bottom: 14px; text-align: center; font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: ${EMAIL_THEME.accent}; font-weight: 700;">
                    QuickStay
                  </td>
                </tr>
                <tr>
                  <td style="border-radius: 28px; overflow: hidden; box-shadow: 0 24px 60px rgba(18, 36, 59, 0.12); background: ${EMAIL_THEME.card};">
                    <div style="padding: 34px 34px 24px; background: linear-gradient(180deg, ${colors.bannerStart} 0%, ${colors.bannerEnd} 100%);">
                      <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background: ${colors.pillBackground}; color: ${colors.pillColor}; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;">
                        ${escapeHtml(accentLabel || eyebrow)}
                      </div>
                      <p style="margin: 18px 0 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${EMAIL_THEME.highlight}; font-weight: 700;">
                        ${escapeHtml(eyebrow)}
                      </p>
                      <h1 style="margin: 12px 0 0; font-size: 34px; line-height: 1.12; color: ${EMAIL_THEME.ink}; letter-spacing: -0.04em;">
                        ${escapeHtml(title)}
                      </h1>
                      <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.75; color: ${EMAIL_THEME.muted};">
                        ${escapeHtml(lead)}
                      </p>
                      ${renderActionButtons({
                        actionLabel,
                        actionUrl,
                        secondaryActionLabel,
                        secondaryActionUrl,
                        buttonStart: colors.buttonStart,
                        buttonEnd: colors.buttonEnd,
                      })}
                    </div>
                    <div style="padding: 28px 34px 34px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                        ${renderSummaryRows(summaryRows)}
                      </table>
                      ${renderContentBlocks(contentBlocks)}
                      <p style="margin: 22px 0 0; font-size: 14px; line-height: 1.75; color: ${EMAIL_THEME.muted};">
                        ${escapeHtml(closingText)}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
}

function formatAddress(fromEmail, fromName) {
  if (!fromEmail) {
    return "";
  }

  return fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  replyTo = "",
}) {
  if (!to || !subject || !html) {
    return false;
  }

  if (hasSmtpEnv()) {
    const transport = getSmtpTransport();

    if (!transport) {
      return false;
    }

    try {
      await transport.sendMail({
        from: formatAddress(env.smtpFromEmail, env.smtpFromName),
        to,
        replyTo: replyTo || env.smtpReplyToEmail || undefined,
        subject,
        html,
        text: text || "",
      });

      return true;
    } catch (error) {
      console.error("sendTransactionalEmail SMTP failed", {
        to,
        subject,
        error,
      });
      return false;
    }
  }

  const resend = getResendClient();

  if (!resend) {
    return false;
  }

  try {
    await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject,
      html,
      text: text || "",
    });

    return true;
  } catch (error) {
    console.error("sendTransactionalEmail Resend failed", {
      to,
      subject,
      error,
    });
    return false;
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatStatusLabel(value) {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function escapeEmailHtml(value) {
  return escapeHtml(value);
}
