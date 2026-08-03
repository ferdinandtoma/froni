import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../site/_worker.js';

const originalFetch = globalThis.fetch;

function harness({ posthog = false, assetStatus = 200, assetType = 'text/html' } = {}) {
  const calls = [];
  const pending = [];
  const env = {
    KLAVIYO_PRIVATE_KEY: 'private-key',
    KLAVIYO_LIST_ID: 'list-123',
    ...(posthog ? { POSTHOG_API_KEY: 'ph-key' } : {}),
    ASSETS: {
      async fetch() {
        return new Response(assetType.includes('text/html') ? '<!doctype html><p>Froni</p>' : 'asset', {
          status: assetStatus,
          headers: {
            'content-type': assetType,
            'set-cookie': 'forbidden=1'
          }
        });
      }
    }
  };
  const ctx = {
    waitUntil(promise) {
      pending.push(promise);
    }
  };

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push({ url, init });
    return new Response(null, { status: 202 });
  };

  return {
    env,
    ctx,
    calls,
    async drain() {
      await Promise.all(pending);
    }
  };
}

function request(path, init) {
  return new Request(`https://froni.co${path}`, init);
}

function formBody(email, website = '') {
  const body = new FormData();
  body.set('email', email);
  body.set('website', website);
  return body;
}

function callsTo(h, hostname) {
  return h.calls.filter(({ url }) => new URL(url).hostname === hostname);
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('form subscription relays to Klaviyo and redirects to check-inbox', async () => {
  const h = harness();
  const response = await worker.fetch(request('/api/subscribe', {
    method: 'POST',
    body: formBody('reader@example.com')
  }), h.env, h.ctx);

  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/#check-inbox');
  const klaviyo = callsTo(h, 'a.klaviyo.com');
  assert.equal(klaviyo.length, 1);
  assert.equal(new URL(klaviyo[0].url).pathname, '/api/profile-subscription-bulk-create-jobs/');
  const payload = JSON.parse(klaviyo[0].init.body);
  assert.equal(payload.data.relationships.list.data.id, 'list-123');
  assert.equal(payload.data.attributes.profiles.data[0].attributes.email, 'reader@example.com');
});

test('JSON subscription returns the check-your-inbox state', async () => {
  const h = harness();
  const response = await worker.fetch(request('/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'reader@example.com' })
  }), h.env, h.ctx);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, state: 'check-your-inbox' });
});

test('filled honeypot reports success without contacting Klaviyo', async () => {
  const h = harness();
  const response = await worker.fetch(request('/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'bot@example.com', website: 'https://spam.example' })
  }), h.env, h.ctx);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, state: 'check-your-inbox' });
  assert.equal(callsTo(h, 'a.klaviyo.com').length, 0);
});

test('invalid email redirects form requests and rejects JSON requests without Klaviyo', async () => {
  const formHarness = harness();
  const formResponse = await worker.fetch(request('/api/subscribe', {
    method: 'POST',
    body: formBody('not-an-email')
  }), formHarness.env, formHarness.ctx);
  assert.equal(formResponse.status, 303);
  assert.equal(formResponse.headers.get('location'), '/#error');
  assert.equal(callsTo(formHarness, 'a.klaviyo.com').length, 0);

  const jsonHarness = harness();
  const jsonResponse = await worker.fetch(request('/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'also-invalid' })
  }), jsonHarness.env, jsonHarness.ctx);
  assert.equal(jsonResponse.status, 400);
  assert.deepEqual(await jsonResponse.json(), { ok: false, state: 'error' });
  assert.equal(callsTo(jsonHarness, 'a.klaviyo.com').length, 0);
});

test('missing Klaviyo configuration returns 503 for JSON', async () => {
  const h = harness();
  delete h.env.KLAVIYO_PRIVATE_KEY;
  const response = await worker.fetch(request('/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'reader@example.com' })
  }), h.env, h.ctx);

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, state: 'error' });
  assert.equal(callsTo(h, 'a.klaviyo.com').length, 0);
});

test('non-ok Klaviyo response returns 502 for JSON', async () => {
  const h = harness();
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    h.calls.push({ url, init });
    return new Response(null, { status: 400 });
  };
  const response = await worker.fetch(request('/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'reader@example.com' })
  }), h.env, h.ctx);

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false, state: 'error' });
});

test('API routes return 405 and 404 as appropriate', async () => {
  const h = harness();
  const methodResponse = await worker.fetch(request('/api/subscribe'), h.env, h.ctx);
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.get('allow'), 'POST');

  const missingResponse = await worker.fetch(request('/api/anything-else'), h.env, h.ctx);
  assert.equal(missingResponse.status, 404);
});

test('social shortcuts redirect with source and edition campaign', async () => {
  const sources = { '/t': 'tiktok', '/i': 'instagram', '/y': 'youtube' };
  for (const [path, source] of Object.entries(sources)) {
    const h = harness();
    const response = await worker.fetch(request(path), h.env, h.ctx);
    assert.equal(response.status, 302);
    const location = new URL(response.headers.get('location'), 'https://froni.co');
    assert.equal(location.pathname, '/');
    assert.equal(location.searchParams.get('utm_source'), source);
    assert.equal(location.searchParams.get('utm_medium'), 'social');
    assert.equal(location.searchParams.get('utm_campaign'), 'edition-one');
  }
});

test('HTML pageview queues exactly one PostHog capture when configured', async () => {
  const h = harness({ posthog: true });
  const response = await worker.fetch(request('/'), h.env, h.ctx);
  assert.equal(response.status, 200);
  await h.drain();

  const captures = callsTo(h, 'eu.i.posthog.com');
  assert.equal(captures.length, 1);
  assert.equal(JSON.parse(captures[0].init.body).event, '$pageview');
});

test('successful subscription queues signup_submitted in PostHog', async () => {
  const h = harness({ posthog: true });
  const response = await worker.fetch(request('/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'reader@example.com' })
  }), h.env, h.ctx);
  assert.equal(response.status, 200);
  await h.drain();

  const captures = callsTo(h, 'eu.i.posthog.com');
  assert.equal(captures.length, 1);
  assert.equal(JSON.parse(captures[0].init.body).event, 'signup_submitted');
});

test('PostHog is skipped without its key and for non-ok asset responses', async () => {
  const noKey = harness();
  await worker.fetch(request('/'), noKey.env, noKey.ctx);
  await noKey.drain();
  assert.equal(callsTo(noKey, 'eu.i.posthog.com').length, 0);

  const nonOk = harness({ posthog: true, assetStatus: 404 });
  await worker.fetch(request('/missing'), nonOk.env, nonOk.ctx);
  await nonOk.drain();
  assert.equal(callsTo(nonOk, 'eu.i.posthog.com').length, 0);
});

test('responses carry security headers and strip set-cookie', async () => {
  const h = harness({ assetType: 'text/plain' });
  const response = await worker.fetch(request('/asset.txt'), h.env, h.ctx);

  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('set-cookie'), null);
});
