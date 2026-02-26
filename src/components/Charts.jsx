import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';

const data = [
  { name: 'Aug 17', current: 100, previous: 450 },
  { name: 'Aug 18', current: 220, previous: 280 },
  { name: 'Aug 19', current: 400, previous: 220 },
  { name: 'Aug 20', current: 250, previous: 260 },
  { name: 'Aug 21', current: 350, previous: 150 },
  { name: 'Aug 22', current: 480, previous: 160 },
  { name: 'Aug 23', current: 420, previous: 170 },
];

const Analytics = () => {
  return (
    
   <div className="w-full bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-gray-100">
  

  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
    <div className="w-full sm:w-auto">
      <div className="flex gap-4 md:gap-6">
        <div>
          <p className="text-[10px] text-gray-400 font-medium mb-0.5">Current week</p>
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-black text-blue-600">$180</span>
            <span className="flex items-center text-[9px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded-full">
              ↑ 7%
            </span>
          </div>
        </div>
        
        <div className="border-l border-gray-100 pl-4 md:pl-6">
          <p className="text-[10px] text-gray-400 font-medium mb-0.5">Previous week</p>
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold text-gray-300">$52.30</span>
            <span className="flex items-center text-[9px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full">
              ↓ 5%
            </span>
          </div>
        </div>
      </div>
    </div>
    
    
    <div className="flex gap-2 text-[10px] font-bold text-gray-400">
      <button className="px-2 py-1 hover:text-gray-800 transition-colors">Day</button>
      <button className="px-2 py-1 text-gray-900 border-b-2 border-gray-900">Week</button>
      <button className="px-2 py-1 hover:text-gray-800 transition-colors">Month</button>
    </div>
  </div>


  <div className="h-[200px] sm:h-[240px] lg:h-[280px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
        
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 500}}
          dy={10}
          interval={typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 0}
        />
        
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{fill: '#cbd5e1', fontSize: 10}}
          domain={[0, 500]}
          ticks={[0, 250, 500]} 
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
  </div>
</div>
  );
};

export default Analytics;