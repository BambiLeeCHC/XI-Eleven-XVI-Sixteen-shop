/**
 * Printful → order state (shipping, tracking, production failures).
 */

import { type ApiRequest, type ApiResponse, updateOrder } from "./_lib/server";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  const token = req.query?.token;
  const provided = Array.isArray(token) ? token[0] : token;
  if (
    !process.env.PRINTFUL_WEBHOOK_TOKEN ||
    provided !== process.env.PRINTFUL_WEBHOOK_TOKEN
  ) {
    return res.status(401).send("Unauthorized");
  }

  const event = req.body;
  const orderId = event?.data?.order?.external_id;
  if (!orderId) return res.status(200).send("Ignored");

  try {
    if (event.type === "package_shipped") {
      const shipment = event.data?.shipment ?? {};
      await updateOrder(
        orderId,
        {
          status: "shipped",
          tracking_url: shipment.tracking_url || null,
          tracking_number: shipment.tracking_number || null,
          tracking_carrier: shipment.carrier || null,
        },
        { stage: "shipped" },
      );
    } else if (event.type === "order_updated") {
      const status = event.data?.order?.status;
      if (status === "fulfilled") {
        await updateOrder(
          orderId,
          { status: "fulfilled", printful_status: status },
          { stage: "printful_fulfilled" },
        );
      }
    } else if (event.type === "order_failed") {
      const reason =
        event.data?.reason ||
        event.data?.order?.failure_reason ||
        "Production needs attention. Our support team is reviewing the order.";
      await updateOrder(orderId, {
        status: "paid",
        fulfillment_exception: String(reason).slice(0, 300),
      });
    }
  } catch (error) {
    console.error("Printful webhook handling failed", error);
    return res.status(500).send("Handling failed");
  }

  return res.status(200).send("OK");
}
