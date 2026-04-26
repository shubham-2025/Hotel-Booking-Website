import {
  env,
  hasBookingPaymentEnv,
  hasStripeWebhookEnv,
} from "@/src/backend/config/env";
import { getStripeClient } from "@/src/backend/payments/stripe-server";
import {
  getBookingNotificationContext,
  getTravelerBookingCheckoutData,
  markBookingAsPaid,
} from "@/src/backend/repositories/bookings-repository";
import { sendBookingPaymentEmails } from "@/src/backend/services/booking-email-service";

const CHECKOUT_SUCCESS_NOTICE = "payment_completed";
const CHECKOUT_CANCELLED_ERROR = "payment_cancelled";
const STRIPE_CURRENCY = "usd";

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

  if (session.payment_status !== "paid") {
    return {
      status: "not_paid",
      errorCode: "payment_sync_failed",
      reason: "Stripe checkout has not completed payment for this booking yet.",
    };
  }

  const result = await markBookingAsPaid(bookingId, "stripe");

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
          idempotencyKey: `booking-checkout-${checkoutData.booking.id}`,
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

  return {
    status: 200,
    body: {
      received: true,
    },
  };
}
