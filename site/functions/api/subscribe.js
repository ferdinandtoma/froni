/* Cloudflare Pages Function: POST /api/subscribe
   Validates the email, drops filled honeypots, relays server-side to
   Klaviyo's subscribe endpoint (double opt-in respected by list settings).
   Secrets come only from env: KLAVIYO_PRIVATE_KEY, KLAVIYO_LIST_ID.
   JSON requests (the enhanced form) get JSON matching the client states;
   form posts (no JS) get a 303 redirect back to the page's :target states. */

export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get('content-type') || '';
  const wantsJson = contentType.includes('application/json');
  const contentLength = Number(request.headers.get('content-length') || 0);

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

  const json = (ok, state, status) =>
    new Response(JSON.stringify({ ok, state }), {
      status: status || (ok ? 200 : 400),
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  const redirect = (hash) =>
    new Response(null, {
      status: 303,
      headers: {
        Location: '/#' + hash,
        'cache-control': 'no-store'
      }
    });

  const ok = () => (wantsJson ? json(true, 'check-your-inbox') : redirect('check-inbox'));
  const err = (status) => (wantsJson ? json(false, 'error', status) : redirect('error'));

  if (contentLength > 4096) return err(413);

  /* A filled honeypot is a bot: answer as success, relay nothing. */
  if (honeypot) return ok();

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) return err(400);

  if (!env.KLAVIYO_PRIVATE_KEY || !env.KLAVIYO_LIST_ID) return err(503);

  const res = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
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
                subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } }
              }
            }]
          },
          historical_import: false
        },
        relationships: {
          list: { data: { type: 'list', id: env.KLAVIYO_LIST_ID } }
        }
      }
    })
  }).catch(() => null);

  if (!res || !res.ok) return err(502);
  return ok();
}
