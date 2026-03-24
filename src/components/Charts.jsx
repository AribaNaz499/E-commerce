import React, { useState, useEffect } from 'react';
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';
import { supabase } from '../config/supabaseClient';

const getDateRanges = (mode) => {
  const now = new Date();

  if (mode === 'Day') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 1);
    const prevEnd = new Date(start);
    return { currentStart: start, currentEnd: now, prevStart, prevEnd };
  }

  if (mode === 'Week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 7);
    const prevEnd = new Date(start);
    return { currentStart: start, currentEnd: now, prevStart, prevEnd };
  }

  if (mode === 'Month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return { currentStart: start, currentEnd: now, prevStart, prevEnd };
  }
};

const formatChartData = (currentOrders, prevOrders, mode) => {
  if (mode === 'Day') {
    const nowHour = new Date().getHours();
    return Array.from({ length: nowHour + 1 }, (_, i) => {
      const label = i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`;
      const current = currentOrders
        .filter(o => new Date(o.created_at).getHours() === i)
        .reduce((sum, o) => sum + (o.price || 0), 0);
      const previous = prevOrders
        .filter(o => new Date(o.created_at).getHours() === i)
        .reduce((sum, o) => sum + (o.price || 0), 0);
      return { name: label, current, previous };
    }).slice(-8);
  }

  if (mode === 'Week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      const dayName = `${days[date.getDay()]} ${date.getDate()}`;
      const current = currentOrders
        .filter(o => new Date(o.created_at).toDateString() === date.toDateString())
        .reduce((sum, o) => sum + (o.price || 0), 0);
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 7);
      const previous = prevOrders
        .filter(o => new Date(o.created_at).toDateString() === prevDate.toDateString())
        .reduce((sum, o) => sum + (o.price || 0), 0);
      return { name: dayName, current, previous };
    });
  }

  if (mode === 'Month') {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const current = currentOrders
        .filter(o => new Date(o.created_at).getDate() === day)
        .reduce((sum, o) => sum + (o.price || 0), 0);
      const previous = prevOrders
        .filter(o => new Date(o.created_at).getDate() === day)
        .reduce((sum, o) => sum + (o.price || 0), 0);
      return { name: `${day}`, current, previous };
    });
  }
};

const Analytics = () => {
  const [mode, setMode] = useState('Week');
  const [data, setData] = useState([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [prevTotal, setPrevTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [productLimit, setProductLimit] = useState(5); // State for 5 or 10 products

  const fetchTopProducts = async () => {
    setTopProductsLoading(true);
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('items, price')
        .eq('status', 'paid');

      if (!orders) return;

      const productMap = new Map();

      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productName = item.name || item.product_name || item.title;
            const productPrice = item.price || 0;
            const quantity = item.quantity || 1;
            
            if (productName) {
              if (productMap.has(productName)) {
                const existing = productMap.get(productName);
                existing.quantity += quantity;
                existing.revenue += productPrice * quantity;
              } else {
                productMap.set(productName, {
                  name: productName,
                  quantity: quantity,
                  revenue: productPrice * quantity
                });
              }
            }
          });
        }
      });

      const sortedProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); 

      setTopProducts(sortedProducts);
    } catch (err) {
      console.error('Error fetching top products:', err);
    } finally {
      setTopProductsLoading(false);
    }
  };

  const fetchData = async (selectedMode) => {
    setLoading(true);
    try {
      const { currentStart, currentEnd, prevStart, prevEnd } = getDateRanges(selectedMode);

      const { data: currentOrders } = await supabase
        .from('orders')
        .select('created_at, price')
        .eq('status', 'paid')
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', currentEnd.toISOString());

      const { data: prevOrders } = await supabase
        .from('orders')
        .select('created_at, price')
        .eq('status', 'paid')
        .gte('created_at', prevStart.toISOString())
        .lte('created_at', prevEnd.toISOString());

      const curr = currentOrders || [];
      const prev = prevOrders || [];

      const currTotal = curr.reduce((sum, o) => sum + (o.price || 0), 0);
      const prvTotal = prev.reduce((sum, o) => sum + (o.price || 0), 0);

      setCurrentTotal(currTotal);
      setPrevTotal(prvTotal);
      setData(formatChartData(curr, prev, selectedMode));
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(mode);
    fetchTopProducts();
  }, [mode]);

  const percentChange = prevTotal === 0
    ? 100
    : Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
  const isUp = percentChange >= 0;

  const maxVal = Math.max(...data.map(d => Math.max(d.current || 0, d.previous || 0)), 100);
  const yMax = Math.ceil(maxVal / 100) * 100;

  const displayedProducts = topProducts.slice(0, productLimit);

  return (
    <div className="w-full space-y-6">
      <div className="w-full bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <div className="flex gap-4 md:gap-6">
              <div>
                <p className="text-[10px] text-gray-400 font-medium mb-0.5">Current {mode}</p>
                <div className="flex items-center gap-2">
                  {loading ? (
                    <span className="text-lg font-black text-blue-600">...</span>
                  ) : (
                    <>
                      <span className="text-lg md:text-xl font-black text-blue-600">
                        ${currentTotal.toFixed(2)}
                      </span>
                      <span className={`flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isUp ? 'text-green-500 bg-green-50' : 'text-red-400 bg-red-50'
                      }`}>
                        {isUp ? '↑' : '↓'} {Math.abs(percentChange)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="border-l border-gray-100 pl-4 md:pl-6">
                <p className="text-[10px] text-gray-400 font-medium mb-0.5">Previous {mode}</p>
                <div className="flex items-center gap-2">
                  {loading ? (
                    <span className="text-lg font-bold text-gray-300">...</span>
                  ) : (
                    <span className="text-lg md:text-xl font-bold text-gray-300">
                      ${prevTotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 text-[10px] font-bold text-gray-400">
            {['Day', 'Week', 'Month'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2 py-1 transition-colors ${
                  mode === m
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'hover:text-gray-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[200px] sm:h-[240px] lg:h-[280px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-300 text-sm">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 500 }}
                  dy={10}
                  interval={mode === 'Month' ? 4 : 0}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  domain={[0, yMax]}
                  ticks={[0, Math.round(yMax / 2), yMax]}
                  tickFormatter={(value) => `$${value}`}
                />

                <Tooltip
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(value, name) => [
                    `$${value.toFixed(2)}`,
                    name === 'current' ? `Current ${mode}` : `Previous ${mode}`
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#fb923c"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                />

                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fill="url(#colorCurrent)"
                  activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="w-full bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-900">Top Selling Products</h3>
            <p className="text-xs text-gray-400 mt-1">Most popular cards and gifts by revenue</p>
          </div>
          
          <div className="flex gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setProductLimit(5)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                productLimit === 5
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Top 5
            </button>
            <button
              onClick={() => setProductLimit(10)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                productLimit === 10
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Top 10
            </button>
          </div>
        </div>

        {topProductsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">Loading products...</div>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">No products found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-xs font-medium text-gray-400">#</th>
                  <th className="text-left pb-3 text-xs font-medium text-gray-400">Product Name</th>
                  <th className="text-right pb-3 text-xs font-medium text-gray-400">Quantity Sold</th>
                  <th className="text-right pb-3 text-xs font-medium text-gray-400">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-sm font-medium text-gray-400">
                      {index + 1}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                          <span className="text-blue-500 text-xs font-bold">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-semibold text-gray-700">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-bold text-green-600">
                        ${product.revenue.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan="3" className="pt-4 text-right text-xs font-medium text-gray-500">
                    Total Revenue from Top {productLimit}:
                  </td>
                  <td className="pt-4 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      ${displayedProducts.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;