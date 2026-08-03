/*
  orders/create webhook: keep the Edition One shared pool honest.
  Scope position 1A. Dormant until deployed; see edition-pool.server.ts.
*/
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { syncPool } from "../services/edition-pool.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, admin, payload, shop } = await authenticate.webhook(request);

  if (topic !== "ORDERS_CREATE" || !admin) {
    return new Response();
  }

  const productId = process.env.EDITION_PRODUCT_ID;
  const numericId = productId?.split("/").pop();
  const touchesEdition =
    !!numericId &&
    Array.isArray((payload as any)?.line_items) &&
    (payload as any).line_items.some(
      (item: { product_id?: number | string }) => String(item.product_id) === numericId,
    );

  if (touchesEdition) {
    try {
      const { ordered, remaining } = await syncPool(admin.graphql);
      console.log(`[edition-pool] ${shop}: ordered=${ordered} remaining=${remaining}`);
    } catch (error) {
      /* Webhooks must 200 fast; the pool self-heals on the next order or the close job. */
      console.error("[edition-pool] sync failed", error);
    }
  }

  return new Response();
};
