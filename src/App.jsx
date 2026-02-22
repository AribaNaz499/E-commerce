import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar' 
import Dashboard from './components/pages/Dashboard'
import AddProduct from './components/pages/NewProduct'
import AllProducts from './components/pages/AllProducts'
import EditProduct from './components/pages/EditProduct'
import { CanvasProvider } from './context/CanvasContext'

const LayoutManager = ({ children }) => {
  const location = useLocation();

  const isEditorPage = 
    location.pathname === '/add-product' || 
    location.pathname.startsWith('/design-editor/');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {!isEditorPage && <Sidebar />} 
      
      <div className={`flex-1 overflow-y-auto ${isEditorPage ? 'w-full' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <CanvasProvider>
      <Router>
        <LayoutManager>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/design-editor/:id" element={<EditProduct />} />
          </Routes>
        </LayoutManager>
      </Router>
    </CanvasProvider>
  )
}

export default App;