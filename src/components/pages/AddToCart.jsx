import React, { useState } from 'react';
import { ChevronRight, Trash2, Minus, Plus } from 'lucide-react';
import UserFooter from './UserFooter';
import UserNavbar from './UserNavbar';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';

const AddToCart = () => {
    const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
    const shippingCost = 200;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: 'PAK',
        city: '',
        state: '',
        zipCode: '',
        address: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const finalShipping = cartItems.length > 0 ? shippingCost : 0;
    const total = cartItems.length > 0 ? (Number(subtotal) + shippingCost) : 0;

const handleContinueToPayment = async () => {
    
    if (cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    if (!formData.email) {
        alert("Please enter your email address first.");
        return;
    }

    try {
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3BtdGFib2d2Z3JwdGlwaXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Nzc1MDgsImV4cCI6MjA4NzE1MzUwOH0.s4DzQX6iG3-bkD_SqBuCOdGN4X7O1hO53J4hd-MfV9U"; 

        const response = await fetch('https://ivopmtabogvgrptipiwo.supabase.co/functions/v1/stripe-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                items: cartItems.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                email: formData.email,
            }),
        });

        const data = await response.json();

        console.log("Stripe Response:", data);

        if (data.url) {
            window.location.href = data.url; 
        } else if (data.error) {
            console.error("Backend Error:", data.error);
            alert("Payment Error: " + data.error);
        } else {
            alert("Error: Stripe URL not found. Check if your Stripe Secret Key is set in Supabase.");
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Connection Error: Could not reach the payment server.");
    }
};
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <UserNavbar />
            <div className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-10">
                <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-10">
                    <span className="cursor-pointer hover:text-rose-600">Cart</span>
                    <ChevronRight size={14} />
                    <span className="font-bold text-rose-950 border-b-2 border-rose-600">Shipping</span>
                    <ChevronRight size={14} />
                    <span className="opacity-50">Payment</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    <div className="flex-[2] w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold mb-8 text-slate-900">Shipping Address</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">First Name*</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ahmad" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Last Name*</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Ali" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Email*</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="aliahmad@gmail.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Phone number*</label>
                                    <div className="flex">
                                        <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} className="px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 outline-none"><option value="PAK">PAK</option><option value="USA">USA</option></select>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+92 300 1234567" className="w-full px-4 py-3 rounded-r-xl border border-slate-200 outline-none focus:border-rose-500 transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">City*</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">State*</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Zip Code*</label>
                                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 transition-all" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">Full Address*</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 transition-all resize-none"></textarea>
                            </div>

                            <div className="pt-8">
                                <h3 className="text-xl font-bold mb-6 text-slate-900">Shipping Method</h3>
                                <div className="flex items-center justify-between p-5 border-2 border-rose-600 bg-rose-50/30 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 rounded-full border-2 border-rose-600 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-rose-600 rounded-full" /></div>
                                        <div><p className="font-bold text-slate-800">Standard Delivery</p><p className="text-xs text-slate-500">Fixed Charges</p></div>
                                    </div>
                                    <span className="font-black text-lg text-slate-900">${finalShipping}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full lg:sticky lg:top-10">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-6 text-slate-900">Your Cart ({cartItems.length})</h3>
                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-2 border-b border-slate-50 pb-6">
                                        <div className="w-20 h-20 bg-rose-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                                            <img src={item.image || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-slate-800 text-sm truncate uppercase">{item.name}</p>
                                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                            </div>
                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex items-center border rounded-lg bg-slate-50">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5"><Minus size={12} /></button>
                                                    <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5"><Plus size={12} /></button>
                                                </div>
                                                <p className="font-bold text-rose-600 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                                <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">${Number(subtotal).toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span>Shipping</span><span className="font-bold text-green-600">${finalShipping.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                    <span className="font-bold">Total</span><span className="font-black text-2xl text-rose-600">${total.toFixed(2)}</span>
                                </div>
                                <button onClick={handleContinueToPayment} className="w-full bg-rose-950 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-rose-900 shadow-lg transition-all">
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <UserFooter />
        </div>
    );
};

export default AddToCart;