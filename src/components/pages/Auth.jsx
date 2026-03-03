import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setEmail('');
      setPassword('');

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-rose-800 mb-2">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">Log in to your account</p>
        
        <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              name={`email_${Math.random()}`} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
              placeholder="email@example.com"
              required
              autoComplete="new-email" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              name={`pass_${Math.random()}`} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
              placeholder="••••••••"
              required
              autoComplete="new-password" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-rose-800 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-rose-700 font-medium cursor-pointer hover:underline">
        Register Now
        </p>
      </div>
    </div>
  );
};

export default Auth;