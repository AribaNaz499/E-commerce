import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.2.0'
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Frontend se data receive karna
    const { items, email, totalAmount, firstName } = await req.json();

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripe = new Stripe(stripeKey!, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 1. Stripe Session Create Karein
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email, // Stripe dashboard mein bhi user ka email show hoga
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd', 
          product_data: { name: item.name },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success`,
      cancel_url: `${req.headers.get('origin')}/cart`,
    });

    // 2. Nodemailer Setup (Gmail Example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get("EMAIL_USER"), // Aapka business email
        pass: Deno.env.get("EMAIL_PASS"), // Aapka Google App Password
      },
    });

    const itemListHtml = items.map((item: any) => 
      `<li>${item.name} (x${item.quantity}) - Rs. ${item.price}</li>`
    ).join('');

    // Email configuration jo USER ko jayegi
    const mailOptions = {
      from: `"Canvas Store" <${Deno.env.get("EMAIL_USER")}>`,
      to: email, // <--- YEAH WOH EMAIL HAI JO USER NE INPUT KIYA
      subject: `Order Confirmed! - #${Math.floor(Math.random() * 10000)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 20px;">
          <h1 style="color: #9f1239; text-align: center;">Canvas Store</h1>
          <p>Hi ${firstName || 'Valued Customer'},</p>
          <p>Thank you for your order! We've received your payment and our team is preparing your package.</p>
          <div style="background: #fafafa; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Order Summary:</h3>
            <ul style="list-style: none; padding: 0;">
              ${itemListHtml}
            </ul>
            <hr style="border: 0; border-top: 1px solid #ddd;">
            <p style="font-size: 18px;"><strong>Total: Rs. ${totalAmount}</strong></p>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            If you have any questions, reply to this email.
          </p>
        </div>
      `,
    };

    // Email send karna (Async)
    transporter.sendMail(mailOptions).catch(e => console.error("Email Error:", e));

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})