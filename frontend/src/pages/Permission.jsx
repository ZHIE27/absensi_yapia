import React, { useState } from "react";
import { toast } from "react-toastify";

const IzinForm = () => {
  const [tipe, setTipe] = useState("");
  const [alasan, setAlasan] = useState("");
  const [buktiFoto, setBuktiFoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user_data"));
    if (!user) return toast.error("Silakan login terlebih dahulu!");

    const tanggal = new Date().toISOString(); // otomatis tanggal saat ini

    const formData = new FormData();
    formData.append("nip", user.nip);
    formData.append("nama", user.nama);
    formData.append("tanggal", tanggal); // otomatis
    formData.append("tipe", tipe);
    formData.append("status", "Menunggu Konfirmasi");

    if (tipe === "izin") {
      formData.append("alasan", alasan);
    } else if (tipe === "sakit") {
      if (!buktiFoto) return toast.error("Silakan unggah surat sakit!");
      formData.append("buktiFoto", buktiFoto);
    }

    const res = await fetch("/api/izin", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      toast.success("Pengajuan dikirim!");
      setTipe("");
      setAlasan("");
      setBuktiFoto(null);
    } else {
      toast.error("Gagal mengirim pengajuan.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Form Pengajuan Izin / Sakit</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="w-full border px-3 py-2 rounded"
          value={tipe}
          onChange={(e) => setTipe(e.target.value)}
          required
        >
          <option value="">Pilih Jenis Pengajuan</option>
          <option value="izin">Izin</option>
          <option value="sakit">Sakit</option>
        </select>

        {tipe === "izin" && (
          <textarea
            placeholder="Alasan izin..."
            className="w-full border px-3 py-2 rounded"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            required
          ></textarea>
        )}

        {tipe === "sakit" && (
          <div>
            <label className="block mb-1">Upload Surat Sakit (jpg, png, pdf)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="w-full border px-3 py-2 rounded"
              onChange={(e) => setBuktiFoto(e.target.files[0])}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Kirim Pengajuan
        </button>
      </form>
    </div>
  );
};

export default IzinForm;
