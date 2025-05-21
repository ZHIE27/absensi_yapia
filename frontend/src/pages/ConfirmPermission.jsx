import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ConfirmPermission = () => {
  const [izinList, setIzinList] = useState([]);

  const fetchData = async () => {
    const res = await fetch("/api/izin");
    const data = await res.json();
    // Filter hanya yang belum dikonfirmasi
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
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Konfirmasi Pengajuan Izin/Sakit</h2>
      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Nama</th>
            <th className="border px-3 py-2">Waktu Pengajuan</th>
            <th className="border px-3 py-2">Alasan</th>
            <th className="border px-3 py-2 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {izinList.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4">
                Tidak ada pengajuan menunggu konfirmasi.
              </td>
            </tr>
          ) : (
            izinList.map((izin) => (
              <tr key={izin.id}>
                <td className="border px-3 py-2">{izin.nama}</td>
                <td className="border px-3 py-2">{new Date(izin.tanggal).toLocaleDateString()}</td>
                <td className="border px-3 py-2">{izin.alasan}</td>
                <td className="border px-3 py-2 text-center space-x-2">
                  <button
                    onClick={() => handleKonfirmasi(izin.id, "Disetujui")}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Ya
                  </button>
                  <button
                    onClick={() => handleKonfirmasi(izin.id, "Ditolak")}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
