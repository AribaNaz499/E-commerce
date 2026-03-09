import { useState, useEffect } from "react";
import { Search, Heart, ShoppingCart, Menu, X, LogOut, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import LogoImg from "../../assets/images/logo.png"; 
import { supabase } from "../../supabase/client"; 
import { useCart } from '../../context/CartContext';

const UserNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isCartOpen, openCart, closeCart, cartItems, removeFromCart, subtotal } = useCart(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error.message);
    }
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
    document.body.style.overflow = (isMenuOpen || isCartOpen) ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen, isCartOpen]);

  return (
    <div className="w-full px-4 md:px-0 relative">
      <nav className="sticky top-4 z-50 w-full flex items-center justify-between px-6 md:px-10 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={LogoImg} alt="logo" className="w-12 md:w-16 h-auto" />
          <span className="font-bold text-lg tracking-tight text-gray-900">
            MoonPanda.
          </span>
        </div>

        <ul className="hidden md:flex items-center gap-10 font-semibold text-gray-800 text-md">
          <li><a href="/" className="hover:text-rose-600 transition-all">Home</a></li>
          <li><a href="/shop" className="hover:text-rose-600 transition-all">Shop</a></li>
          <li><a href="/about" className="hover:text-rose-600 transition-all">About</a></li>
          <li><a href="/contact" className="hover:text-rose-600 transition-all">Contact</a></li>
        </ul>

        <div className="flex items-center gap-4 md:gap-6 text-gray-800">
          <button className="hover:opacity-70 transition-opacity">
            <Search size={18} />
          </button>
          <button className="hidden sm:block hover:opacity-70 transition-opacity">
            <Heart size={18} />
          </button>
          
          <button 
            onClick={openCart}
            className="hover:opacity-70 transition-opacity relative"
          >
            <ShoppingCart size={18} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                {cartItems.length}
              </span>
            )}
          </button>

          <button 
            onClick={handleLogout}
            className="hidden md:block hover:text-red-600 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
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
        <div className="md:hidden bg-white mt-2 rounded-xl p-4 shadow-lg flex flex-col gap-3 font-semibold text-gray-800 relative z-50">
          <a href="/" onClick={() => setIsMenuOpen(false)}>Home</a>
          <a href="/shop" onClick={() => setIsMenuOpen(false)}>Shop</a>
          <a href="/about" onClick={() => setIsMenuOpen(false)}>About</a>
          <a href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
          <button onClick={handleLogout} className="text-left text-red-600 font-bold mt-2 pt-2 border-t border-gray-100">
            Logout
          </button>
        </div>
      )}

  
      {isCartOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
            onClick={closeCart}
          />
          
          <div className="fixed right-0 top-0 h-full w-full max-w-xs md:max-w-sm bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={20} /> Shopping Cart
              </h2>
              <button 
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

        
            <div className="flex-grow overflow-y-auto p-6">
              {cartItems.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover rounded-xl bg-rose-50" 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h3>
                        <p className="text-gray-500 text-xs mt-1">
                          {item.quantity} x <span className="text-rose-700 font-semibold text-sm">Rs. {item.price}</span>
                        </p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 flex flex-col items-center">
                   <div className="bg-gray-50 p-4 rounded-full mb-4">
                      <ShoppingCart size={40} className="text-gray-300" />
                   </div>
                  <p className="text-gray-400 text-sm">Your cart is currently empty.</p>
                  <button 
                      onClick={closeCart}
                      className="mt-4 text-rose-600 font-semibold text-sm hover:underline"
                  >
                      Continue Shopping
                  </button>
                </div>
              )}
            </div>

        
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-rose-700 font-bold text-xl">Rs. {subtotal}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { closeCart(); navigate('/cart'); }}
                    className="w-full bg-rose-950 hover:bg-rose-900 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg"
                  >
                    Go to Checkout
                  </button>
                  
                
                  <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { closeCart(); navigate('/cart'); }}
                        className="py-2 px-4 border border-gray-300 rounded-full text-xs font-bold hover:bg-white transition-all"
                      >
                        Cart
                      </button>
                      <button 
                        className="py-2 px-4 border border-gray-300 rounded-full text-xs font-bold hover:bg-white transition-all"
                      >
                        Comparison
                      </button>
                  </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserNavbar;