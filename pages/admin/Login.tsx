
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Flame } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      login('valid_token_123456');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
           <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <Flame className="text-brand-red w-6 h-6" />
           </div>
           <h2 className="text-2xl text-white font-bold">Admin Portal</h2>
           <p className="text-slate-400 text-sm mt-2">Enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
              placeholder="123456"
            />
          </div>

          <button type="submit" className="w-full bg-brand-red text-white py-2 rounded font-medium hover:bg-red-700 transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
