import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { CanvasProvider } from './context/CanvasContext'
import { UserCanvasProvider } from './context/UserCanvasContext'

import Dashboard from './components/pages/Dashboard'
import AddProduct from './components/pages/NewProduct'
import AllProducts from './components/pages/AllProducts'
import EditProduct from './components/pages/EditProduct'
import Sidebar from './components/Sidebar'
import UserHome from './components/pages/UserHome'
import AllDesigns from './components/pages/AllDesigns'
import CategoryPage from './components/pages/CategoryPage'
import UserEditDesign from './components/pages/UserEditDesign'

const LayoutManager = ({ children }) => {
  const location = useLocation();
  
  const isAdminPath = location.pathname.startsWith("/admin-portal");
  
  // Logic: Agar path mein 'add-product' ya 'edit' aaye toh sidebar hide kar do
  const isEditorPage = location.pathname.includes("/add-product") || 
                       location.pathname.includes("/edit/");

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isAdminPath ? 'bg-gray-50' : 'bg-white'}`}>
      {/* Sidebar sirf tab dikhega jab Admin path ho aur Editor page NA ho */}
      {isAdminPath && !isEditorPage && <Sidebar />}
      
      <div className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <CanvasProvider>
        <UserCanvasProvider>
          <LayoutManager>
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<UserHome />} />
              <Route path="/all-designs" element={<AllDesigns />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/design-editor/:id" element={<UserEditDesign />} />

              {/* Admin Routes */}
              <Route path="/admin-portal" element={<Dashboard />} />
              <Route path="/admin-portal/all-products" element={<AllProducts />} />
              <Route path="/admin-portal/add-product" element={<AddProduct />} />
              <Route path="/admin-portal/edit/:id" element={<EditProduct />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </LayoutManager>
        </UserCanvasProvider>
      </CanvasProvider>
    </Router>
  )
}

export default App;