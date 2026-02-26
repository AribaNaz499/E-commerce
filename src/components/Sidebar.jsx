import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { LayoutGrid, ShoppingBag, PlusSquare, Menu, X, Layers } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { icon: <Layers size={18} />, label: "Dashboard", path: "/" },
    { icon: <ShoppingBag size={18} />, label: "All Products", path: "/all-products" },
    { icon: <PlusSquare size={18} />, label: "Add Product", path: "/add-product" },
  ];

  return (
    <div className="flex">
     
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

     
      <div className={`
        fixed lg:static z-40 w-64 h-screen bg-stone-50 border-r border-stone-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
       
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-blue-200 shadow-lg">
            <LayoutGrid size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">CanvaAdmin</span>
        </div>

     
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar pb-10">
          <p className="text-gray-400 text-[10px] tracking-widest font-bold uppercase px-4 py-4">Main Menu</p>
          
          {links.map((item, i) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={i} 
                to={item.path}
                onClick={() => setIsOpen(false)} 
                className={`flex items-center gap-3 w-full py-3 px-5 rounded-full transition-all duration-200 
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                  }`}
              >
                {item.icon}
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        
        <div className="p-4 border-t border-stone-200 bg-stone-100/50">
           <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-200" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">Miron Mahmud</span>
                <span className="text-[10px] text-slate-500">Admin</span>
              </div>
           </div>
        </div>
      </div>

    
      <style jsx="true">{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>


      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-30 lg:hidden transition-opacity" 
        />
      )}
    </div>
  );
};

export default Sidebar;