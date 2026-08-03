# Edition One window mechanic, scope

Dated 3 Aug 2026. Ruled the same evening: cap mechanism A (app pool), open scheduled, close manual with the app endpoint kept as an emergency lever only, count paid per Source of Truth 17.14, hosting decided at build. The decision list below stands as the record of the options weighed.

Scope only, nothing here is built. Decisions landed with Ferdinand as above. Written against the 3 Aug ruling in `SourceOfTruth.md` section 4: cap 200; the window closes at the 200th order or 24 hours from open, whichever comes first; under-200 close handling is parked; the order-count-becomes-edition-size rule starts at Edition Two.

## Ground facts

- Store: Froni Apparel, `zkg1yj-ze.myshopify.com`, Basic plan, EUR, Germany.
- Basic plan means no Launchpad, which is Plus only. Shopify Flow is included on Basic and has a scheduled-time trigger; its exact action set gets verified at build.
- Publishing a product to the Online Store at a set date and time is native admin (scheduled availability).
- Inventory tracking with continue-selling switched off blocks orders at zero natively. Checkout holds at the boundary can let simultaneous checkouts land; canon already covers overflow: it rolls to Edition Two's early door and is never fulfilled from Edition One.

## The cap: 200 across sizes, not per size

Made to order, sizes S to XL, one colour. Shopify tracks inventory per variant, so four size variants cannot natively share one 200 pool. Options:

A. App-managed shared pool. The froni-app listens to order webhooks, keeps remaining equal to 200 minus orders, and writes remaining into every variant's available quantity. One counter, honest sizes. Needs the app deployed, plus read_orders and write_inventory.
B. Pre-split the 200 across sizes. Native, no app, but it strands unsold allocations in the wrong sizes and invents per-size scarcity. Fights the made-to-order fact.
C. Single variant, size collected after the order. Native and exact, but sizing outside checkout is worse buying and worse data.

My position: A.

## Opening the window

The product sits unpublished with inventory 200 until opening, then publishes. Options: native scheduled availability at the opening time, or manual publish by Ferdinand at the moment. My position: native scheduling.

## The 24-hour close

Sellout closes itself. The timed close needs an actor at open plus 24 hours:

A. Manual. Ferdinand sets every variant's available quantity to zero at the mark. With the calendar's Sunday 18:00 CET open, the mark is Monday 18:00 CET. Awake hours, one known moment, zero build.
B. Shopify Flow scheduled workflow zeroing availability at the mark. No code; Flow's inventory actions need verification at build.
C. froni-app scheduled job calling the Admin API at the mark. Exact and testable, but requires hosting, deploy, and the scope set now in `froni-app/shopify.app.toml`.

My position: A for Edition One. One close, known time, human present. C only if the close must run without hands.

## After close

One URL, three states in time is canon: capture now, store at open, permanent record after. A sellout at 200 reads sold out natively and truthfully. A close under 200 must not read sold out, because it is not true; what the record page says then is exactly the parked under-200 item in the 3 Aug ruling and stays parked until it fires. No countdown, no counters, no urgency elements at any point. The page states nouns and dates.

## Decisions for Ferdinand

1. Cap mechanism: A, B, or C. My position A.
2. Open mechanism: scheduled or manual. My position scheduled.
3. Close mechanism: A, B, or C. My position A.
4. If 1A or 3C: where froni-app hosts. This sets application_url and redirect_urls in `shopify.app.toml`.
5. The count that closes the door: orders created, or paid. Section 17.14 of the Source of Truth records 200th paid hoodie as canon; the 3 Aug ruling says 200th order. Payment-pending orders at the boundary make these differ. One word settles it.

## What build needs after the decisions

The opening moment confirmed (the calendar holds 22 Nov 2026 18:00 CET, with the mid-September decision point), the four locked prices carried into Shopify with local display, product copy from the copy document only, and the chosen mechanisms rehearsed on a draft product before the window.
