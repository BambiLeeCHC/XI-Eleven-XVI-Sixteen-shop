/**
 * Stripe → order / subscription / question state.
 *
 * The event is re-fetched from Stripe by id before it is trusted, so a forged
 * POST to this URL cannot mark an order paid or a subscription active.
 *
 * Handles four things:
 *  - checkout.session.completed (mode=payment, has order_id)      → order paid, sent to Printful
 *  - checkout.session.completed (mode=subscription)                → subscriptions row created
 *  - customer.subscription.updated / deleted                        → subscriptions row kept in sync
 *  - checkout.session.completed (mode=payment, has reading_question_id) → question answered by Gemini
 */

import { submitOrderToPrintful } from "./_lib/fulfill.js";
import { generateWithGemini, type GeminiFailure } from "./_lib/gemini.js";
import {
  type ApiRequest,
  type ApiResponse,
  stripeSecret,
  supabaseAdmin,
  updateOrder,
} from "./_lib/server.js";

const QUESTION_SYSTEM_PROMPT = `You are the XI · XVI Reader, answering one specific follow-up question a reader paid to ask about a tarot reading they already received. Be direct, specific, and grounded in the cards and situation given — never hedge with "may" or "could," never generic. Answer the actual question asked, in 120-200 words, second person, no greeting, no sign-off. Sparing bold (wrap in **like this**) on at most one or two key phrases.`;

async function upsertSubscriptionFromStripe(
  admin: ReturnType<typeof supabaseAdmin>,
  userId: string,
  sub: any,
) {
  // Tier is set at checkout time (subscription_data metadata) and doesn't
  // change on Stripe's own update/delete events, so only overwrite it when
  // Stripe actually sends one (checkout.session.completed does; a bare
  // customer.subscription.updated/deleted for an existing sub may not).
  const tier = sub?.metadata?.tier;

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
      status: sub.status,
      ...(tier ? { tier } : {}),
      trial_end: sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function fetchStripeSubscription(id: string) {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${id}`, {
    headers: { Authorization: `Bearer ${stripeSecret()}` },
  });
  if (!response.ok) return null;
  return response.json();
}

async function answerQuestion(admin: ReturnType<typeof supabaseAdmin>, questionId: string) {
  const { data: row } = await admin
    .from("reading_questions")
    .select("id, question, reading_context, status")
    .eq("id", questionId)
    .maybeSingle();
  if (!row || row.status === "answered") return;

  const context = row.reading_context
    ? JSON.stringify(row.reading_context)
    : "No prior reading context provided.";
  const userPrompt = `Their reading context: ${context}\n\nTheir follow-up question: "${row.question}"\n\nAnswer it now, following the rules exactly.`;

  const result = await generateWithGemini(QUESTION_SYSTEM_PROMPT, userPrompt, 1200);
  if (!result.success) {
    const failure = result as GeminiFailure;
    console.error("Question answer generation failed", failure.reason);
    return;
  }

  await admin
    .from("reading_questions")
    .update({
      answer: result.text,
      status: "answered",
      answered_at: new Date().toISOString(),
    })
    .eq("id", questionId);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  const eventId = req.body?.id;
  if (!eventId) return res.status(400).send("Invalid event");

  let event: any;
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/events/${eventId}`,
      {
        headers: { Authorization: `Bearer ${stripeSecret()}` },
      },
    );
    if (!response.ok) return res.status(401).send("Unverified event");
    event = await response.json();
  } catch (error) {
    console.error("Stripe verification failed", error);
    return res.status(500).send("Verification failed");
  }

  try {
    const admin = supabaseAdmin();

    if (event.type === "checkout.session.completed") {
      const session = event.data?.object;

      if (session?.mode === "subscription") {
        const userId = session?.metadata?.user_id || session?.client_reference_id;
        if (userId && session?.subscription) {
          const sub = await fetchStripeSubscription(session.subscription);
          if (sub) await upsertSubscriptionFromStripe(admin, userId, sub);
        }
      } else if (session?.metadata?.reading_question_id) {
        await admin
          .from("reading_questions")
          .update({
            status: "paid",
            stripe_payment_intent_id: session.payment_intent || null,
          })
          .eq("id", session.metadata.reading_question_id);
        try {
          await answerQuestion(admin, session.metadata.reading_question_id);
        } catch (error) {
          console.error("Answering question failed", error);
        }
      } else {
        const orderId =
          session?.metadata?.order_id ||
          session?.client_reference_id ||
          (
            await admin
              .from("orders")
              .select("id")
              .eq("stripe_checkout_session_id", session?.id)
              .maybeSingle()
          ).data?.id;

        if (orderId) {
          await updateOrder(
            orderId,
            {
              status: "paid",
              stripe_payment_intent_id: session.payment_intent || null,
            },
            { stage: "payment_received" },
          );
          // Fulfillment failures must not fail the webhook: Stripe would retry
          // the payment event and the order would be double-submitted.
          try {
            await submitOrderToPrintful(orderId);
          } catch (error) {
            console.error("Printful submission failed", error);
          }
        }
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data?.object;
      const userId = sub?.metadata?.user_id;
      if (userId) await upsertSubscriptionFromStripe(admin, userId, sub);
    }
  } catch (error) {
    console.error("Stripe webhook handling failed", error);
    return res.status(500).send("Handling failed");
  }

  return res.status(200).send("OK");
}
