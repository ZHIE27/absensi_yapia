import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ConfirmPermission = () => {
  const [izinList, setIzinList] = useState([]);

  const fetchData = async () => {
    const res = await fetch("/api/izin");
    const data = await res.json();
    const pending = data.filter((izin) => izin.status === "Menunggu Konfirmasi");
    setIzinList(pending);
  };

  const handleKonfirmasi = async (izinId, status) => {
    const res = await fetch(`/api/izin/${izinId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      toast.success(`Pengajuan berhasil ${status === "Disetujui" ? "disetujui" : "ditolak"}`);
      fetchData();
      window.dispatchEvent(new CustomEvent("presensi-update"));
    } else {
      toast.error("Gagal memproses konfirmasi.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-20 bg-yellow-200 border-4 border-black p-6 rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
      <h2 className="text-3xl font-extrabold mb-6 text-center border-4 border-black bg-white px-6 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        Konfirmasi Pengajuan Izin/Sakit
      </h2>

      <table className="w-full border-collapse border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <thead>
          <tr className="bg-white border-4 border-black">
            <th className="border-4 border-black px-4 py-3 font-bold text-black">Nama</th>
            <th className="border-4 border-black px-4 py-3 font-bold text-black">Waktu Pengajuan</th>
            <th className="border-4 border-black px-4 py-3 font-bold text-black">Alasan</th>
            <th className="border-4 border-black px-4 py-3 font-bold text-black text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {izinList.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-6 font-bold text-black">
                Tidak ada pengajuan menunggu konfirmasi.
              </td>
            </tr>
          ) : (
            izinList.map((izin) => (
              <tr key={izin.id} className="bg-white border-4 border-black">
                <td className="border-4 border-black px-4 py-3 font-semibold">{izin.nama}</td>
                <td className="border-4 border-black px-4 py-3">{new Date(izin.tanggal).toLocaleDateString()}</td>
                <td className="border-4 border-black px-4 py-3">{izin.alasan || "-"}</td>
                <td className="border-4 border-black px-4 py-3 text-center space-x-3">
                  <button
                    onClick={() => handleKonfirmasi(izin.id, "Disetujui")}
                    className="bg-green-700 text-yellow-200 font-bold px-5 py-2 rounded-none shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-green-800 transition-colors"
                  >
                    Ya
                  </button>
                  <button
                    onClick={() => handleKonfirmasi(izin.id, "Ditolak")}
                    className="bg-red-700 text-yellow-200 font-bold px-5 py-2 rounded-none shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-red-800 transition-colors"
                  >
                    Tidak
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConfirmPermission;
