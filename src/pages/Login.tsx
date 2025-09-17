import React, { useState } from 'react';
import { useAuth } from '../provider/contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });

    if (result.success) {
      window.location.href = '/dashboard';
    }
  };

  return (
    // <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-700 to-blue-500 bg-[#e2e9f1]">
    <div className="flex items-center justify-center min-h-screen bg-[#dbe5ef]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ">
        <div className="flex flex-col items-center mb-6 bg-[#4b54bb] py-8 rounded-t-2xl" style={{borderBottom:"3px solid #5ac4fe"}}>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#5ac4fe] text-2xl font-bold">
            <span className='text-[#4b54bb]'>N</span>
            <span>B</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-white">System Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-8 py-5">
          {error && (
            <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#5ac4fe] hover:bg-[#5acafeec] text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>

          {/* <p className="text-center text-sm text-gray-500">
            New here?{' '}
            <a href="/register" className="text-blue-500 hover:underline">
              Create an account
            </a>
          </p> */}
          <br/>
        </form>
      </div>
    </div>
  );
};

export default Login;
