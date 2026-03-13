import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getLockBySessionId, updateLock, getLockByToken } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const token = session.metadata?.token;
    const lock = token 
      ? await getLockByToken(token) 
      : await getLockBySessionId(session.id);

    if (lock && session.payment_status === 'paid' && lock.status !== 'paid') {
      await updateLock(lock.id, {
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe: {
          ...(lock.stripe || {}),
          session_id: session.id,
          payment_intent: session.payment_intent,
          customer_email: session.customer_details?.email
        }
      });
    }
  }

  return NextResponse.json({ received: true });
}
