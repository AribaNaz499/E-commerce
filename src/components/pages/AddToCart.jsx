import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Trash2, Minus, Plus, Tag, Check, X } from 'lucide-react';
import UserFooter from './UserFooter';
import UserNavbar from './UserNavbar';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

const AddToCart = () => {
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const shippingCost = 2.00;

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        countryCode: 'PAK', city: '', state: '', zipCode: '', address: '', description: '',
    });

    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculatedSubtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            let price = 0;
            if (item.price !== undefined && item.price !== null) {
                price = parseFloat(item.price);
            } else if (item.product_price) {
                price = parseFloat(item.product_price);
            } else if (item.amount) {
                price = parseFloat(item.amount);
            } else {
                price = 0;
            }
            if (isNaN(price) || price === 0) {
                if (item.product_details?.price) {
                    price = parseFloat(item.product_details.price);
                }
            }
            if (isNaN(price) || price === 0) price = 600;
            const qty = parseInt(item.quantity) || 1;
            return acc + (price * qty);
        }, 0);
    }, [cartItems]);

    const discountAmount = appliedPromo
        ? (calculatedSubtotal * appliedPromo.discount_percent) / 100
        : 0;

    const finalShipping = cartItems.length > 0 ? shippingCost : 0;
    const total = calculatedSubtotal - discountAmount + finalShipping;

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoError('');
        setPromoLoading(true);

        try {
            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', promoCode.trim().toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                setPromoError('Invalid or inactive promo code');
                setAppliedPromo(null);
                return;
            }

            if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
                setPromoError('This promo code has expired');
                setAppliedPromo(null);
                return;
            }

            if (data.usage_limit !== null && data.used_count >= data.usage_limit) {
                setPromoError('This promo code has reached its usage limit');
                setAppliedPromo(null);
                return;
            }

            setAppliedPromo({
                id: data.id,
                code: data.code,
                used_count: data.used_count || 0, 
                discount_percent: data.discount_percent,
            });
            setPromoError('');
        } catch (err) {
            setPromoError('Something went wrong. Try again.');
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
    };

    const getImageSource = (item) => {
        if (item.userDesign1 && item.userDesign1.trim() !== '') return item.userDesign1;
        if (item.image && item.image.trim() !== '') return item.image;
        if (item.image_url && item.image_url.trim() !== '') return item.image_url;
        if (item.main_image && item.main_image.trim() !== '') return item.main_image;
        if (item.product_details?.image_url) return item.product_details.image_url;
        if (!item.isEdited && item.designData?.[1]?.elements?.[0]?.src) return item.designData[1].elements[0].src;
        return 'https://via.placeholder.com/150?text=No+Image';
    };

    const handlePayment = async () => {
        if (!formData.firstName || !formData.email || !formData.address) {
            alert("Please fill in shipping details");
            return;
        }

        setLoading(true);
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b3BtdGFib2d2Z3JwdGlwaXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Nzc1MDgsImV4cCI6MjA4NzE1MzUwOH0.s4DzQX6iG3-bkD_SqBuCOdGN4X7O1hO53J4hd-MfV9U";

        try {
            const itemsForPayment = cartItems.map(it => {
                let price = parseFloat(it.price);
                if (isNaN(price) || price === 0) {
                    if (it.product_details?.price) price = parseFloat(it.product_details.price);
                }
                if (isNaN(price) || price === 0) price = 60;

                const discountedPrice = appliedPromo
                    ? price - (price * appliedPromo.discount_percent / 100)
                    : price;

                return {
                    id: it.id,
                    name: it.name,
                    price: parseFloat(discountedPrice.toFixed(2)),
                    quantity: parseInt(it.quantity) || 1,
                    isEdited: it.isEdited || false,
                    userDesign1: it.userDesign1 || it.image || it.image_url || '',
                    userDesign2: it.userDesign2 || '',
                    userDesign3: it.userDesign3 || '',
                    userDesign4: it.userDesign4 || ''
                };
            });

            const response = await fetch('https://ivopmtabogvgrptipiwo.supabase.co/functions/v1/stripe-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    items: itemsForPayment,
                    email: formData.email,
                    firstName: formData.firstName
                })
            });

            const data = await response.json();

            if (data.url) {
                if (appliedPromo?.id) {
                    await supabase
                        .from('promo_codes')
                        .update({ used_count: (appliedPromo.used_count || 0) + 1 })
                        .eq('id', appliedPromo.id);
                }

                const orderData = {
                    items: cartItems,
                    firstName: formData.firstName,
                    email: formData.email,
                    address: formData.address
                };
                localStorage.setItem('pendingOrder', JSON.stringify(orderData));
                window.location.href = data.url;
            } else {
                alert("Error: " + (data.error || "Payment initialization failed."));
            }
        } catch (err) {
            console.error("Payment failed:", err);
            alert("Server error, please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getItemPrice = (item) => {
        let price = parseFloat(item.price);
        if (isNaN(price) || price === 0) {
            if (item.product_details?.price) price = parseFloat(item.product_details.price);
        }
        if (isNaN(price) || price === 0) price = 600;
        return price;
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <UserNavbar />
            <div className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-10">
                <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-10">
                    <span className="cursor-pointer hover:text-rose-600" onClick={() => navigate('/')}>Home</span>
                    <ChevronRight size={14} />
                    <span className="font-bold text-rose-950 border-b-2 border-rose-600">Shipping</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left - Form */}
                    <div className="flex-[2] w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold mb-8 text-slate-900">Shipping Address</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" name="firstName" placeholder="First Name*" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500" />
                                <input type="text" name="lastName" placeholder="Last Name*" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="email" name="email" placeholder="Email*" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500" />
                                <div className="flex">
                                    <select name="countryCode" className="px-3 py-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 outline-none">
                                        <option value="PAK">PAK (+92)</option>
                                    </select>
                                    <input type="tel" name="phone" placeholder="300 1234567" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-r-xl border border-slate-200 outline-none focus:border-rose-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                <input type="text" name="city" placeholder="City*" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500" />
                                <input type="text" name="state" placeholder="State*" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500" />
                                <input type="number" name="zipCode" placeholder="Zip Code*" value={formData.zipCode} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500" />
                            </div>
                            <textarea name="address" placeholder="Full Address*" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 resize-none"></textarea>
                            <textarea name="description" placeholder="Description*" value={formData.description} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 resize-none"></textarea>
                        </div>
                    </div>

                    <div className="flex-1 w-full lg:sticky lg:top-10">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-6 text-slate-900">Your Cart ({cartItems.length})</h3>

                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                                {cartItems.map((item) => {
                                    const itemPrice = getItemPrice(item);
                                    return (
                                        <div key={item.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 relative">
                                                    <img
                                                        src={getImageSource(item)}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                                    />
                                                    {item.isEdited && (
                                                        <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl">Edited</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between">
                                                        <p className="font-bold text-slate-800 text-sm truncate uppercase">{item.name}</p>
                                                        <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="font-bold text-rose-600 text-sm">$ {itemPrice.toFixed(2)}</p>
                                                        <div className="flex items-center border rounded-lg bg-white">
                                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 px-2 hover:bg-slate-100"><Minus size={12} /></button>
                                                            <span className="text-xs font-bold px-3">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 px-2 hover:bg-slate-100"><Plus size={12} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mb-4">
                                {!appliedPromo ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Promo code"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-rose-400 text-sm font-mono font-bold"
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={promoLoading || !promoCode.trim()}
                                                className="px-4 py-2.5 bg-rose-950 text-white rounded-xl text-sm font-bold hover:bg-rose-900 disabled:opacity-50 transition-all"
                                            >
                                                {promoLoading ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                        {promoError && (
                                            <p className="text-red-500 text-xs font-medium">{promoError}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Check size={16} className="text-green-600" />
                                            <span className="text-sm font-bold text-green-700 font-mono">{appliedPromo.code}</span>
                                            <span className="text-xs text-green-600">— {appliedPromo.discount_percent}% off</span>
                                        </div>
                                        <button onClick={handleRemovePromo} className="text-gray-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-bold">$ {calculatedSubtotal.toFixed(2)}</span>
                                </div>
                                {appliedPromo && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount ({appliedPromo.discount_percent}%)</span>
                                        <span className="font-bold">- $ {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Shipping</span>
                                    <span className="font-bold">$ {finalShipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t mt-2">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-black text-2xl text-rose-600">$ {total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handlePayment}
                                    disabled={loading || cartItems.length === 0}
                                    className={`w-full bg-rose-950 text-white py-4 rounded-2xl font-bold mt-4 shadow-lg transition-all ${loading ? 'opacity-50' : 'hover:bg-rose-900'}`}
                                >
                                    {loading ? "Processing..." : "Continue to Payment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr className='text-gray-200 mb-8 mt-4 mx-6 md:mx-12 lg:mx-24' />
            <UserFooter />
        </div>
    );
};

export default AddToCart;