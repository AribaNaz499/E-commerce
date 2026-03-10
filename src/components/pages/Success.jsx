import React, { useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Success = () => {
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const hasCleared = useRef(false); 

    useEffect(() => {
        
        if (!hasCleared.current) {
            clearCart();
            hasCleared.current = true;
            console.log("Cart cleared successfully");
        }
    }, [clearCart]); 

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-white text-center p-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
            <p className="text-slate-600 mb-8 max-w-md">
                Your order is confirmed. The cart has been cleared.
            </p>
            <button 
                onClick={() => {
                    console.log("Navigating to home...");
                    navigate('/');
                }}
                className="bg-rose-950 text-white px-8 py-3 rounded-2xl font-bold hover:bg-rose-900 transition-all shadow-lg"
            >
                Back to Home
            </button>
        </div>
    );
};

export default Success;