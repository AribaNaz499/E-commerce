import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from "../../config/supabaseClient";

const AdminSettings = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_percent: '',
    expiry_date: '',
    usage_limit: '',
  });
  const [formError, setFormError] = useState('');

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCodes(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleAdd = async () => {
    setFormError('');
    if (!form.code.trim()) return setFormError('Code naam zaroori hai');
    if (!form.discount_percent || Number(form.discount_percent) <= 0 || Number(form.discount_percent) > 100)
      return setFormError('Discount 1-100 ke beech hona chahiye');

    setActionLoading('add');
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert({
          code: form.code.trim().toUpperCase(),
          discount_percent: Number(form.discount_percent),
          expiry_date: form.expiry_date || null,
          usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
          used_count: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('unique')) {
          setFormError('Yeh code already exist karta hai');
        } else {
          throw error;
        }
        return;
      }

      setCodes(prev => [data, ...prev]);
      setForm({ code: '', discount_percent: '', expiry_date: '', usage_limit: '' });
      setIsModalOpen(false);
    } catch (err) {
      setFormError('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setCodes(prev =>
        prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c)
      );
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Is code ko delete karna chahte ho?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCodes(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Settings</h2>
            <p className="text-xs sm:text-sm text-gray-400">Promo Codes — Total: {codes.length}</p>
          </div>
          <button
            onClick={() => { setIsModalOpen(true); setFormError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
          >
            <Plus size={18} /> Add Code
          </button>
        </div>
      </div>

      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Discount</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Usage</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {codes.length > 0 ? (
              codes.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/40 transition-all">
                  <td className="px-6 py-4 font-mono font-bold text-slate-700">
                    {c.code}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {c.discount_percent}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {c.expiry_date || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className={`font-bold ${
                      c.usage_limit !== null && c.used_count >= c.usage_limit
                        ? 'text-red-500'
                        : 'text-slate-700'
                    }`}>
                      {c.used_count || 0}
                    </span>
                    <span className="text-gray-400"> / {c.usage_limit ?? '∞'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      c.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => toggleActive(c.id, c.is_active)}
                        disabled={actionLoading === c.id}
                        className={`p-2 rounded-lg transition-all ${
                          c.is_active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={c.is_active ? 'Inactive karo' : 'Active karo'}
                      >
                        {actionLoading === c.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : c.is_active ? (
                          <ToggleRight size={22} />
                        ) : (
                          <ToggleLeft size={22} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCode(c.id)}
                        disabled={actionLoading === c.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  There is no any Promo Code
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {codes.length > 0 ? (
          codes.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-lg text-slate-800">{c.code}</p>
                  <p className="text-sm text-gray-500">{c.discount_percent}% off</p>
                  <p className="text-xs text-gray-400">Expiry: {c.expiry_date || '—'}</p>
                  <p className="text-xs text-gray-400">
                    Used: <span className="font-bold text-slate-600">{c.used_count || 0}</span> / {c.usage_limit ?? '∞'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button
                  onClick={() => toggleActive(c.id, c.is_active)}
                  disabled={actionLoading === c.id}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-semibold border ${
                    c.is_active
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-gray-50 text-gray-500 border-gray-100'
                  }`}
                >
                  {c.is_active ? <><ToggleRight size={14} /> Active</> : <><ToggleLeft size={14} /> Inactive</>}
                </button>
                <button
                  onClick={() => deleteCode(c.id)}
                  disabled={actionLoading === c.id}
                  className="p-2 bg-red-50 text-red-700 rounded-md border border-red-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-10 text-center rounded-xl border border-dashed border-gray-300 text-gray-500">
            There is no any Promo Code
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-slate-800">New Promo Code</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Code</label>
                <input
                  type="text"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-mono font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Discount %</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  min="1"
                  max="100"
                  value={form.discount_percent}
                  onChange={(e) => setForm(prev => ({ ...prev, discount_percent: e.target.value }))}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Expiry Date <span className="text-gray-300 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Usage Limit <span className="text-gray-300 font-normal">(Optional — blank = unlimited)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  min="1"
                  value={form.usage_limit}
                  onChange={(e) => setForm(prev => ({ ...prev, usage_limit: e.target.value }))}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {formError && (
                <p className="text-red-500 text-sm font-medium">{formError}</p>
              )}

              <button
                onClick={handleAdd}
                disabled={actionLoading === 'add'}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2"
              >
                {actionLoading === 'add' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <><Plus size={18} /> Add Code</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;