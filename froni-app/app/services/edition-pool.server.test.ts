import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { closeWindow, syncPool, unitsOrdered } from "./edition-pool.server";

const PRODUCT_ID = "gid://shopify/Product/16026172850558";
const OTHER_PRODUCT_ID = "gid://shopify/Product/999";

function jsonResponse(data: unknown): Response {
  return { json: async () => ({ data }) } as Response;
}

function ordersPage(
  lineItems: Array<{ quantity: number; productId: string | null }>,
  options: { cancelled?: boolean; hasNextPage?: boolean; endCursor?: string | null } = {},
) {
  return {
    orders: {
      pageInfo: { hasNextPage: options.hasNextPage ?? false, endCursor: options.endCursor ?? null },
      nodes: [
        {
          cancelledAt: options.cancelled ? "2026-08-01T00:00:00Z" : null,
          lineItems: {
            nodes: lineItems.map((item) => ({
              quantity: item.quantity,
              product: item.productId ? { id: item.productId } : null,
            })),
          },
        },
      ],
    },
  };
}

function poolResponse() {
  return {
    product: {
      id: PRODUCT_ID,
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/1",
            inventoryItem: {
              id: "gid://shopify/InventoryItem/1",
              inventoryLevels: {
                nodes: [{ location: { id: "gid://shopify/Location/1" } }, { location: { id: "gid://shopify/Location/2" } }],
              },
            },
          },
          {
            id: "gid://shopify/ProductVariant/2",
            inventoryItem: {
              id: "gid://shopify/InventoryItem/2",
              inventoryLevels: {
                nodes: [{ location: { id: "gid://shopify/Location/1" } }, { location: { id: "gid://shopify/Location/2" } }],
              },
            },
          },
        ],
      },
    },
  };
}

function makeGraphql(options: {
  ordersPages?: unknown[];
  pool?: unknown;
  setQuantitiesUserErrors?: Array<{ field: string[]; message: string }>;
} = {}) {
  const { ordersPages = [], pool = poolResponse(), setQuantitiesUserErrors = [] } = options;
  let ordersCallIndex = 0;
  const setQuantitiesCalls: Array<{ variables?: Record<string, unknown> }> = [];

  const graphql = vi.fn(async (query: string, requestOptions?: { variables?: Record<string, unknown> }) => {
    if (query.includes("editionOrders")) {
      const page = ordersPages[ordersCallIndex];
      ordersCallIndex += 1;
      return jsonResponse(page);
    }
    if (query.includes("editionPool")) {
      return jsonResponse(pool);
    }
    if (query.includes("editionSetAvailable")) {
      setQuantitiesCalls.push({ variables: requestOptions?.variables });
      return jsonResponse({ inventorySetQuantities: { userErrors: setQuantitiesUserErrors } });
    }
    throw new Error(`unexpected query: ${query}`);
  });

  return { graphql, setQuantitiesCalls };
}

beforeEach(() => {
  process.env.EDITION_PRODUCT_ID = PRODUCT_ID;
});

afterEach(() => {
  delete process.env.EDITION_PRODUCT_ID;
});

describe("unitsOrdered", () => {
  it("sums quantities only for the edition product id, skips cancelled orders, follows pagination, filters financial_status:paid", async () => {
    const page1 = ordersPage(
      [
        { quantity: 3, productId: PRODUCT_ID },
        { quantity: 5, productId: OTHER_PRODUCT_ID },
      ],
      { hasNextPage: true, endCursor: "cursor1" },
    );
    const cancelledOrder = {
      orders: {
        pageInfo: { hasNextPage: true, endCursor: "cursor1" },
        nodes: [
          ...page1.orders.nodes,
          {
            cancelledAt: "2026-08-01T00:00:00Z",
            lineItems: { nodes: [{ quantity: 100, product: { id: PRODUCT_ID } }] },
          },
        ],
      },
    };
    const page2 = ordersPage([{ quantity: 4, productId: PRODUCT_ID }], { hasNextPage: false });

    const { graphql } = makeGraphql({ ordersPages: [cancelledOrder, page2] });

    const total = await unitsOrdered(graphql, PRODUCT_ID);

    expect(total).toBe(7);
    expect(graphql).toHaveBeenCalledTimes(2);
    expect(graphql.mock.calls[0][0]).toContain("financial_status:paid");
    expect(graphql.mock.calls[0][1]).toEqual({ variables: { cursor: null } });
    expect(graphql.mock.calls[1][1]).toEqual({ variables: { cursor: "cursor1" } });
  });
});

describe("syncPool", () => {
  it("throws without EDITION_PRODUCT_ID", async () => {
    delete process.env.EDITION_PRODUCT_ID;
    const { graphql } = makeGraphql();

    await expect(syncPool(graphql)).rejects.toThrow("EDITION_PRODUCT_ID is not set");
    expect(graphql).not.toHaveBeenCalled();
  });

  it("computes remaining as cap minus ordered and writes the same available quantity to every variant at every location", async () => {
    const ordersPages = [ordersPage([{ quantity: 50, productId: PRODUCT_ID }])];
    const { graphql, setQuantitiesCalls } = makeGraphql({ ordersPages });

    const result = await syncPool(graphql);

    expect(result).toEqual({ ordered: 50, remaining: 150 });
    const quantities = setQuantitiesCalls[0].variables?.input as { quantities: Array<{ quantity: number }> };
    expect(quantities.quantities).toHaveLength(4);
    expect(quantities.quantities.every((q) => q.quantity === 150)).toBe(true);
  });

  it("clamps remaining at zero when units ordered exceed the cap", async () => {
    const ordersPages = [ordersPage([{ quantity: 250, productId: PRODUCT_ID }])];
    const { graphql, setQuantitiesCalls } = makeGraphql({ ordersPages });

    const result = await syncPool(graphql);

    expect(result).toEqual({ ordered: 250, remaining: 0 });
    const quantities = setQuantitiesCalls[0].variables?.input as { quantities: Array<{ quantity: number }> };
    expect(quantities.quantities.every((q) => q.quantity === 0)).toBe(true);
  });

  it("surfaces inventorySetQuantities userErrors", async () => {
    const ordersPages = [ordersPage([{ quantity: 10, productId: PRODUCT_ID }])];
    const { graphql } = makeGraphql({
      ordersPages,
      setQuantitiesUserErrors: [{ field: ["quantities", "0"], message: "boom" }],
    });

    await expect(syncPool(graphql)).rejects.toThrow(/inventorySetQuantities/);
  });
});

describe("closeWindow", () => {
  it("throws without EDITION_PRODUCT_ID", async () => {
    delete process.env.EDITION_PRODUCT_ID;
    const { graphql } = makeGraphql();

    await expect(closeWindow(graphql)).rejects.toThrow("EDITION_PRODUCT_ID is not set");
  });

  it("writes zero to every variant", async () => {
    const { graphql, setQuantitiesCalls } = makeGraphql();

    await closeWindow(graphql);

    const quantities = setQuantitiesCalls[0].variables?.input as { quantities: Array<{ quantity: number }> };
    expect(quantities.quantities).toHaveLength(4);
    expect(quantities.quantities.every((q) => q.quantity === 0)).toBe(true);
  });
});
