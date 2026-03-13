import { NextRequest, NextResponse } from 'next/server';
import { getLockByToken, updateLock } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const lock = await getLockByToken(token);

  if (!lock) {
    return NextResponse.json({ message: 'Candado no encontrado' }, { status: 404 });
  }

  if (lock.status === 'paid') {
    return NextResponse.redirect(`${process.env.BASE_URL}/lock/${lock.token}`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price: process.env.STRIPE_PRICE_ID ? process.env.STRIPE_PRICE_ID : undefined,
          price_data: !process.env.STRIPE_PRICE_ID ? {
            currency: lock.currency,
            unit_amount: lock.amount_cents,
            product_data: {
              name: lock.title,
              description: lock.description || 'Entrega final'
            }
          } : undefined
        }
      ],
      success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/lock/${lock.token}`,
      customer_email: lock.client_email || undefined,
      metadata: {
        lock_id: lock.id,
        token: lock.token
      }
    });

    await updateLock(lock.id, {
      stripe: {
        ...(lock.stripe || {}),
        session_id: session.id
      }
    });

    return NextResponse.redirect(session.url as string, 303);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ message: 'No se pudo iniciar el pago' }, { status: 500 });
  }
}
