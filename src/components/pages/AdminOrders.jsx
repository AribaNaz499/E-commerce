import React, { useState, useEffect } from 'react';
import { Eye, Loader2, Search, X } from 'lucide-react';
import { supabase } from "../../config/supabaseClient";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewModal, setIsViewModal] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error("Fetch Error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleView = (order) => {
        setSelectedOrder(order);
        setIsViewModal(true);
    };

    const filteredOrders = orders.filter((o) => {
        const search = searchTerm.toLowerCase();
        return (
            String(o.id).includes(search) ||
            (o.customer_name || "").toLowerCase().includes(search) ||
            (o.customer_email || "").toLowerCase().includes(search)
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">

            <div className="p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 bg-white mb-8">
                <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Orders</h2>
                    <p className="text-xs sm:text-sm text-gray-400">Total Orders: {orders.length}</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">
                        Search By Order ID, Name or Email
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search order id, name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>
                </div>
            </div>

            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-blue-50/40 transition-all">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-sm text-slate-700">
                                            {order.customer_name || "—"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {order.customer_email || "—"}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                        ${Number(order.price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                                            {order.status || "paid"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleView(order)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-mono text-gray-400">#{order.id}</p>
                                    <p className="font-bold text-slate-800">
                                        {order.customer_name || "—"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {order.customer_email || "—"}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                                    {order.status || "paid"}
                                </span>
                            </div>
                            <p className="font-semibold text-slate-700">
                                ${Number(order.price).toFixed(2)}
                            </p>
                            <div className="pt-3 border-t border-gray-50">
                                <button
                                    onClick={() => handleView(order)}
                                    className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-100"
                                >
                                    <Eye size={14} /> View Details
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-10 text-center rounded-xl border border-dashed border-gray-300 text-gray-500">
                        No orders found.
                    </div>
                )}
            </div>

            {isViewModal && selectedOrder && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8"
                    onClick={() => setIsViewModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Order #{selectedOrder.id}</h3>
                                <p className="text-[10px] text-gray-400 font-mono">
                                    {selectedOrder.customer_email || "—"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsViewModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-2">Customer Info</p>
                                <p className="font-semibold text-slate-800">{selectedOrder.customer_name || "—"}</p>
                                <p className="text-sm text-gray-500">{selectedOrder.customer_email || "—"}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total Price</p>
                                    <p className="text-2xl font-bold text-slate-800">${Number(selectedOrder.price).toFixed(2)}</p>
                                </div>
                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                                    {selectedOrder.status || "paid"}
                                </span>
                            </div>

                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Items Ordered</p>
                                    <div className="flex flex-col gap-2">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-700">{item.name || item.title || "Item"}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold text-slate-800">${Number(item.price).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Session ID</p>
                                <p className="font-mono text-xs text-gray-600 break-all">{selectedOrder.session_id || "—"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;