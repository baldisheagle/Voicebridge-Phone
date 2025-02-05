export const STRIPE_CHECKOUT_SUCCESS_REDIRECT_URL = 'http://app.voicebridgeai.com/billing';
export const STRIPE_PORTAL_SUCCESS_REDIRECT_URL = 'http://app.voicebridgeai.com/billing';

export const BILLING_PLAN_STARTER_STRIPE_PRICE_ID = 'price_1PU13dP4uRnOeFMDjsMI9v02'; // Test: 'price_1PU13dP4uRnOeFMDjsMI9v02';
export const BILLING_PLAN_GROWTH_STRIPE_PRICE_ID = 'price_1PTr8yP4uRnOeFMDlbNQSDoY'; // Test: 'price_1PTr8yP4uRnOeFMDlbNQSDoY';
export const BILLING_PLAN_PRO_STRIPE_PRICE_ID = 'price_1PTr8yP4uRnOeFMDlbNQSDoY'; // Test: 'price_1PTr8yP4uRnOeFMDlbNQSDoY';

export const BILLING_PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small clinics or ones just getting started',
        price: 29,
        minutes: 10,
        benefits: []
    },
    {
        id: 'growth',
        name: 'Growth',
        description: 'For clinics with increasing call volumes',
        price: 99,
        minutes: 60,
        benefits: []
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'For clinics with very high call volumes and need to scale',
        price: 299,
        minutes: 180,
        benefits: []
    }
]