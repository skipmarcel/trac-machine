// Vercel serverless function: POST /api/checkout → { url } of a Stripe Checkout page.
// Needs STRIPE_SECRET_KEY (and optionally SITE_URL) in the Vercel project's environment variables. Never in the repo.
//
// Body is either { plan: 'project' }  (a package from src/data/plans.js)
//            or { amount: 250, interval: 'once' | 'month', note: 'Invoice 104' }  (custom amount)
import Stripe from 'stripe';
import { plans, CUSTOM_MIN, CUSTOM_MAX, FEE_PCT, FEE_FIXED, withFee } from '../src/data/plans.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Payments are not set up yet.' });

  const site = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '');
  const page = `${site}/work-with-trac/`;
  const body = req.body || {};
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) : '';

  let lineItems, mode, feeNote;
  if (body.plan) {
    const plan = plans.find((p) => p.id === body.plan);
    if (!plan) return res.status(400).json({ error: 'Unknown package.' });
    // A product ID charges the product's default price. Read the mode off the price itself, so a recurring price
    // always becomes a subscription.
    const price = await (plan.stripeId.startsWith('prod_')
      ? stripe.products.retrieve(plan.stripeId, { expand: ['default_price'] }).then((p) => p.active && p.default_price)
      : stripe.prices.retrieve(plan.stripeId)
    ).catch(() => null);
    if (!price || !price.active) return res.status(500).json({ error: 'That package is not available right now.' });
    lineItems = [{ price: price.id, quantity: 1 }];
    mode = price.type === 'recurring' ? 'subscription' : 'payment';
  } else {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < CUSTOM_MIN || amount > CUSTOM_MAX)
      return res.status(400).json({ error: `Enter an amount between $${CUSTOM_MIN} and $${CUSTOM_MAX.toLocaleString('en-US')}.` });
    const monthly = body.interval === 'month';
    // The card fee goes on as its own line so the client sees it on Stripe's checkout page. Worked out here from the
    // entered amount, never taken from the browser.
    const { fee } = withFee(Math.round(amount * 100) / 100);
    const line = (name, dollars, description) => ({
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(dollars * 100),
        product_data: { name, ...(description && { description }) },
        ...(monthly && { recurring: { interval: 'month' } }),
      },
    });
    lineItems = [
      line(monthly ? 'Trac Machine monthly payment' : 'Trac Machine payment', amount, note),
      line('Card processing fee', fee, `Stripe's ${+(FEE_PCT * 100).toFixed(1)}% + ${Math.round(FEE_FIXED * 100)}¢ card fee`),
    ];
    mode = monthly ? 'subscription' : 'payment';
    feeNote = `The card processing fee covers Stripe's charge on this payment${monthly ? ' each month' : ''}, so the full amount reaches Trac Machine.`;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: `${page}?status=success`,
      cancel_url: `${page}?status=cancelled`,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      ...(feeNote && { custom_text: { submit: { message: feeNote } } }),
      metadata: { ...(body.plan && { plan: body.plan }), ...(note && { note }) },
      ...(mode === 'payment' && { customer_creation: 'always', invoice_creation: { enabled: true } }),
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
