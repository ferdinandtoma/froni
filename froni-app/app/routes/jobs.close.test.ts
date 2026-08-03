import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../shopify.server", () => ({
  unauthenticated: { admin: vi.fn() },
}));
vi.mock("../services/edition-pool.server", () => ({
  closeWindow: vi.fn(),
}));

import { unauthenticated } from "../shopify.server";
import { closeWindow } from "../services/edition-pool.server";
import { action, loader } from "./jobs.close";

const TOKEN = "test-close-token";
const SHOP = "zkg1yj-ze.myshopify.com";

const unauthenticatedAdminMock = vi.mocked(unauthenticated.admin);
const closeWindowMock = vi.mocked(closeWindow);

function request(options: { method?: string; token?: string } = {}) {
  const headers: Record<string, string> = {};
  if (options.token !== undefined) headers["x-close-token"] = options.token;
  return new Request("https://example.com/jobs/close", {
    method: options.method ?? "POST",
    headers,
  });
}

beforeEach(() => {
  unauthenticatedAdminMock.mockReset();
  closeWindowMock.mockReset();
});

afterEach(() => {
  delete process.env.CLOSE_JOB_TOKEN;
  delete process.env.SHOP_DOMAIN;
});

describe("jobs.close loader", () => {
  it("returns 405 on GET", async () => {
    const response = await loader({ request: request({ method: "GET" }) } as never);
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
  });
});

describe("jobs.close action", () => {
  it("returns 503 without CLOSE_JOB_TOKEN", async () => {
    process.env.SHOP_DOMAIN = SHOP;
    delete process.env.CLOSE_JOB_TOKEN;

    const response = await action({ request: request({ token: TOKEN }) } as never);

    expect(response.status).toBe(503);
    expect(closeWindowMock).not.toHaveBeenCalled();
  });

  it("returns 503 without SHOP_DOMAIN", async () => {
    process.env.CLOSE_JOB_TOKEN = TOKEN;
    delete process.env.SHOP_DOMAIN;

    const response = await action({ request: request({ token: TOKEN }) } as never);

    expect(response.status).toBe(503);
    expect(closeWindowMock).not.toHaveBeenCalled();
  });

  it("returns 401 on a bad token", async () => {
    process.env.CLOSE_JOB_TOKEN = TOKEN;
    process.env.SHOP_DOMAIN = SHOP;

    const response = await action({ request: request({ token: "wrong-token" }) } as never);

    expect(response.status).toBe(401);
    expect(closeWindowMock).not.toHaveBeenCalled();
  });

  it("calls closeWindow on the happy path", async () => {
    process.env.CLOSE_JOB_TOKEN = TOKEN;
    process.env.SHOP_DOMAIN = SHOP;
    const graphql = vi.fn();
    unauthenticatedAdminMock.mockResolvedValue({ admin: { graphql } } as never);
    closeWindowMock.mockResolvedValue(undefined);

    const response = await action({ request: request({ token: TOKEN }) } as never);

    expect(unauthenticatedAdminMock).toHaveBeenCalledWith(SHOP);
    expect(closeWindowMock).toHaveBeenCalledWith(graphql);
    expect(response.status).toBe(200);
  });
});
