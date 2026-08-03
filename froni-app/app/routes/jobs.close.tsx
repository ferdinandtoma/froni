/*
  The timed close, scope position 3C: an external scheduler calls this at the
  24 hour mark and every variant goes to zero available. Sellout before the
  mark makes the call a no-op.

  POST /jobs/close with header X-Close-Token: $CLOSE_JOB_TOKEN
  Env: CLOSE_JOB_TOKEN (random secret), SHOP_DOMAIN (zkg1yj-ze.myshopify.com),
  plus the edition-pool env. Dormant until deployed and until Ferdinand rules
  decision 3; his ruled position may be the manual close instead.
*/
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { unauthenticated } from "../shopify.server";
import { closeWindow } from "../services/edition-pool.server";

export const loader = async (_args: LoaderFunctionArgs) => {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const token = process.env.CLOSE_JOB_TOKEN;
  const shop = process.env.SHOP_DOMAIN;

  if (!token || !shop) {
    return new Response("close job not configured", { status: 503 });
  }
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  if (request.headers.get("x-close-token") !== token) {
    return new Response(null, { status: 401 });
  }

  const { admin } = await unauthenticated.admin(shop);
  await closeWindow(admin.graphql);
  console.log(`[edition-pool] window closed for ${shop}`);
  return new Response(JSON.stringify({ closed: true }), {
    headers: { "content-type": "application/json" },
  });
};
