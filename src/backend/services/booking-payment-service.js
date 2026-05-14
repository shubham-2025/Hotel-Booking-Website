import {
  env,
  hasBookingPaymentEnv,
  hasStripeWebhookEnv,
} from "@/src/backend/config/env";
import { getStripeClient } from "@/src/backend/payments/stripe-server";
import {
  getBookingNotificationContext,
  getTravelerStripePaymentRecoveryCandidates,
  getTravelerBookingCheckoutData,
  markBookingAsPaid,
  recordBookingPaymentCheckpoint,
} from "@/src/backend/repositories/bookings-repository";
import { sendBookingPaymentEmails } from "@/src/backend/services/booking-email-service";

const CHECKOUT_SUCCESS_NOTICE = "payment_completed";
const CHECKOUT_CANCELLED_ERROR = "payment_cancelled";
const STRIPE_CURRENCY = "usd";
const CHECKOUT_PROCESSING_MESSAGE =
  "Your previous payment is still being processed. Please refresh My Bookings in a moment before starting another checkout.";

function buildMyBookingsUrl(params = {}) {
  const url = new URL("/my-bookings", env.siteUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

function buildCheckoutSuccessUrl() {
  const siteUrl = env.siteUrl.replace(/\/$/, "");
  return `${siteUrl}/my-bookings?notice=${CHECKOUT_SUCCESS_NOTICE}&session_id={CHECKOUT_SESSION_ID}`;
}

function formatDateForDescription(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getRoomLabel(room) {
  return room?.name || room?.roomType || "Booked room";
}

function getUnitAmountInCents(totalPrice) {
  const value = Math.round(Number(totalPrice || 0) * 100);
  return Number.isFinite(value) ? value : 0;
}

function buildCheckoutIdempotencyKey(booking) {
  if (booking?.paymentTrackingAvailable === false) {
    return `booking-checkout-${booking?.id || "unknown"}-${Date.now()}`;
  }

  const paymentReference = booking?.paymentReference || "initial";
  return `booking-checkout-${booking?.id || "unknown"}-${paymentReference}`;
}

function getStripeObjectId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id || "";
}

function getStripeTimestamp(value) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

async function recordCheckoutSessionState(
  bookingId,
  session,
  {
    paymentLastEvent = "",
    paymentLastError = "",
    paymentPaidAt = null,
  } = {},
) {
  if (!bookingId || !session?.id) {
    return false;
  }

  return recordBookingPaymentCheckpoint(bookingId, {
    paymentProvider: "stripe",
    paymentReference: session.id,
    paymentIntentId: getStripeObjectId(session.payment_intent),
    paymentPaidAt,
    paymentLastEvent:
      paymentLastEvent || session.payment_status || session.status || "checkout_observed",
    paymentLastError,
    occurredAt: getStripeTimestamp(session.created),
  });
}

async function markSessionBookingAsPaid(session, travelerId = "") {
  const bookingId =
    session.metadata?.bookingId || session.client_reference_id || "";
  const sessionTravelerId = session.metadata?.travelerId || "";

  if (!bookingId) {
    return {
      status: "invalid",
      errorCode: "payment_sync_failed",
      reason: "Stripe checkout session is missing the booking reference.",
    };
  }

  if (travelerId && sessionTravelerId && sessionTravelerId !== travelerId) {
    return {
      status: "forbidden",
      errorCode: "payment_sync_failed",
      reason: "This Stripe checkout session does not belong to the signed-in traveler.",
    };
  }

  await recordCheckoutSessionState(bookingId, session, {
    paymentLastEvent:
      session.payment_status === "paid" ? "payment_received" : "checkout_observed",
  });

  if (session.payment_status !== "paid") {
    return {
      status: "not_paid",
      errorCode: "payment_sync_failed",
      reason: "Stripe checkout has not completed payment for this booking yet.",
    };
  }

  const result = await markBookingAsPaid(bookingId, {
    paymentMethod: "stripe",
    paymentProvider: "stripe",
    paymentReference: session.id,
    paymentIntentId: getStripeObjectId(session.payment_intent),
    paymentPaidAt: getStripeTimestamp(session.created),
    paymentLastEvent: "payment_received",
  });

  if (result.status === "updated") {
    const notificationContextResult = await getBookingNotificationContext(
      bookingId,
      {
        event: "payment_received",
        bookingOverrides: {
          payment_status: result.booking?.paymentStatus || "paid",
          payment_method: result.booking?.paymentMethod || "stripe",
        },
      },
    );

    if (notificationContextResult.status === "ready") {
      try {
        await sendBookingPaymentEmails(notificationContextResult.notificationContext);
      } catch (error) {
        console.error("sendBookingPaymentEmails failed", error);
      }
    }

    return {
      status: result.status,
      errorCode: "",
      reason: "",
    };
  }

  if (result.status === "already_paid") {
    return {
      status: result.status,
      errorCode: "",
      reason: "",
    };
  }

  return {
    status: result.status,
    errorCode: "payment_sync_failed",
    reason:
      result.reason ||
      "We could not update this booking payment right now.",
  };
}

async function resolveExistingCheckoutSession(checkoutData, stripe) {
  const booking = checkoutData?.booking;
  const paymentReference = booking?.paymentReference || "";

  if (!booking?.id || !paymentReference) {
    return {
      status: "create_new",
      session: null,
      url: "",
      message: "",
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(paymentReference);

    if (session.payment_status === "paid") {
      const syncResult = await markSessionBookingAsPaid(session, booking.userId);

      if (
        syncResult.status === "updated" ||
        syncResult.status === "already_paid"
      ) {
        return {
          status: "already_paid",
          session,
          url: "",
          message: "This booking has already been paid.",
        };
      }

      return {
        status: "unavailable",
        session,
        url: "",
        message:
          syncResult.reason ||
          "We could not verify your latest Stripe payment right now. Please refresh in a moment.",
      };
    }

    if (session.status === "open" && session.url) {
      return {
        status: "reuse_existing",
        session,
        url: session.url,
        message: "",
      };
    }

    if (session.status === "expired") {
      await recordCheckoutSessionState(booking.id, session, {
        paymentLastEvent: "checkout_expired",
        paymentLastError:
          "Your previous payment session expired before payment completed.",
      });

      return {
        status: "create_new",
        session,
        url: "",
        message: "",
      };
    }

    if (
      booking.paymentLastEvent === "payment_failed" ||
      booking.paymentLastEvent === "checkout_expired"
    ) {
      return {
        status: "create_new",
        session,
        url: "",
        message: "",
      };
    }

    return {
      status: "processing",
      session,
      url: "",
      message: booking.paymentLastError || CHECKOUT_PROCESSING_MESSAGE,
    };
  } catch (error) {
    console.error("resolveExistingCheckoutSession failed", {
      bookingId: booking.id,
      paymentReference,
      error,
    });

    return {
      status: "create_new",
      session: null,
      url: "",
      message: "",
    };
  }
}

export async function handleBookingCheckoutPost(bookingId) {
  if (!bookingId) {
    return {
      status: 400,
      body: {
        message: "We could not determine which booking to pay for.",
      },
    };
  }

  if (!hasBookingPaymentEnv()) {
    return {
      status: 503,
      body: {
        message: "Online booking payment is temporarily unavailable right now.",
      },
    };
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return {
      status: 503,
      body: {
        message: "Online booking payment is temporarily unavailable right now.",
      },
    };
  }

  const checkoutData = await getTravelerBookingCheckoutData(bookingId);

  if (checkoutData.status === "ready") {
    const unitAmount = getUnitAmountInCents(checkoutData.booking.totalPrice);

    if (!unitAmount) {
      return {
        status: 400,
        body: {
          message: "This booking total is not ready for online payment yet.",
        },
      };
    }

    const existingSessionState = await resolveExistingCheckoutSession(
      checkoutData,
      stripe,
    );

    if (existingSessionState.status === "reuse_existing") {
      return {
        status: 200,
        body: {
          url: existingSessionState.url,
        },
      };
    }

    if (existingSessionState.status === "already_paid") {
      return {
        status: 409,
        body: {
          message: existingSessionState.message,
        },
      };
    }

    if (existingSessionState.status === "processing") {
      return {
        status: 409,
        body: {
          message: existingSessionState.message,
        },
      };
    }

    if (existingSessionState.status === "unavailable") {
      return {
        status: 503,
        body: {
          message: existingSessionState.message,
        },
      };
    }

    try {
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          success_url: buildCheckoutSuccessUrl(),
          cancel_url: buildMyBookingsUrl({ error: CHECKOUT_CANCELLED_ERROR }),
          customer_email: checkoutData.traveler.email || undefined,
          client_reference_id: checkoutData.booking.id,
          metadata: {
            bookingId: checkoutData.booking.id,
            travelerId: checkoutData.booking.userId,
            roomId: checkoutData.room.id,
            hotelId: checkoutData.hotel.id,
          },
          payment_intent_data: {
            metadata: {
              bookingId: checkoutData.booking.id,
            },
          },
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: STRIPE_CURRENCY,
                unit_amount: unitAmount,
                product_data: {
                  name: `${checkoutData.hotel.name} | ${getRoomLabel(checkoutData.room)}`,
                  description: `${formatDateForDescription(checkoutData.booking.checkInDate)} to ${formatDateForDescription(checkoutData.booking.checkOutDate)}`,
                },
              },
            },
          ],
        },
        {
          idempotencyKey: buildCheckoutIdempotencyKey(checkoutData.booking),
        },
      );

      if (!session.url) {
        return {
          status: 503,
          body: {
            message:
              "We could not start the payment checkout right now. Please try again shortly.",
          },
        };
      }

      await recordBookingPaymentCheckpoint(checkoutData.booking.id, {
        paymentProvider: "stripe",
        paymentReference: session.id,
        paymentIntentId: getStripeObjectId(session.payment_intent),
        paymentLastEvent: "checkout_created",
        paymentLastError: "",
        occurredAt: getStripeTimestamp(session.created),
      });

      return {
        status: 200,
        body: {
          url: session.url,
        },
      };
    } catch (error) {
      console.error("handleBookingCheckoutPost failed", error);

      return {
        status: 503,
        body: {
          message:
            "We could not start the payment checkout right now. Please try again shortly.",
        },
      };
    }
  }

  if (checkoutData.status === "unauthenticated") {
    return {
      status: 401,
      body: {
        message: checkoutData.reason,
      },
    };
  }

  if (checkoutData.status === "not_found") {
    return {
      status: 404,
      body: {
        message: checkoutData.reason,
      },
    };
  }

  if (
    checkoutData.status === "already_paid" ||
    checkoutData.status === "not_payable"
  ) {
    return {
      status: 400,
      body: {
        message: checkoutData.reason,
      },
    };
  }

  return {
    status: 503,
    body: {
      message:
        checkoutData.reason ||
        "Online booking payment is temporarily unavailable right now.",
    },
  };
}

export async function syncBookingPaymentFromCheckoutSession({
  sessionId,
  travelerId = "",
}) {
  if (!sessionId) {
    return {
      status: "idle",
      errorCode: "",
      reason: "",
    };
  }

  if (!hasBookingPaymentEnv()) {
    return {
      status: "unavailable",
      errorCode: "payment_sync_failed",
      reason: "Online booking payment is temporarily unavailable right now.",
    };
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return {
      status: "unavailable",
      errorCode: "payment_sync_failed",
      reason: "Online booking payment is temporarily unavailable right now.",
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return markSessionBookingAsPaid(session, travelerId);
  } catch (error) {
    console.error("syncBookingPaymentFromCheckoutSession failed", error);

    return {
      status: "unavailable",
      errorCode: "payment_sync_failed",
      reason:
        "We could not verify your Stripe payment right now. Please refresh in a moment.",
    };
  }
}

export async function syncTravelerPendingBookingPayments(travelerId = "") {
  if (!travelerId || !hasBookingPaymentEnv()) {
    return {
      status: "skipped",
      syncedCount: 0,
      failedCount: 0,
    };
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return {
      status: "skipped",
      syncedCount: 0,
      failedCount: 0,
    };
  }

  const candidates = await getTravelerStripePaymentRecoveryCandidates(travelerId);

  if (!candidates.length) {
    return {
      status: "idle",
      syncedCount: 0,
      failedCount: 0,
    };
  }

  let syncedCount = 0;
  let failedCount = 0;

  for (const candidate of candidates) {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        candidate.paymentReference,
      );
      const result = await markSessionBookingAsPaid(session, travelerId);

      if (result.status === "updated" || result.status === "already_paid") {
        syncedCount += 1;
        continue;
      }

      if (session.status === "expired") {
        await recordCheckoutSessionState(candidate.bookingId, session, {
          paymentLastEvent: "checkout_expired",
          paymentLastError: "Your previous payment session expired before payment completed.",
        });
      }
    } catch (error) {
      failedCount += 1;
      console.error("syncTravelerPendingBookingPayments failed", {
        bookingId: candidate.bookingId,
        paymentReference: candidate.paymentReference,
        error,
      });
    }
  }

  return {
    status: syncedCount ? "updated" : failedCount ? "partial" : "idle",
    syncedCount,
    failedCount,
  };
}

export async function handleStripeWebhook(request) {
  if (!hasBookingPaymentEnv() || !hasStripeWebhookEnv()) {
    return {
      status: 503,
      body: {
        message: "Online booking payment is temporarily unavailable right now.",
      },
    };
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return {
      status: 503,
      body: {
        message: "Online booking payment is temporarily unavailable right now.",
      },
    };
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return {
      status: 400,
      body: {
        message: "Missing Stripe signature header.",
      },
    };
  }

  const payload = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripeWebhookSecret,
    );
  } catch (error) {
    console.error("handleStripeWebhook signature verification failed", error);

    return {
      status: 400,
      body: {
        message: "Invalid Stripe webhook signature.",
      },
    };
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    const result = await markSessionBookingAsPaid(session);

    if (
      result.status !== "updated" &&
      result.status !== "already_paid" &&
      result.status !== "not_paid"
    ) {
      console.error("markSessionBookingAsPaid returned unexpected state", {
        status: result.status,
        reason: result.reason,
      });
    }
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    const bookingId =
      session.metadata?.bookingId || session.client_reference_id || "";

    await recordCheckoutSessionState(bookingId, session, {
      paymentLastEvent: "payment_failed",
      paymentLastError:
        "Stripe reported that the asynchronous payment did not complete.",
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const bookingId =
      session.metadata?.bookingId || session.client_reference_id || "";

    await recordCheckoutSessionState(bookingId, session, {
      paymentLastEvent: "checkout_expired",
      paymentLastError:
        "The Stripe checkout session expired before payment completed.",
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata?.bookingId || "";

    await recordBookingPaymentCheckpoint(bookingId, {
      paymentProvider: "stripe",
      paymentIntentId: paymentIntent.id || "",
      paymentLastEvent: "payment_failed",
      paymentLastError:
        paymentIntent.last_payment_error?.message ||
        "Stripe reported that the payment intent failed.",
      occurredAt: getStripeTimestamp(event.created),
    });
  }

  return {
    status: 200,
    body: {
      received: true,
    },
  };
}
