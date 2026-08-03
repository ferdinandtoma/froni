/*
  Edition One shared pool.

  Scope position 1A (Froni_Edition_One_Window_Scope_03Aug2026.md): Shopify tracks
  inventory per variant, so four size variants cannot natively share the 200 cap.
  This service keeps remaining = cap minus units ordered, and writes remaining
  into every variant's available quantity, so the door closes at the 200th unit
  regardless of size mix.

  Ruled 3 Aug 2026, evening round: cap mechanism A (this pool), open scheduled,
  close manual with the /jobs/close endpoint kept as an emergency lever only,
  and the count that closes the door is PAID units, encoded in ORDERS_QUERY.
  Still not deployed and untested against a live store; hosting decision pends.

  Env expected at deploy:
    EDITION_PRODUCT_ID  gid://shopify/Product/...  (the Edition One product)
    EDITION_CAP         defaults to 200
*/

const EDITION_CAP = Number(process.env.EDITION_CAP || 200);

type AdminGraphql = (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>;

const POOL_QUERY = `#graphql
  query editionPool($productId: ID!) {
    product(id: $productId) {
      id
      variants(first: 10) {
        nodes {
          id
          inventoryItem {
            id
            inventoryLevels(first: 5) {
              nodes {
                location { id } quantities(names: ["available"]) { quantity }
              }
            }
          }
        }
      }
    }
  }
`;

/* Paid units count the door, ruled 3 Aug 2026 evening, matching SoT 17.14.
   An order that is later refunded drops out of the filter and frees its slot,
   which is correct while the window is open; numbers assign at packing. */
const ORDERS_QUERY = `#graphql
  query editionOrders($cursor: String) {
    orders(first: 250, after: $cursor, query: "status:any financial_status:paid") {
      pageInfo { hasNextPage endCursor }
      nodes {
        cancelledAt
        lineItems(first: 20) {
          nodes {
            quantity
            product { id }
          }
        }
      }
    }
  }
`;

const SET_QUANTITIES = `#graphql
  mutation editionSetAvailable($input: InventorySetQuantitiesInput!, $key: String!) {
    inventorySetQuantities(input: $input) @idempotent(key: $key) {
      userErrors { field message }
    }
  }
`;

async function gql(graphql: AdminGraphql, query: string, variables?: Record<string, unknown>) {
  let response!: Response; try { response = await graphql(query, { variables }); } catch (e: any) { console.error("[edition-pool] graphql threw", JSON.stringify({ message: e?.message, gql: e?.graphQLErrors ?? e?.body?.errors ?? null })); throw e; }
  const body = (await response.json()) as { data?: any; errors?: unknown };
  if (body.errors) throw new Error(`Admin API error: ${JSON.stringify(body.errors)}`);
  return body.data;
}

export async function unitsOrdered(graphql: AdminGraphql, productId: string): Promise<number> {
  let total = 0;
  let cursor: string | null = null;
  for (;;) {
    const data = await gql(graphql, ORDERS_QUERY, { cursor });
    for (const order of data.orders.nodes) {
      if (order.cancelledAt) continue;
      for (const item of order.lineItems.nodes) {
        if (item.product?.id === productId) total += item.quantity;
      }
    }
    if (!data.orders.pageInfo.hasNextPage) break;
    cursor = data.orders.pageInfo.endCursor;
  }
  return total;
}

async function setEveryVariantAvailable(graphql: AdminGraphql, productId: string, available: number) {
  const data = await gql(graphql, POOL_QUERY, { productId });
  const quantities: Array<{ inventoryItemId: string; locationId: string; quantity: number; changeFromQuantity: number }> = [];
  for (const variant of data.product.variants.nodes) {
    for (const level of variant.inventoryItem.inventoryLevels.nodes) {
      quantities.push({
        inventoryItemId: variant.inventoryItem.id,
        locationId: level.location.id,
        quantity: available, changeFromQuantity: level.quantities?.[0]?.quantity ?? 0,
      });
    }
  }
  const result = await gql(graphql, SET_QUANTITIES, {
    key: globalThis.crypto?.randomUUID?.() ?? String(Date.now()), input: {
      name: "available",
      reason: "correction",
      quantities,
    },
  });
  const errors = result.inventorySetQuantities.userErrors;
  if (errors.length) throw new Error(`inventorySetQuantities: ${JSON.stringify(errors)}`);
}

/* Recompute the shared pool and write it into every size variant. */
export async function syncPool(graphql: AdminGraphql): Promise<{ ordered: number; remaining: number }> {
  const productId = process.env.EDITION_PRODUCT_ID;
  if (!productId) throw new Error("EDITION_PRODUCT_ID is not set");
  const ordered = await unitsOrdered(graphql, productId);
  const remaining = Math.max(0, EDITION_CAP - ordered);
  await setEveryVariantAvailable(graphql, productId, remaining);
  return { ordered, remaining };
}

/* The timed close, scope position 3C: zero every variant at the 24 hour mark. */
export async function closeWindow(graphql: AdminGraphql): Promise<void> {
  const productId = process.env.EDITION_PRODUCT_ID;
  if (!productId) throw new Error("EDITION_PRODUCT_ID is not set");
  await setEveryVariantAvailable(graphql, productId, 0);
}
