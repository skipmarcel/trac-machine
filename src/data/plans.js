// Packages on the Work With TRAC page. Also imported by api/checkout.js, which only accepts these Stripe IDs.
// stripeId: create the product + price in the Stripe dashboard (Product catalogue → Add product) and paste its
// product ID (prod_..., charges the product's default price) or a specific price ID (price_...).
// A recurring price makes the card start a subscription; a one-off price a single payment.
// Test (sandbox) and live mode have different IDs: swap these when going live.
// price / per / cta: display text only. Stripe charges whatever the price is set to, so keep them in step.
export const plans = [
  {
    id: 'project',
    name: 'Project deposit',
    price: '$515.24',
    per: 'one time',
    blurb: 'Locks in a start date for a logo, identity, print or web project. Credited to the final invoice.',
    cta: 'Pay deposit →',
    stripeId: 'prod_VXOfdZFMoR2S7W',
  },
  {
    id: 'retainer',
    name: 'Design retainer',
    price: '$51.80',
    per: 'per month',
    blurb: 'Ongoing design support each month: social graphics, updates, print pieces. Cancel any time.',
    cta: 'Start retainer →',
    stripeId: 'prod_VXOgLUAO4y5rUE',
  },
];

// Custom amount limits, in dollars.
export const CUSTOM_MIN = 1;
export const CUSTOM_MAX = 20000;

// Stripe's card fee (standard US rate). Custom amounts are grossed up so the entered amount is what reaches you:
// total = (amount + fixed) / (1 - pct), rounded to the cent. Used by the page (to show it) and api/checkout.js (to charge it).
export const FEE_PCT = 0.029;
export const FEE_FIXED = 0.30;
export const withFee = (amount) => {
  const total = Math.round((amount + FEE_FIXED) / (1 - FEE_PCT) * 100) / 100;
  return { amount, fee: Math.round((total - amount) * 100) / 100, total };
};
