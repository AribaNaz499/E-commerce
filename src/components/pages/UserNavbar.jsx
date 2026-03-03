import { useState, useEffect } from "react";
import { Search, User, Heart, ShoppingCart, Menu, X, LogOut } from "lucide-react";
import LogoImg from "../../assets/images/logo.png"; 
import { supabase } from "../../supabase/client"; 

const UserNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  
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
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <div className="w-full px-4 md:px-0">
      <nav className="sticky top-4 z-50 w-full flex items-center justify-between px-6 md:px-10 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={LogoImg} alt="logo" className="w-12 md:w-16 h-auto" />
          <span className="font-bold text-lg tracking-tight text-gray-900">
            MoonPanda.
          </span>
        </div>

        <ul className="hidden md:flex items-center gap-10 font-semibold text-gray-800 text-md">
          <li>
            <a href="/" className="hover:text-black transition-all">
              Home
            </a>
          </li>
          <li>
            <a href="/shop" className="hover:text-black transition-all">
              Shop
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-black transition-all">
              About
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-black transition-all">
              Contact
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-4 md:gap-6 text-gray-800">
          <button className="hover:opacity-70 transition-opacity">
            <Search size={18} />
          </button>
          <button className="hidden sm:block hover:opacity-70 transition-opacity">
            <User size={18} />
          </button>
          <button className="hidden sm:block hover:opacity-70 transition-opacity">
            <Heart size={18} />
          </button>
          <button className="hover:opacity-70 transition-opacity relative">
            <ShoppingCart size={18} />
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
              0
            </span>
          </button>

          <button 
            onClick={handleLogout}
            className="hover:text-red-600 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>

          <button
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-white mt-2 rounded-xl p-4 shadow-lg flex flex-col gap-3 font-semibold text-gray-800">
          <a href="/" onClick={() => setIsMenuOpen(false)}>
            Home
          </a>
          <a href="/shop" onClick={() => setIsMenuOpen(false)}>
            Shop
          </a>
          <a href="/about" onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <a href="/contact" onClick={() => setIsMenuOpen(false)}>
            Contact
          </a>
          <button 
            onClick={handleLogout}
            className="text-left text-red-600 font-bold mt-2 pt-2 border-t border-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserNavbar;