import React, { useState, useEffect } from 'react';
import { Loader2, Search, ShieldOff, ShieldCheck, Eye, X } from 'lucide-react';
import { supabase } from "../../config/supabaseClient";
import { useNavigate } from 'react-router-dom';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModal, setIsViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin') 
        .order('id', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, is_blocked: !currentStatus } : u)
      );

      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, is_blocked: !currentStatus }));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewModal(true);
  };

  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      (u.full_name || u.name || "").toLowerCase().includes(search) ||
      (u.email || "").toLowerCase().includes(search)
    );
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Users</h2>
            <p className="text-xs sm:text-sm text-gray-400">Total Users: {users.length}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">
            Search By Name or Email
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/40 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-md text-gray-700">{user.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.is_blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleView(user)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => toggleBlock(user.id, user.is_blocked)}
                        disabled={actionLoading === user.id || user.role === 'admin'}
                        className={`p-2 rounded-lg transition-all ${
                          user.role === 'admin' ? 'text-gray-300 cursor-not-allowed' : 
                          user.is_blocked ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {actionLoading === user.id ? <Loader2 size={18} className="animate-spin" /> : 
                         user.is_blocked ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredUsers.map((user) => (
           <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {(user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-400">{user.email || "—"}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {user.is_blocked ? "Blocked" : "Active"}
                </span>
             </div>
             <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button onClick={() => handleView(user)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-100">
                  <Eye size={14} /> View
                </button>
                <button onClick={() => toggleBlock(user.id, user.is_blocked)} disabled={actionLoading === user.id || user.role === 'admin'} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-semibold border ${user.is_blocked ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                   {actionLoading === user.id ? <Loader2 size={14} className="animate-spin" /> : user.is_blocked ? "Unblock" : "Block"}
                </button>
             </div>
           </div>
        ))}
      </div>

      {isViewModal && selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8" onClick={() => setIsViewModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
              <h3 className="text-lg font-bold text-slate-800">User Detail</h3>
              <button onClick={() => setIsViewModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={24} /></button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {(selectedUser.email || "U").charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-gray-500">{selectedUser.email || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold">Role</p>
                  <span className="text-blue-700 text-[10px] font-bold uppercase">{selectedUser.role || "user"}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold">Status</p>
                  <span className={`text-[10px] font-bold uppercase ${selectedUser.is_blocked ? 'text-red-700' : 'text-green-700'}`}>
                    {selectedUser.is_blocked ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>
              {selectedUser.role !== 'admin' && (
                <button
                  onClick={() => toggleBlock(selectedUser.id, selectedUser.is_blocked)}
                  disabled={actionLoading === selectedUser.id}
                  className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all ${selectedUser.is_blocked ? 'bg-green-600' : 'bg-red-500'}`}
                >
                  {actionLoading === selectedUser.id ? <Loader2 size={18} className="animate-spin mx-auto" /> : selectedUser.is_blocked ? 'Unblock User' : 'Block User'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUser;