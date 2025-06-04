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
    <div className="max-w-md mx-auto mt-30 bg-yellow-200 border-4 border-black p-6 rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-extrabold mb-6 border-4 border-black px-4 py-2 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        Form Pengajuan Izin / Sakit
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <select
          className="w-full border-4 border-black px-3 py-2 rounded-none bg-white font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
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
            className="w-full border-4 border-black px-3 py-2 rounded-none bg-white font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            required
          ></textarea>
        )}

        {tipe === "sakit" && (
          <div>
            <label className="block mb-2 font-bold text-black tracking-wide">
              Upload Surat Sakit (jpg, png, pdf)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="w-full border-4 border-black px-3 py-2 rounded-none bg-white font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              onChange={(e) => setBuktiFoto(e.target.files[0])}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full hover:bg-black bg-yellow-300 font-extrabold px-4 py-3 rounded-none shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:text-yellow-300 transition-colors duration-200"
        >
          Kirim Pengajuan
        </button>
      </form>
    </div>
  );
};

export default IzinForm;
