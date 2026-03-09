import React, { useState } from 'react';
import { ChevronRight, Trash2, Minus, Plus } from 'lucide-react';
import UserFooter from './UserFooter';
import UserNavbar from './UserNavbar'; 
import { useCart } from '../../context/CartContext'; 

const AddToCart = () => {
    const { cartItems, updateQuantity, deleteItem, subtotal } = useCart();
    const [shippingCost, setShippingCost] = useState(0);

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

    const total = subtotal + shippingCost;

    const handleContinueToPayment = () => {
        const requiredFields = ['firstName', 'email', 'phone', 'city', 'address'];
        const isFormValid = requiredFields.every(field => formData[field].trim() !== '');

        if (!isFormValid) {
            alert("Please fill all required fields (First Name, Email, Phone, City, and Address)!");
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const orderData = {
            customer: formData,
            items: cartItems,
            summary: { subtotal, shippingCost, total }
        };

        console.log("Proceeding to Payment with:", orderData);
        // Yahan aap payment gateway ya next step par navigate kar sakte hain
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
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Ahmad"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-white transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Last Name*</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Ali"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Email*</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="aliahmad@gmail.com"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-white transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Phone number*</label>
                                    <div className="flex">
                                        <select 
                                            name="countryCode" 
                                            value={formData.countryCode} 
                                            onChange={handleInputChange}
                                            className="px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 outline-none cursor-pointer"
                                        >
                                            <option value="PAK">PAK</option>
                                            <option value="USA">USA</option>
                                        </select>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+92 300 1234567"
                                            className="w-full px-4 py-3 rounded-r-xl border border-slate-200 outline-none focus:border-rose-500 bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">City*</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Lahore"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-white transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">State*</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="Punjab"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-white transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Zip Code*</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        placeholder="39020"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">Full Address*</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="House #, Street, Area..."
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-white transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-8">
                                <h3 className="text-xl font-bold mb-6 text-slate-900">Shipping Method</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setShippingCost(0)}
                                        className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all ${shippingCost === 0 ? 'border-rose-600 bg-rose-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingCost === 0 ? 'border-rose-600' : 'border-slate-300'}`}>
                                                {shippingCost === 0 && <div className="w-2.5 h-2.5 bg-rose-600 rounded-full" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">Free Shipping</p>
                                                <p className="text-xs text-slate-500">7-20 Days</p>
                                            </div>
                                        </div>
                                        <span className="font-black text-lg text-slate-900">$0</span>
                                    </div>

                                    <div
                                        onClick={() => setShippingCost(9)}
                                        className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all ${shippingCost === 9 ? 'border-rose-600 bg-rose-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingCost === 9 ? 'border-rose-600' : 'border-slate-300'}`}>
                                                {shippingCost === 9 && <div className="w-2.5 h-2.5 bg-rose-600 rounded-full" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">Express Shipping</p>
                                                <p className="text-xs text-slate-500">1-3 Days</p>
                                            </div>
                                        </div>
                                        <span className="font-black text-lg text-slate-900">$9</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="flex-1 w-full lg:sticky lg:top-10">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-6 text-slate-900">Your Cart ({cartItems.length})</h3>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-2 border-b border-slate-50 pb-6">
                                            <div className="w-20 h-20 bg-rose-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                                                <img 
                                                    src={item.image_url || item.image} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <div className="max-w-[120px]">
                                                        <p className="font-bold text-slate-800 text-sm truncate uppercase">{item.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{item.category || 'Product'}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => deleteItem(item.id)} 
                                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="flex items-center border border-slate-100 rounded-lg bg-slate-50">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, -1)} 
                                                            className="p-1.5 hover:bg-slate-200 transition-colors"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, 1)} 
                                                            className="p-1.5 hover:bg-slate-200 transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="font-bold text-rose-600 text-sm">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400">
                                        <p>Your Cart is empty!</p>
                                    </div>
                                )}
                            </div>

                        
                            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                                <div className="flex justify-between text-slate-500 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-sm">
                                    <span>Shipping</span>
                                    <span className="font-bold text-green-600">
                                        {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                    <span className="font-bold">Total Amount</span>
                                    <span className="font-black text-2xl text-rose-600">${total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleContinueToPayment}
                                    className="w-full bg-rose-950 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-rose-900 shadow-lg active:scale-95 transition-all"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr className='text-gray-200 mt-5 mb-8 mx-6 md:mx-12 lg:mx-24' />
            <UserFooter />
        </div>
    );
};

export default AddToCart;