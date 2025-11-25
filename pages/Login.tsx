
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { mockApi } from '../services/mockBackend';
import { Lock, User, Mail, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { dispatch } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { api } = await import('../services/apiService');
      let user;
      if (isRegister) {
        user = await api.register({ username, email, password });
      } else {
        user = await api.login({ identifier, password });
      }
      dispatch({ type: 'SET_USER', payload: user.user });
      // Save token to localStorage for later API calls
      localStorage.setItem('token', user.token);
      navigate(user.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-gray-500">{isRegister ? 'Join Freshmart for exclusive deals' : 'Sign in to access your orders'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister ? (
            // Register Fields
            <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="johndoe"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                </div>
            </>
          ) : (
             // Login Fields
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
                <div className="relative">
                  <LogIn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="user@example.com or user"
                    required
                  />
                </div>
             </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                    onClick={() => { setIsRegister(!isRegister); setError(''); }}
                    className="text-green-600 font-bold hover:underline"
                >
                    {isRegister ? 'Login' : 'Register'}
                </button>
            </p>
        </div>

        {!isRegister && (
            <div className="mt-6 text-center bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-800">Demo Credentials:</p>
            <div className="text-xs text-blue-600 mt-2 space-y-1">
                <p>Admin: <span className="font-mono">admin</span> / <span className="font-mono">admin</span></p>
                <p>User: <span className="font-mono">user</span> / <span className="font-mono">user</span></p>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;
