import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.2.0'
import nodemailer from "npm:nodemailer";
import { jsPDF } from "npm:jspdf";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const { items, email, firstName } = await req.json();
    
    console.log("Sending immediate email...");
    await sendOrderEmail(email, firstName, items);
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { 
      apiVersion: '2023-10-16', 
      httpClient: Stripe.createFetchHttpClient() 
    });
    
    const shipping = 200; 

    const lineItems = items.map((it: any) => ({
      price_data: { 
        currency: 'usd', 
        product_data: { 
          name: it.name,
          description: `Custom Greeting Card Design`
        }, 
        unit_amount: Math.round(it.price * 100) 
      },
      quantity: it.quantity,
    }));
    
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping & Handling' },
        unit_amount: shipping,
      },
      quantity: 1,
    });
    
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success`,
      cancel_url: `${req.headers.get('origin')}/cart`,
    });

    return new Response(JSON.stringify({ url: session.url }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    });

  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400 
    });
  }
});

async function sendOrderEmail(email: string, firstName: string, items: any[]) {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const shipping = 2.00; 
  const total = subtotal + shipping;
  
  const emailAttachments = [];
  let itemsHtml = "";

  for (const item of items) {
    // --- PDF Generation Logic (Jo humne pehle fix kiya wahi rahega) ---
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const userSlides = [item.userDesign1, item.userDesign2, item.userDesign3, item.userDesign4];
      const defaultImg = item.image || item.image_url || item.main_image;

      for (let s = 0; s < 4; s++) {
        let currentImage = userSlides[s];
        if (!currentImage?.startsWith('data:image')) {
          if (s === 0) currentImage = defaultImg;
          else if (s === 3) currentImage = "https://ivopmtabogvgrptipiwo.supabase.co/storage/v1/object/public/assets/logo.png"; // Apna asli logo URL yahan dalein
          else currentImage = null;
        }
        if (currentImage) {
          try { doc.addImage(currentImage, 'JPEG', 10, 10, 190, 0, undefined, 'FAST'); } 
          catch (e) { doc.text("Design preview not available", 20, 20); }
        }
        if (s < 3) doc.addPage();
      }

      emailAttachments.push({ 
        filename: `${item.name.replace(/\s+/g, '_')}_Design.pdf`, 
        content: doc.output('datauristring').split(',')[1], 
        encoding: 'base64' 
      });
    } catch (e) { console.error("PDF Error:", e); }

    // --- Table Rows for Email ---
    itemsHtml += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333; text-align: right;">$${Number(item.price).toFixed(2)}</td>
      </tr>`;
  }

  // --- Transporter Config ---
  const transporter = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: { 
      user: Deno.env.get("EMAIL_USER"), 
      pass: Deno.env.get("EMAIL_PASS") 
    } 
  });

  // --- Final Email Send ---
  await transporter.sendMail({
    from: `"MoonPanda" <${Deno.env.get("EMAIL_USER")}>`,
    to: email,
    subject: `✅ Order Confirmed - Thank You for Choosing MoonPanda!`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #4b0016; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Order Confirmed!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333333;">Hi <strong>${firstName}</strong>,</p>
          <p style="font-size: 14px; color: #555555; line-height: 1.6;">
            Thank you for choosing <strong>MoonPanda</strong>! We've received your order and are currently processing it. 
            Your custom designs have been generated and attached to this email as a PDF.
          </p>

          <h3 style="color: #4b0016; border-bottom: 2px solid #f4f4f4; padding-bottom: 10px; margin-top: 30px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="text-align: left; padding: 12px; font-size: 13px; color: #777777;">Item</th>
                <th style="text-align: center; padding: 12px; font-size: 13px; color: #777777;">Qty</th>
                <th style="text-align: right; padding: 12px; font-size: 13px; color: #777777;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #fdf2f4; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #555555;">Subtotal:</span>
              <span style="font-weight: bold; margin-left: auto;">$${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #555555;">Shipping:</span>
              <span style="font-weight: bold; margin-left: auto;">$${shipping.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #e0e0e0; padding-top: 10px; font-size: 18px; color: #4b0016;">
              <strong>Total Amount:</strong>
              <strong style="margin-left: auto;">$${total.toFixed(2)}</strong>
            </div>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #999999; text-align: center;">
            If you have any questions, feel free to reply to this email or contact our support team.
          </p>
        </div>

        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777777;">
          © 2026 MoonPanda. All rights reserved.
        </div>
      </div>`,
    attachments: emailAttachments
  });
}