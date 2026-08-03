/*
  Cloudflare Pages advanced-mode worker.
  This keeps the public page scriptless while relaying signup requests to
  Klaviyo server-side. Reach measurement is server-side too: PostHog EU,
  ruled in 3 Aug 2026. No cookies, no scripts, a daily-rotating hashed
  identifier from IP and user agent, never stored raw.
*/

const POSTHOG_HOST = 'https://eu.i.posthog.com';

async function posthogDistinctId(request) {
  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get('cf-connecting-ip') || '';
  const ua = request.headers.get('user-agent') || '';
  const data = new TextEncoder().encode(day + ':' + ip + ':' + ua);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function posthogCapture(env, ctx, request, event, properties) {
  if (!env.POSTHOG_API_KEY) return;
  ctx.waitUntil(
    (async () => {
      const distinct_id = await posthogDistinctId(request);
      await fetch(POSTHOG_HOST + '/i/v0/e/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          api_key: env.POSTHOG_API_KEY,
          event,
          distinct_id,
          properties,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    })()
  );
}

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self'; font-src 'self'; style-src 'self'; script-src 'none'; upgrade-insecure-requests",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
};

function harden(response, hostname) {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  /* The Pages fallback domain is only for deployment checks. */
  if (hostname.endsWith('.pages.dev')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  /* Never allow the capture site itself to create a browser cookie. */
  headers.delete('access-control-allow-origin');
  headers.delete('set-cookie');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function json(ok, state, status) {
  return new Response(JSON.stringify({ ok, state }), {
    status: status || (ok ? 200 : 400),
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function redirect(hash) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/#' + hash,
      'cache-control': 'no-store'
    }
  });
}

const SOCIAL_PATHS = {
  '/t': 'tiktok',
  '/i': 'instagram',
  '/y': 'youtube'
};

const VALID_SOURCES = ['tiktok', 'instagram', 'youtube'];

function cleanSource(value) {
  const v = String(value || '').toLowerCase();
  return VALID_SOURCES.indexOf(v) === -1 ? '' : v;
}

function cleanCampaign(value) {
  const v = String(value || '').toLowerCase();
  return /^[a-z0-9-]{1,40}$/.test(v) ? v : '';
}

async function subscribe(request, env, ctx) {
  const url = new URL(request.url);
  const signupSource = cleanSource(url.searchParams.get('utm_source'));
  const signupCampaign = cleanCampaign(url.searchParams.get('utm_campaign'));
  const contentType = request.headers.get('content-type') || '';
  const wantsJson = contentType.includes('application/json');
  const contentLength = Number(request.headers.get('content-length') || 0);
  const ok = () => (
    wantsJson
      ? json(true, 'check-your-inbox')
      : redirect('check-inbox')
  );
  const err = (status) => (
    wantsJson
      ? json(false, 'error', status)
      : redirect('error')
  );

  if (contentLength > 4096) return err(413);

  let email = '';
  let honeypot = '';

  if (wantsJson) {
    const body = await request.json().catch(() => ({}));
    email = String(body.email || '').trim();
    honeypot = String(body.website || '').trim();
  } else {
    const form = await request.formData().catch(() => null);
    email = String((form && form.get('email')) || '').trim();
    honeypot = String((form && form.get('website')) || '').trim();
  }

  /* A filled honeypot is a bot: answer as success, relay nothing. */
  if (honeypot) return ok();

  posthogCapture(env, ctx, request, 'signup_submitted', {
    signup_source: signupSource || undefined,
    signup_campaign: signupCampaign || undefined
  });

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) return err(400);

  if (!env.KLAVIYO_PRIVATE_KEY || !env.KLAVIYO_LIST_ID) return err(503);

  const response = await fetch(
    'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Klaviyo-API-Key ' + env.KLAVIYO_PRIVATE_KEY,
        'content-type': 'application/json',
        revision: '2026-07-15'
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: {
              data: [{
                type: 'profile',
                attributes: {
                  email,
                  ...(signupSource || signupCampaign
                    ? {
                        properties: {
                          ...(signupSource ? { signup_source: signupSource } : {}),
                          ...(signupCampaign ? { signup_campaign: signupCampaign } : {})
                        }
                      }
                    : {}),
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: 'SUBSCRIBED'
                      }
                    }
                  }
                }
              }]
            },
            historical_import: false
          },
          relationships: {
            list: {
              data: {
                type: 'list',
                id: env.KLAVIYO_LIST_ID
              }
            }
          }
        }
      })
    }
  ).catch(() => null);

  if (!response || !response.ok) return err(502);
  return ok();
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let response;

    if (request.method === 'GET' && SOCIAL_PATHS[url.pathname]) {
      const target =
        '/?utm_source=' + SOCIAL_PATHS[url.pathname] +
        '&utm_medium=social&utm_campaign=edition-one';
      return harden(
        new Response(null, {
          status: 302,
          headers: { Location: target, 'cache-control': 'no-store' }
        }),
        url.hostname
      );
    }

    if (url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') {
        response = new Response(null, {
          status: 405,
          headers: { Allow: 'POST' }
        });
      } else {
        response = await subscribe(request, env, ctx);
      }
    } else if (url.pathname.startsWith('/api/')) {
      response = new Response(null, { status: 404 });
    } else {
      response = await env.ASSETS.fetch(request);

      if (
        request.method === 'GET' &&
        response.ok &&
        (response.headers.get('content-type') || '').includes('text/html')
      ) {
        posthogCapture(env, ctx, request, '$pageview', {
          $current_url: url.origin + url.pathname,
          path: url.pathname,
          signup_source: cleanSource(url.searchParams.get('utm_source')) || undefined,
          signup_campaign: cleanCampaign(url.searchParams.get('utm_campaign')) || undefined
        });
      }

      const signupSource = cleanSource(url.searchParams.get('utm_source'));
      const signupCampaign = cleanCampaign(url.searchParams.get('utm_campaign'));
      const isHtml = (response.headers.get('content-type') || '').includes('text/html');

      if (isHtml && (signupSource || signupCampaign)) {
        const params = new URLSearchParams();
        if (signupSource) params.set('utm_source', signupSource);
        if (signupCampaign) params.set('utm_campaign', signupCampaign);
        const action = '/api/subscribe?' + params.toString();
        response = new HTMLRewriter()
          .on('form.signup', {
            element(el) {
              el.setAttribute('action', action);
            }
          })
          .transform(response);
      }
    }

    return harden(response, url.hostname);
  }
};
