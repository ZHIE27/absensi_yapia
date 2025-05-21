import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css"
import axios from 'axios';

const Login = () => {
  const [credentials, setCredentials] = useState({
    no_wa: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/login', credentials, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setMessage(res.data.message);
      console.log('Login successful! Response data:', res.data);
      
        // Simpan token JWT ke localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      // Simpan data user ke localStorage (opsional)
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        console.log('User details:', res.data.user);
  }
      navigate("/dashboard");
    } catch (err) {
      let errorMessage = 'Gagal terhubung ke server';
      if (err.response) {
        errorMessage = err.response.data.message || err.response.statusText;
        console.log('Error response:', err.response.data);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form 
        onSubmit={handleLogin}
        className="p-6 rounded-lg bg-slate-50 shadow-md w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Login Absensi</h2>
          <p className="text-gray-600 mt-1">Masukkan kredensial Anda</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {message}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="no_wa" className="block text-gray-700 text-sm font-medium mb-1">
            Nomor WhatsApp
          </label>
          <input
            id="no_wa"
            name="no_wa"
            type="text"
            value={credentials.no_wa}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nomor WhatsApp"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </span>
          ) : (
            'Login'
          )}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Lupa Password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;