import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { supabase } from './config/supabaseClient'
import { CanvasProvider } from './context/CanvasContext'
import { CartProvider } from './context/CartContext'

import Auth from './components/pages/Auth'
import Dashboard from './components/pages/Dashboard'
import AddProduct from './components/pages/NewProduct'
import AllProducts from './components/pages/AllProducts'
import EditProduct from './components/pages/EditProduct'
import Sidebar from './components/Sidebar'
import UserHome from './components/pages/UserHome'
import AllDesigns from './components/pages/AllDesigns'
import CategoryPage from './components/pages/CategoryPage'
import UserEditDesign from './components/pages/UserEditDesign'
import CardPreview from './components/pages/CardPreview'
import AddToCart from './components/pages/AddToCart'
import Contact from './components/pages/Contact'
import Success from './components/pages/Success'

const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="text-2xl mb-2">🐼</div>
      <div className="text-[#990033] font-medium">MoonPanda</div>
      <div className="text-xs text-gray-400 mt-2">Loading...</div>
    </div>
  </div>
);

const LayoutManager = ({ children, role }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin-portal");
  const isEditorPage =
    location.pathname.includes("/add-product") ||
    location.pathname.includes("/edit/");

  if (isAdminPath && role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isAdminPath ? 'bg-gray-50' : 'bg-white'}`}>
      {isAdminPath && !isEditorPage && <Sidebar />}
      <div className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (s?.user?.id) {
          setSession(s);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', s.user.id)
            .single();
          const fetchedRole = profile?.role || 'user';
          sessionStorage.setItem('mp-role', fetchedRole);
          if (mounted) setRole(fetchedRole);
        } else {
          setSession(null);
          setRole(null);
        }
      } catch (_) {}

      if (mounted) setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') {
        sessionStorage.clear();
        setSession(null);
        setRole(null);
        if (window.location.pathname !== '/') {
          window.location.replace('/');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <CartProvider>
        <CanvasProvider>
          <Routes>
            <Route path="/" element={
              session
                ? <Navigate to={role === 'admin' ? '/admin-portal' : '/user-home'} replace />
                : <Auth />
            } />
            <Route path="/auth" element={
              session
                ? <Navigate to={role === 'admin' ? '/admin-portal' : '/user-home'} replace />
                : <Auth />
            } />

            <Route path="/user-home" element={
              session ? <LayoutManager role={role}><UserHome /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/all-designs" element={
              session ? <LayoutManager role={role}><AllDesigns /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/category/:categoryName" element={
              session ? <LayoutManager role={role}><CategoryPage /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/design-editor/:id" element={
              session ? <LayoutManager role={role}><UserEditDesign /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/card-preview" element={
              session ? <LayoutManager role={role}><CardPreview /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/cart" element={
              session ? <LayoutManager role={role}><AddToCart /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/contact" element={
              session ? <LayoutManager role={role}><Contact /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/success" element={
              session ? <LayoutManager role={role}><Success /></LayoutManager> : <Navigate to="/" replace />
            } />

            <Route path="/admin-portal" element={
              session ? <LayoutManager role={role}><Dashboard /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/admin-portal/all-products" element={
              session ? <LayoutManager role={role}><AllProducts /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/admin-portal/add-product" element={
              session ? <LayoutManager role={role}><AddProduct /></LayoutManager> : <Navigate to="/" replace />
            } />
            <Route path="/admin-portal/edit/:id" element={
              session ? <LayoutManager role={role}><EditProduct /></LayoutManager> : <Navigate to="/" replace />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CanvasProvider>
      </CartProvider>
    </Router>
  );
};

export default App;