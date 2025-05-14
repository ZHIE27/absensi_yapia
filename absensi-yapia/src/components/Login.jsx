import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Data dummy pengguna
  const users = [
    { nama: "Budi", password: "123", nip: "123456", role: "Guru" },
    { nama: "Alex", password: "234", nip: "234567", role: "Guru" },
    { nama: "Dina", password: "321", nip: "654321", role: "Staff" }
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    const foundUser = users.find(
      (user) => user.nama === nama && user.password === password
    );

    if (foundUser) {
      localStorage.setItem("user", JSON.stringify(foundUser));
      navigate("/dashboard");
    } else {
      setError("Nama atau password salah!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Login Absensi</h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <label className="block mb-2">Nama</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded"
          required
        />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-blue-500 hover:underline"
          >
            Lupa Password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
