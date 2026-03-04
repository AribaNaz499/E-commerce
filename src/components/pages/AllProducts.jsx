import React, { useState, useEffect } from 'react';
import { Eye, PenIcon, Trash, Loader2, Search, X } from 'lucide-react';
import { supabase } from "../../supabase/client";
import { useNavigate } from 'react-router-dom';

const AllProducts = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModal, setIsViewModal] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const deleteDesign = async (id) => {
    const confirmDelete = window.confirm("Did you really want to delete this design?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedProduct?.id === id) {
        setIsViewModal(false);
        setSelectedProduct(null);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getImageUrl = (product) => {
    if (!product) return 'https://placehold.co/400x600?text=No+Preview';
    
    if (product.image_url) {
      if (typeof product.image_url === 'string' && product.image_url.startsWith('data:image')) {
        return product.image_url;
      }
      if (typeof product.image_url === 'string' && product.image_url.startsWith('http')) {
        return product.image_url;
      }
      if (typeof product.image_url === 'string') {
        return product.image_url;
      }
    }
    
    if (product.content) {
      let content = product.content;
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch (e) {
        }
      }
      
      if (content && content.preview) {
        return content.preview;
      }
      
      if (content && content.image_url) {
        return content.image_url;
      }
    }
    
    return 'https://placehold.co/400x600?text=No+Preview';
  };

  const handleImageError = (productId) => {
    console.log("Image error for:", productId);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsViewModal(true);
  };

  const handleEdit = (id) => {
    navigate(`/admin-portal/edit/${id}`);
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = (t.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (t.category && t.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      
      <div className="p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 bg-white mb-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Design Inventory</h2>
          <p className="text-xs sm:text-sm text-gray-400">Total Designs: {templates.length}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Category By</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Posters">Posters</option>
              <option value="Social Media">Social Media</option>
              <option value="Kids Designs">Kids Designs</option>
              <option value="Logos">Logos</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Search By Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search design name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Thumbnail</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Design Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50/40 transition-all">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    #{String(product.id).slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded bg-gray-100 border overflow-hidden flex items-center justify-center">
                      {!imageErrors[product.id] ? (
                        <img 
                          src={getImageUrl(product)} 
                          alt={product.name || "Design"}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs text-center p-1">
                          No Image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{product.name || "Untitled"}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                      {product.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleView(product)} 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(product.id)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <PenIcon size={18} />
                      </button>
                      <button 
                        onClick={() => deleteDesign(product.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No designs found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-50 border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {!imageErrors[product.id] ? (
                    <img 
                      src={getImageUrl(product)} 
                      alt={product.name || "Design"}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(product.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs text-center p-1">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-gray-400">#{String(product.id).slice(0, 8)}</p>
                  <h3 className="font-bold text-slate-800 truncate">{product.name || "Untitled"}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase border border-blue-100">
                    {product.category || "General"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex gap-2 w-full justify-between">
                  <button 
                    onClick={() => handleView(product)} 
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-100"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button 
                    onClick={() => handleEdit(product.id)} 
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-100"
                  >
                    <PenIcon size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => deleteDesign(product.id)} 
                    className="p-2 bg-red-50 text-red-700 rounded-md border border-red-100"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-10 text-center rounded-xl border border-dashed border-gray-300 text-gray-500">
            No designs found.
          </div>
        )}
      </div>

      {isViewModal && selectedProduct && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8"
          onClick={() => setIsViewModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-5xl h-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                  {selectedProduct.name || "Untitled Design"}
                </h3>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">
                  ID: {selectedProduct.id}
                </p>
              </div>

              <button
                onClick={() => setIsViewModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 sm:p-10 overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                {!imageErrors[selectedProduct.id] ? (
                  <img
                    src={getImageUrl(selectedProduct)}
                    alt={selectedProduct.name || "Design Preview"}
                    className="max-w-full max-h-full object-contain rounded-md shadow-2xl bg-white"
                    onError={() => handleImageError(selectedProduct.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 rounded-md">
                    <div className="text-center">
                      <p className="text-lg font-semibold">No Preview Available</p>
                      <p className="text-sm mt-2">The image could not be loaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t flex items-center justify-between">
              <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                {selectedProduct.category || "General"}
              </span>
              <button 
                onClick={() => handleEdit(selectedProduct.id)}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Edit Design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;