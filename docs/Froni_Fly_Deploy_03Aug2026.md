# Fly deploy, the edition app

Ruled 3 Aug 2026: Fly.io hosts froni-app. App name froni-edition, region fra, one always-on shared-cpu-1x machine with 512 MB, a 1 GB volume named froni_data, SQLite at /data/prod.sqlite. Cost sits near five euros a month. The webhook and the pool must not sleep during the window, so autostop stays off.

fly.toml lives in froni-app and is committed. The prisma datasource reads DATABASE_URL from the environment. shopify.app.toml carries the real URLs: application_url https://froni-edition.fly.dev, redirect /auth/callback.

## The one human step

flyctl is installed in the codespace at ~/.fly/bin/flyctl. Run:

    ~/.fly/bin/flyctl auth login

Account and payment method are yours alone. Everything after is scripted.

## After auth, in order

    cd /workspaces/froni/froni-app
    ~/.fly/bin/flyctl apps create froni-edition
    ~/.fly/bin/flyctl volumes create froni_data --region fra --size 1 -a froni-edition -y
    ~/.fly/bin/flyctl secrets set -a froni-edition \
      SHOPIFY_API_KEY=91ef1811d3119c40ab480aff3fc66d01 \
      SHOPIFY_API_SECRET=FROM_PARTNER_DASHBOARD_APP_CREDENTIALS \
      SHOPIFY_APP_URL=https://froni-edition.fly.dev \
      SCOPES=read_products,read_orders,read_inventory,write_inventory \
      SHOP_DOMAIN=zkg1yj-ze.myshopify.com \
      EDITION_PRODUCT_ID=gid://shopify/Product/16026172850558 \
      CLOSE_JOB_TOKEN=$(openssl rand -hex 24)
    ~/.fly/bin/flyctl deploy -a froni-edition

Record the CLOSE_JOB_TOKEN value once, in the private store, never in this repo.

## Then Shopify config push and install

    npm run shopify app deploy   # pushes application_url, redirect, orders/paid webhook

Install the app on zkg1yj-ze.myshopify.com from the Partner dashboard install link.

## The drill that proves it

1. Place a test order on the dev store and pay it with the bogus gateway.
2. Watch fly logs: orders/paid arrives, syncPool runs, every variant shows 199.
3. POST /jobs/close with X-Close-Token; every variant shows 0.
4. Run syncPool once more; pool returns to cap minus paid. Screenshot the three states into docs.
