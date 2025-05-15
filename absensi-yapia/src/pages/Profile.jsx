import React from "react";

const Profile = () => {
  // Contoh data pengguna
  const user = {
    name: "Rina Suryani",
    role: "Guru",
    dob: "12 Maret 1985",
    nip: "19850312 202001 2 001",
    photoUrl: "https://i.pravatar.cc/150?img=47", // Ganti dengan foto user
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <img
            src={user.photoUrl}
            alt="Foto User"
            className="w-32 h-32 rounded-full shadow-lg border-4 border-blue-200 mb-4"
          />
          <h2 className="text-2xl font-bold text-blue-800 mb-1">{user.name}</h2>
          <p className="text-blue-600 mb-4">{user.role}</p>

          <div className="w-full border-t border-gray-200 pt-4">
            <div className="text-left space-y-2">
              <p className="text-sm text-gray-500">NIP</p>
              <p className="font-medium text-gray-800">{user.nip}</p>

              <p className="text-sm text-gray-500 mt-3">Tanggal Lahir</p>
              <p className="font-medium text-gray-800">{user.dob}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
