import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.2.0'
import nodemailer from "npm:nodemailer";
import { jsPDF } from "npm:jspdf";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { sessionId, items: orderItems, firstName } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const email = session.customer_email;

    const finalProcessedItems = [];
    for (const item of (orderItems || [])) {
      let productImage = null;
      if (item.id) {
        const { data: product } = await supabase.from('products').select('image_url').eq('id', item.id).single();
        productImage = product?.image_url;
      }

      const isEdited = String(item.isEdited) === 'true';

      finalProcessedItems.push({
        name: item.name || 'Greeting Card',
        price: item.price || 0,
        quantity: item.quantity || 1, 
        isEdited: isEdited,
        slide1: item.userDesign1 || item.image || productImage || '',
        slide2: isEdited ? (item.userDesign2 || '') : '',
        slide3: isEdited ? (item.userDesign3 || '') : '',
        slide4: item.userDesign4 || ''
      });
    }

    await sendOrderEmail(email!, firstName || "Customer", finalProcessedItems);

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400 
    });
  }
});

async function sendOrderEmail(email: string, firstName: string, items: any[]) {
  const emailAttachments = [];

  for (const [index, item] of items.entries()) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    const addSafeImage = (base64Data: string) => {
      if (!base64Data || base64Data.length < 100) return;
      try {
        let cleanData = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
        doc.addImage(cleanData, 'PNG', margin, margin, contentWidth, contentHeight * 0.9, undefined, 'NONE');
      } catch (e) { console.error("PDF Image Error", e); }
    };

    addSafeImage(item.slide1);
    doc.addPage();
    if (item.isEdited && item.slide2) addSafeImage(item.slide2);
    doc.addPage();
    if (item.isEdited && item.slide3) addSafeImage(item.slide3);
    doc.addPage();
    if (item.slide4) {
        try {
            let cleanData = item.slide4.includes('base64,') ? item.slide4.split('base64,')[1] : item.slide4;
            doc.addImage(cleanData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
        } catch (e) {}
    }

    const pdfOutput = doc.output('datauristring');
    emailAttachments.push({
      filename: `${item.name.replace(/\s+/g, '_')}_${index + 1}.pdf`,
      content: pdfOutput.split(',')[1],
      encoding: 'base64'
    });
  }

  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const shipping = 2.00;
  const total = subtotal + shipping;

  const tableRows = items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #2d3748;"><strong>${item.name}</strong></td>
      <td style="padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #718096; text-align: center;">${item.quantity}</td>
      <td style="padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #718096; text-align: center;">$${Number(item.price).toFixed(2)}</td>
      <td style="padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #e11d48; text-align: right; font-weight: bold;">$${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
    </tr>
  `).join('');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: Deno.env.get("EMAIL_USER"), pass: Deno.env.get("EMAIL_PASS") }
  });

  await transporter.sendMail({
    from: `"MoonPanda" <${Deno.env.get("EMAIL_USER")}>`,
    to: email,
    subject: `Order Confirmed — Thank You, ${firstName}! 🎉`,
    html: `
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #eee;">
        <div style="background: #881337; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; letter-spacing: 2px;">MOONPANDA</h1>
        </div>
        <div style="padding: 30px; font-family: sans-serif;">
          <h2 style="color: #1a202c;">Thank You For Your Order!</h2>
          <p style="color: #4a5568;">Hi ${firstName}, we've received your order. Your print-ready PDFs are attached.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th>Qty</th><th>Price</th><th style="text-align: right;">Total</th>
            </tr>
            ${tableRows}
            <tr><td colspan="3" style="text-align: right; padding: 10px; color: #718096;">Subtotal</td><td style="text-align: right; padding: 10px;">$${subtotal.toFixed(2)}</td></tr>
            <tr><td colspan="3" style="text-align: right; padding: 5px; color: #718096;">Shipping</td><td style="text-align: right; padding: 5px;">$${shipping.toFixed(2)}</td></tr>
            <tr><td colspan="3" style="text-align: right; padding: 15px; font-size: 18px; font-weight: bold;">Grand Total</td><td style="text-align: right; padding: 15px; font-size: 18px; font-weight: bold; color: #881337;">$${total.toFixed(2)}</td></tr>
          </table>
          <div style="background: #fff1f2; padding: 15px; border-radius: 6px; color: #9f1239; font-size: 14px;">
            <strong>Note:</strong> Custom card designs have been generated and attached as PDFs.
          </div>
        </div>
        <div style="background: #1a202c; color: #718096; padding: 15px; text-align: center; font-size: 12px;">
          &copy; 2026 MoonPanda Team
        </div>
      </div>
    `,
    attachments: emailAttachments
  });
}