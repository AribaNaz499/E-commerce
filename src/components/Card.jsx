import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

const Cards = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,  
        loading: true
    });

    const REVENUE_TARGET = 50000;  
    const ORDERS_TARGET = 100;     

    const fetchDashboardData = useCallback(async () => {
        try {
            const [ordersRes, revenueRes] = await Promise.all([
                supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'paid'),  
                
                supabase
                    .from('orders')
                    .select('price')
                    .eq('status', 'paid')
            ]);

            const totalRevenue = revenueRes.data?.reduce((acc, curr) => {
                return acc + (Number(curr.price) || 0);
            }, 0) || 0;

            setStats({
                totalRevenue: totalRevenue,
                totalOrders: ordersRes.count ?? 0,  
                loading: false
            });

        } catch (error) {
            setStats({
                totalRevenue: 0,
                totalOrders: 0,
                loading: false
            });
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();

        const channel = supabase
            .channel('dashboard-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                () => fetchDashboardData()
            )
            .subscribe();

        const interval = setInterval(() => fetchDashboardData(), 60000);

        return () => {
            channel.unsubscribe();
            clearInterval(interval);
        };
    }, [fetchDashboardData]);

    const calculateProgress = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    if (stats.loading) {
        return (
            <div className="w-full h-40 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-gray-500 text-sm">Loading Stats...</p>
            </div>
        );
    }

    const cardData = [
        {
            id: 2, // Revenue Card
            title: "Revenue (USD)",
            count: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subText: "Total sales in Dollars",
            color: "text-orange-700",
            bg: "bg-orange-50",
            icon: <TrendingUp size={20} className="text-orange-700" />,
            progress: calculateProgress(stats.totalRevenue, REVENUE_TARGET)
        },
        {
            id: 3, // Orders Card
            title: "Total Orders",         
            count: stats.totalOrders,         
            subText: "Completed orders",      
            color: "text-purple-700",        
            bg: "bg-purple-50",               
            icon: <ShoppingBag size={20} className="text-purple-700" />,
            progress: calculateProgress(stats.totalOrders, ORDERS_TARGET)
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-4 flex justify-end">
                <button 
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw size={16} /> Refresh Data
                </button>
            </div>

            {/* Grid settings kept same (md:grid-cols-3) to maintain card size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cardData.map((card) => (
                    <div key={card.id} className={`${card.bg} p-6 rounded-2xl shadow-sm border border-white/50`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.title}</p>
                                <h2 className={`text-3xl font-black ${card.color} mt-1`}>{card.count}</h2>
                                <p className="text-xs text-gray-400 mt-1">{card.subText}</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                {card.icon}
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Target Progress</span>
                                <span className={`text-xs font-bold ${card.color}`}>{card.progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${card.color.replace('text', 'bg')}`}
                                    style={{ width: `${card.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Cards;