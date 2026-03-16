import React, { useEffect, useRef, useState } from 'react'; 
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Success = () => {
    const { clearCart } = useCart(); 
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const hasCleared = useRef(false); 
    const hasSentEmail = useRef(false);
    const [status, setStatus] = useState('processing');

    useEffect(() => {
    
        if (!hasCleared.current) {
            clearCart();
            hasCleared.current = true;
        }

    
        const sessionId = searchParams.get('session_id');
        
        if (sessionId && !hasSentEmail.current) {
        
            const pendingOrder = localStorage.getItem('pendingOrder');
            
            if (pendingOrder) {
                const orderData = JSON.parse(pendingOrder);
                console.log("✅ Found pending order:", orderData);
                
                triggerEmail(sessionId, orderData.items, orderData.firstName);
                
            
                localStorage.removeItem('pendingOrder');
            } else {
                console.error("❌ No pending order found");
                setStatus('error');
            }
            
            hasSentEmail.current = true;
        }
    }, [searchParams]);

  const triggerEmail = async (sessionId, items, firstName) => {
    try {
        console.log("📧 Sending email with items:", items);
        
        // Aapki updated Anon Key
        const NEW_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3BtdGFib2d2Z3JwdGlwaXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Nzc1MDgsImV4cCI6MjA4NzE1MzUwOH0.s4DzQX6iG3-bkD_SqBuCOdGN4X7O1hO53J4hd-MfV9U';

        const response = await fetch('https://ivopmtabogvgrptipiwo.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'apikey': NEW_ANON_KEY,
                'Authorization': `Bearer ${NEW_ANON_KEY}` // Bearer aur key ke darmiyan space lazmi hai
            },
            body: JSON.stringify({ 
                sessionId,
                items: items,
                firstName: firstName
            })
        });

        // 401 check karne ke liye extra safety
        if (response.status === 401) {
            console.error("❌ Still getting 401. Check if Edge Function allows ANON_KEY or needs SERVICE_ROLE_KEY.");
            setStatus('error');
            return;
        }

        const data = await response.json();
        
        if (data.success) {
            console.log("✅ Email sent successfully!");
            setStatus('success');
        } else {
            console.error("❌ Email failed:", data.error);
            setStatus('error');
        }
    } catch (err) {
        console.error("❌ Fetch Error:", err);
        setStatus('error');
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
                {status === 'processing' && "Verifying your payment and generating your PDF..."}
                {status === 'success' && "Your order is confirmed. Your custom PDF designs have been sent to your email."}
                {status === 'error' && "Payment was successful, but we couldn't send the email. Please contact support."}
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