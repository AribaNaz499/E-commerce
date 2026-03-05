import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, [isRegistering]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
      
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
       
        if (data?.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, email, role: 'user' }]);
        }
        alert('Check your email to confirm registration!');
      } else {
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      setEmail('');
      setPassword('');

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-rose-800 mb-4">Logged In!</h2>
          <p className="mb-6">{user.email}</p>
          <button onClick={() => supabase.auth.signOut()} className="w-full bg-slate-800 text-white py-3 rounded-xl">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-rose-800 mb-2">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>
        
        <form 
          key={isRegistering ? 'register' : 'login'} 
          onSubmit={handleAuth} 
          className="space-y-5" 
          autoComplete="off"
        >
          <div>
            <label className="block text-xs font-bold text-rose-700 uppercase mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-rose-500"
              placeholder="email@example.com"
              autoComplete="new-password" 
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-rose-700 uppercase mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:ring-2 focus:ring-rose-500"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-rose-800 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : (isRegistering ? "Register" : "Login")}
          </button>
        </form>

        <p 
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-center mt-6 text-sm text-rose-700 font-medium cursor-pointer hover:underline"
        >
          {isRegistering ? "Already have an account? Log in" : "Don't have an account? Register Now"}
        </p>
      </div>
    </div>
  );
};

export default Auth;