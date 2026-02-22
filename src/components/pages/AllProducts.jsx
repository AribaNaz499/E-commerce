import React, { useState, useEffect } from 'react';
import { Eye, PenIcon, Trash, Loader2, Search, X } from 'lucide-react';
import { supabase } from "../../supabase/client";
import { useNavigate } from 'react-router-dom';

const AllProducts = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModal, setIsViewModal] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { descending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDesign = async (id) => {
    const confirmDelete = window.confirm("Did you really want to delete this design?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsViewModal(true);
  };

  const handleEdit = (id) => {
    navigate(`/design-editor/${id}`);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      <div className="p-8 rounded-2xl shadow-sm border border-gray-100 bg-white">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Design Inventory</h2>
            <p className="text-sm text-gray-400 mt-1">Total Designs: {templates.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-widest ml-1">Category By</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all">
              <option value="all">All Categories</option>
              <option value="Posters">Posters</option>
              <option value="Social Media">Social Media</option>
              <option value="Kids Design">Kids Design</option>
              <option value="Logo">Logo</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 md:col-span-2">
            <label className="text-[11px] font-extrabold uppercase text-slate-400 tracking-widest ml-1">Search By Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
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

      <div className="mt-7 overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse min-w-[600px]">
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
            {filteredTemplates.map((product) => (
              <tr key={product.id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                <td className="px-6 py-4 text-sm font-medium text-slate-600">#{String(product.id).slice(0, 5)}</td>
                <td className="px-6 py-4">
                  <div className="w-16 h-10 rounded-md bg-slate-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image_url || 'https://placehold.co/100x100?text=No+Preview'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">{product.name}</td>
                <td className="px-6 py-4 uppercase text-[10px] font-bold text-blue-700">
                  <span className="px-3 py-1 bg-blue-100 rounded-full">{product.category || "General"}</span>
                </td>
                <td className="px-6 py-4 text-center flex justify-center gap-3">
                  <button onClick={() => handleView(product)} className="p-1.5 bg-green-50 text-green-600 rounded-md border border-green-200"><Eye size={18} /></button>
                  <button onClick={() => handleEdit(product.id)} className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-200"><PenIcon size={18} /></button>
                  <button onClick={() => deleteDesign(product.id)} className="p-1.5 bg-red-50 text-red-600 rounded-md border border-red-200"><Trash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isViewModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-bold text-slate-800">Design Preview</h3>
              <button onClick={() => setIsViewModal(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <img src={selectedProduct.image_url} alt="Preview" className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md border" />
              <div className="mt-4 text-center">
                <p className="text-xl font-bold text-slate-700">{selectedProduct.name}</p>
                <p className="text-blue-600 text-sm font-semibold uppercase">{selectedProduct.category || "General"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;