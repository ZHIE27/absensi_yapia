import React, { useEffect, useState } from 'react';

const UserDashboard = () => {
  const [absensi, setAbsensi] = useState([]);

  // Simulasi data absensi harian dalam sebulan
  useEffect(() => {
    const dummy = [
      { tanggal: '2025-05-01', status: 'Hadir' },
      { tanggal: '2025-05-02', status: 'Izin' },
      { tanggal: '2025-05-03', status: 'Sakit' },
      { tanggal: '2025-05-04', status: 'Tidak Hadir' },
      { tanggal: '2025-05-05', status: 'Hadir' },
      { tanggal: '2025-05-06', status: 'Hadir' },
      { tanggal: '2025-05-07', status: 'Hadir' },
      { tanggal: '2025-05-08', status: 'Hadir' },
      { tanggal: '2025-05-09', status: 'Hadir' },
      { tanggal: '2025-05-10', status: 'Hadir' },
    ];
    setAbsensi(dummy);
  }, []);

  const getColor = (status) => {
    switch (status) {
      case 'Hadir':
        return 'bg-lime-400';
      case 'Izin':
        return 'bg-yellow-300';
      case 'Sakit':
        return 'bg-orange-400';
      case 'Tidak Hadir':
        return 'bg-red-400';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#fefefe] font-mono">
      <h1 className="text-3xl font-black border-4 border-black bg-yellow-300 inline-block px-4 py-2 shadow-[4px_4px_0px_0px_#000]">
        Dashboard Absensi
      </h1>

      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {absensi.map((data, index) => (
            <div
              key={index}
              className={`p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] ${getColor(data.status)} transition-all`}
            >
              <p className="text-sm text-black font-bold">Tanggal:</p>
              <p className="text-lg font-extrabold">{new Date(data.tanggal).toLocaleDateString('id-ID')}</p>
              <p className="mt-2 text-black font-semibold uppercase">{data.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
