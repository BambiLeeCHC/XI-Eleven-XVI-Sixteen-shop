import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

type Request = { method?: string; body: any; query?: Record<string, string> };
type Response = {
  setHeader(name: string, value: string): void;
  status(code: number): Response;
  send(body: string): void;
};

const CONVEX_URL = "https://calculating-octopus-439.convex.cloud";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }
  if (!process.env.PRINTFUL_WEBHOOK_TOKEN || req.query?.token !== process.env.PRINTFUL_WEBHOOK_TOKEN) {
    return res.status(401).send("Unauthorized");
  }

  const event = req.body;
  const orderId = event?.data?.order?.external_id;
  if (!orderId) return res.status(200).send("Ignored");

  const convex = new ConvexHttpClient(CONVEX_URL);
  if (event.type === "package_shipped") {
    const shipment = event.data?.shipment || {};
    await convex.mutation(anyApi.orders.updateStatus, {
      orderId,
      status: "shipped",
      fulfillmentStage: "shipped",
      trackingUrl: shipment.tracking_url || undefined,
      trackingNumber: shipment.tracking_number || undefined,
      trackingCarrier: shipment.carrier || undefined,
    });
  } else if (event.type === "order_updated") {
    const status = event.data?.order?.status;
    if (status === "fulfilled") {
      await convex.mutation(anyApi.orders.updateStatus, {
        orderId,
        status: "fulfilled",
        fulfillmentStage: "printful_fulfilled",
        printfulStatus: status,
      });
    }
  } else if (event.type === "order_failed") {
    const reason =
      event.data?.reason ||
      event.data?.order?.failure_reason ||
      "Production needs attention. Our support team is reviewing the order.";
    await convex.mutation(anyApi.orders.updateStatus, {
      orderId,
      status: "paid",
      fulfillmentException: String(reason).slice(0, 300),
    });
  }

  return res.status(200).send("OK");
}
