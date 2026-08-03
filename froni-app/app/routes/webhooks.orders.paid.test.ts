import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../shopify.server", () => ({
  authenticate: { webhook: vi.fn() },
}));
vi.mock("../services/edition-pool.server", () => ({
  syncPool: vi.fn(),
}));

import { authenticate } from "../shopify.server";
import { syncPool } from "../services/edition-pool.server";
import { action } from "./webhooks.orders.paid";

const PRODUCT_ID = "gid://shopify/Product/16026172850558";
const NUMERIC_PRODUCT_ID = "16026172850558";

const webhookMock = vi.mocked(authenticate.webhook);
const syncPoolMock = vi.mocked(syncPool);

function webhookContext(overrides: Record<string, unknown>) {
  return {
    apiVersion: "2026-07",
    shop: "zkg1yj-ze.myshopify.com",
    topic: "ORDERS_PAID",
    webhookId: "webhook-1",
    payload: {},
    webhookType: "webhooks",
    session: undefined,
    admin: undefined,
    ...overrides,
  } as never;
}

function request() {
  return new Request("https://example.com/webhooks/orders/paid", { method: "POST" });
}

beforeEach(() => {
  process.env.EDITION_PRODUCT_ID = PRODUCT_ID;
  syncPoolMock.mockReset();
  webhookMock.mockReset();
});

afterEach(() => {
  delete process.env.EDITION_PRODUCT_ID;
});

describe("webhooks.orders.paid action", () => {
  it("returns 200 and does nothing for non ORDERS_PAID topics", async () => {
    webhookMock.mockResolvedValue(
      webhookContext({
        topic: "APP_UNINSTALLED",
        admin: { graphql: vi.fn() },
        payload: { line_items: [{ product_id: NUMERIC_PRODUCT_ID }] },
      }),
    );

    const response = await action({ request: request() } as never);

    expect(response.status).toBe(200);
    expect(syncPoolMock).not.toHaveBeenCalled();
  });

  it("returns 200 and does nothing when admin is missing", async () => {
    webhookMock.mockResolvedValue(
      webhookContext({
        topic: "ORDERS_PAID",
        admin: undefined,
        payload: { line_items: [{ product_id: NUMERIC_PRODUCT_ID }] },
      }),
    );

    const response = await action({ request: request() } as never);

    expect(response.status).toBe(200);
    expect(syncPoolMock).not.toHaveBeenCalled();
  });

  it("ignores orders whose line items do not contain the edition product", async () => {
    webhookMock.mockResolvedValue(
      webhookContext({
        topic: "ORDERS_PAID",
        admin: { graphql: vi.fn() },
        payload: { line_items: [{ product_id: "999999" }] },
      }),
    );

    const response = await action({ request: request() } as never);

    expect(response.status).toBe(200);
    expect(syncPoolMock).not.toHaveBeenCalled();
  });

  it("never throws when syncPool rejects, logs and still 200s", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const graphql = vi.fn();
    webhookMock.mockResolvedValue(
      webhookContext({
        topic: "ORDERS_PAID",
        admin: { graphql },
        payload: { line_items: [{ product_id: NUMERIC_PRODUCT_ID }] },
      }),
    );
    syncPoolMock.mockRejectedValue(new Error("boom"));

    const response = await action({ request: request() } as never);

    expect(response.status).toBe(200);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("calls syncPool when the order touches the edition product", async () => {
    const graphql = vi.fn();
    webhookMock.mockResolvedValue(
      webhookContext({
        topic: "ORDERS_PAID",
        admin: { graphql },
        payload: { line_items: [{ product_id: NUMERIC_PRODUCT_ID }] },
      }),
    );
    syncPoolMock.mockResolvedValue({ ordered: 10, remaining: 190 });

    const response = await action({ request: request() } as never);

    expect(response.status).toBe(200);
    expect(syncPoolMock).toHaveBeenCalledWith(graphql);
  });
});
