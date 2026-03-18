import { useState, useEffect } from "react";
import { Search, Heart, ShoppingCart, Menu, X, LogOut, Trash2, User, Mail, ShieldCheck } from "lucide-react";
import { useNavigate, NavLink } from 'react-router-dom';
import { supabase } from "../../config/supabaseClient";
import { useCart } from '../../context/CartContext';

const UserNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); 
  const { isCartOpen, openCart, closeCart, cartItems, removeFromCart, subtotal , loading } = useCart();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: "User", initial: "U", email: "" }); 
  const LogoImg = "/assets/logo.png";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser(); 
      if (user) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        setUserData({
          name: name,
          initial: name.charAt(0).toUpperCase(),
          email: user.email
        });
      }
    };
    getUser();
  }, []);

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut(); 
    if (error) throw error;
    
    setIsUserModalOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  } catch (error) {
    console.error('Logout error:', error.message);
  }
};

  const navLinkStyles = ({ isActive }) => {
    return `transition-all duration-300 pb-1 ${isActive
      ? "text-rose-800 border-b-2 border-rose-600 font-bold"
      : "text-gray-800 hover:text-rose-600 font-semibold"
      }`;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isMenuOpen || isCartOpen || isUserModalOpen) ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen, isCartOpen, isUserModalOpen]);

  return (
    <div className="w-full px-4 md:px-0 relative">
   
      <nav className="sticky top-4 z-50 w-full flex items-center justify-between px-6 md:px-10 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">

      
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={LogoImg} alt="logo" className="w-12 md:w-16 h-auto" />
          <span className="font-bold text-lg tracking-tight text-gray-900">
            MoonPanda.
          </span>
        </div>

      
        <ul className="hidden md:flex items-center gap-10 text-md">
          <li><NavLink to="/" className={navLinkStyles}>Home</NavLink></li>
          <li><NavLink to="/all-designs" className={navLinkStyles}>Shop</NavLink></li>
          <li><NavLink to="/about" className={navLinkStyles}>About</NavLink></li>
          <li><NavLink to="/contact" className={navLinkStyles}>Contact</NavLink></li>
        </ul>

        
        <div className="flex items-center gap-4 md:gap-6 text-gray-800">
          <button className="hover:opacity-70 transition-opacity">
            <Search size={18} />
          </button>

        
          <button 
            onClick={() => setIsUserModalOpen(true)}
            className="hover:text-rose-600 transition-all"
          >
            <User size={18} />
          </button>

<button
  onClick={openCart}
  className="hover:opacity-70 transition-opacity relative"
>
  <ShoppingCart size={18} />
  
  {!loading && cartItems.length > 0 && (
    <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
      {cartItems.length}
    </span>
  )}
</button>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>


      {isMenuOpen && (
        <div className="md:hidden bg-white mt-2 rounded-xl p-4 shadow-lg flex flex-col gap-4 text-gray-800 relative z-50 animate-in fade-in zoom-in duration-200">
          <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={navLinkStyles}>Home</NavLink>
          <NavLink to="/all-designs" onClick={() => setIsMenuOpen(false)} className={navLinkStyles}>Shop</NavLink>
          <NavLink to="/about" onClick={() => setIsMenuOpen(false)} className={navLinkStyles}>About</NavLink>
          <NavLink to="/contact" onClick={() => setIsMenuOpen(false)} className={navLinkStyles}>Contact</NavLink>
          <button onClick={handleLogout} className="text-left text-red-600 font-bold mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      {isUserModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" 
            onClick={() => setIsUserModalOpen(false)} 
          />
          <div className="fixed right-4 top-24 w-72 bg-white z-[70] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="p-4 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
              <span className="font-bold text-rose-900 text-sm">Account Settings</span>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-rose-600">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-800 flex items-center justify-center text-white text-2xl font-bold shadow-md mb-3">
                {userData.initial}
              </div>
              <h3 className="font-bold text-gray-800 text-lg capitalize">{userData.name}</h3>
              <div className="flex items-center gap-1 text-gray-500 text-[11px] mt-1">
                <Mail size={12} /> {userData.email}
              </div>
              <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={10} /> Verified User
              </div>
            </div>

          
            <div className="p-3 border-t border-gray-50 flex flex-col gap-1">
                <button onClick={() => {navigate('/cart'); setIsUserModalOpen(false)}} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 rounded-lg transition-colors">My Orders</button>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                    <LogOut size={14} /> Logout
                </button>
            </div>
          </div>
        </>
      )}

      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={closeCart}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-xs md:max-w-sm bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={20} /> Shopping Cart
              </h2>
              <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
              {cartItems.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <img
                        src={item.userDesign1?.trim() ? item.userDesign1 : item.image || item.image_url || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg bg-rose-50"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                        <p className="text-gray-500 text-xs">
                          {item.quantity} x <span className="text-rose-700 font-semibold">${item.price}</span>
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 text-sm">Your cart is empty.</div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center mb-6 font-bold">
                <span>Subtotal</span>
                <span className="text-rose-700 text-xl">${subtotal}</span>
              </div>
              <button
                onClick={() => { closeCart(); navigate('/cart'); }}
                className="w-full bg-rose-950 text-white py-4 rounded-xl font-bold hover:bg-rose-900 transition-all shadow-lg"
              >
                Go to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserNavbar;