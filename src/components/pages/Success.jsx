import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../config/supabaseClient';

const Success = () => {
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const hasProcessed = useRef(false);
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const run = async () => {
            const sessionId = searchParams.get('session_id');
            const pendingOrder = localStorage.getItem('pendingOrder');

            if (hasProcessed.current || !sessionId || !pendingOrder) return;
            
            
            hasProcessed.current = true;

            try {
                const orderData = JSON.parse(pendingOrder);
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const totalAmount = orderData.items.reduce((acc, item) =>
                        acc + (Number(item.price) * (item.quantity || 1)), 0
                    );

                    const { error } = await supabase.from('orders').insert({
                        user_id: user.id,
                        price: totalAmount,
                        status: 'paid',
                        session_id: sessionId,
                        customer_name: orderData.firstName,
                        customer_email: orderData.email,
                        items: orderData.items
                    });

                    if (error) console.error("❌ DB Record Error:", error.message);
                    else console.log("✅ Order recorded successfully!");
                }

                await clearCart();

                await triggerEmail(sessionId, orderData.items, orderData.firstName, orderData.email);
                
                localStorage.removeItem('pendingOrder');
                setStatus('success');

            } catch (err) {
                console.error("❌ Process failed:", err);
                setStatus('error');
            }
        };

        run();
    }, []); 

    const triggerEmail = async (sessionId, items, firstName, email) => {
        try {
            const NEW_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3BtdGFib2d2Z3JwdGlwaXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Nzc1MDgsImV4cCI6MjA4NzE1MzUwOH0.s4DzQX6iG3-bkD_SqBuCOdGN4X7O1hO53J4hd-MfV9U';

            const response = await fetch('https://ivopmtabogvgrptipiwo.supabase.co/functions/v1/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': NEW_ANON_KEY,
                    'Authorization': `Bearer ${NEW_ANON_KEY}`
                },
                body: JSON.stringify({ sessionId, items, firstName, email })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            console.log("✅ Email sent successfully!");
        } catch (err) {
            console.error("❌ Email Error:", err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6">
            <div className={`w-20 h-20 ${status === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center mb-6`}>
                {status === 'processing' ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={status === 'error' ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"}></path>
                    </svg>
                )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {status === 'error' ? 'Something went wrong' : 'Payment Successful!'}
            </h1>

            <p className="text-slate-600 mb-8 max-w-md">
                {status === 'processing' && "Verifying your payment and processing your order..."}
                {status === 'success' && "Your order is confirmed. Your custom designs have been sent to your email."}
                {status === 'error' && "We had trouble finalizing everything. Please contact support."}
            </p>

            <button
                onClick={() => navigate('/')}
                className="bg-rose-950 text-white px-8 py-3 rounded-2xl font-bold hover:bg-rose-900 transition-all shadow-lg"
            >
                Back to Home
            </button>
        </div>
    );
};

export default Success;