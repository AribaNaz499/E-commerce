import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.2.0'
import { Resend } from "npm:resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req: Request) => {
  // CORS preflight request handle karein
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('Stripe Secret Key missing');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { items, email, totalAmount } = await req.json();

    // 1. Stripe Checkout Session banayen
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd', 
          product_data: { name: item.name || 'Product' },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success`,
      cancel_url: `${req.headers.get('origin')}/cart`,
    });

    if (!session.url) {
        throw new Error("Stripe failed to generate checkout URL");
    }

    // 2. Email Bhejne ka logic
    try {
      const itemList = items.map((item: any) => 
        `<li>${item.name} (x${item.quantity}) - $${item.price}</li>`
      ).join('');

      await resend.emails.send({
        from: 'Canvas Store <onboarding@resend.dev>',
        to: [email],
        subject: 'Order Confirmation - Superior Store',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
            <h2 style="color: #9f1239;">Thank you for your order!</h2>
            <p>We have received your payment. Your order details are below:</p>
            <ul style="list-style: none; padding: 0;">
              ${itemList}
            </ul>
            <p style="font-size: 1.2em;"><strong>Total Amount Paid: $${totalAmount}</strong></p>
            <hr />
            <p>Regards,<br /><strong>Canvas Store Team</strong></p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email error (Order still processed):", emailErr);
    }

    // 3. Response bhein (Headers lazmi shamil hain)
    return new Response(
      JSON.stringify({ id: session.id, url: session.url }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    );
  }
})