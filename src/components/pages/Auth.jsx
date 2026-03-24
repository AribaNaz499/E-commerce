import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isRegistering) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        if (authData?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: authData.user.id, 
                email: email, 
                role: 'user', 
                is_blocked: false, 
                last_login: new Date().toISOString() 
              }
            ]);
          
          if (profileError) throw new Error("Profile creation failed.");
        }

        setMessage({ type: 'success', text: 'Registration successful! Please check your email.' });
        setEmail('');
        setPassword('');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_blocked')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.is_blocked === true) {
          await supabase.auth.signOut(); 
          throw new Error("Your account has been blocked by the admin.");
        }

        const userRole = profile?.role || 'user';
        sessionStorage.setItem('mp-role', userRole);
        window.location.href = userRole === 'admin' ? '/admin-portal' : '/user-home';
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fdf2f2] font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-lg w-full max-w-[430px] border border-gray-50 mx-4">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐼</div>
          <h2 className="text-[1.7rem] font-bold text-[#990033]">MoonPanda</h2>
          <p className="text-gray-500 text-sm mt-2">
            {isRegistering ? 'Create your account' : 'Login to continue'}
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-3 rounded-xl text-center text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6" autoComplete="off">
          <input type="text" style={{ display: 'none' }} />
          <input type="password" style={{ display: 'none' }} />

          <div className="space-y-2">
            <label className="block text-[0.75rem] font-bold text-[#990033] uppercase ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#eef4ff] border-none outline-none focus:ring-2 focus:ring-[#990033] transition-all"
              placeholder="example@gmail.com"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[0.75rem] font-bold text-[#990033] uppercase ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#eef4ff] border-none outline-none focus:ring-2 focus:ring-[#990033] transition-all"
              placeholder="••••••"
              required
              disabled={loading}
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#990033] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#80002b] disabled:opacity-70 disabled:cursor-not-allowed transition-all text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                {isRegistering ? 'Registering...' : 'Logging in...'}
              </span>
            ) : (
              isRegistering ? 'Register Now' : 'Login'
            )}
          </button>
        </form>

        <p
          onClick={() => { setIsRegistering(!isRegistering); setMessage({ type: '', text: '' }); }}
          className="text-center text-[#990033] font-bold cursor-pointer hover:underline mt-6 text-[0.95rem]"
        >
          {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register Now"}
        </p>
      </div>
    </div>
  );
};

export default Auth;