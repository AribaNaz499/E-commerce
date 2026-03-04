import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { supabase } from './supabase/client'
import { CanvasProvider } from './context/CanvasContext'

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
const LayoutManager = ({ children, role }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin-portal");
  const isEditorPage = location.pathname.includes("/add-product") || location.pathname.includes("/edit/");

  if (isAdminPath && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

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
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setRole(data?.role);
    } catch (err) {
      console.error("Error fetching role:", err);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-bold text-blue-600">
      MoonPanda Setup Loading...
    </div>
  );

  return (
    <Router>
      <CanvasProvider>
        {!session ? (
          <Auth />
        ) : (
          <LayoutManager role={role}>
            <Routes>
              <Route 
                path="/" 
                element={role === 'admin' ? <Navigate to="/admin-portal" replace /> : <UserHome />} 
              />
              
              <Route path="/all-designs" element={<AllDesigns />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/design-editor/:id" element={<UserEditDesign />} />
       <Route path="/card-preview" element={<CardPreview />} /><Route path="/card-preview" element={<CardPreview />} />
              {role === 'admin' && (
                <>
                  <Route path="/admin-portal" element={<Dashboard />} />
                  <Route path="/admin-portal/all-products" element={<AllProducts />} />
                  <Route path="/admin-portal/add-product" element={<AddProduct />} />
                  <Route path="/admin-portal/edit/:id" element={<EditProduct />} />
                </>
              )}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LayoutManager>
        )}
      </CanvasProvider>
    </Router>
  )
}

export default App;