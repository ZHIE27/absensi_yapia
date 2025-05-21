import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShowQR from "../components/ShowQR";

const qrRegionId = "reader";

const Presensi = () => {
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const qrContainerRef = useRef(null);

  const startScanning = async () => {
    try {
      const containerWidth = qrContainerRef.current.offsetWidth;
      const config = {
        fps: 10,
        qrbox: { width: containerWidth * 0.8, height: containerWidth * 0.8 },
      };

      html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        async () => { 
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
          setScanning(false);

          // Ambil data user dari localStorage
          const userData = JSON.parse(localStorage.getItem("user_data"));
          
          if (!userData) {
            toast.error("Data user tidak ditemukan, silakan login kembali");
            return;
          }

          toast.success("Presensi berhasil!");

          // Kirim ke backend
          try {
            const res = await fetch("/api/presensi", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                nip: userData.nip,
                nama: userData.nama,
                noWa: userData.noWa,
                totalAbsensi : userData.totalAbsensi,
                status : userData.status
              }),
            }
          );
            console.log(userData)
            const data = await res.json();

            // Simpan data presensi ke localStorage
            const timestamp = new Date().toISOString();
            const presensiData = {
              nip: userData.nip,
              nama: userData.nama,
              totalAbsensi : userData.totalHadir + 1,
              waktu: timestamp,
              status: "Hadir"
            };

            // Simpan riwayat presensi (array)
            const existingPresensi = JSON.parse(localStorage.getItem("riwayat_presensi")) || [];
            const updatedPresensi = [...existingPresensi, presensiData];
            
            localStorage.setItem("riwayat_presensi", JSON.stringify(updatedPresensi));
            localStorage.setItem("last_presensi", JSON.stringify(presensiData));

            // Trigger event untuk update dashboard
            window.dispatchEvent(new CustomEvent("presensi-update"));

            if (data.success) {
              toast.success("Notifikasi WhatsApp dikirim!");
            } else {
              toast.warn("Presensi berhasil, tapi WhatsApp gagal dikirim.");
            }
          } catch (error) {
            toast.error("Gagal terhubung ke server.");
          }
        },
        (err) => console.warn("Scan error:", err)
      );

      setScanning(true);
    } catch (error) {
      toast.error(error.message || "Gagal memulai scanner.");
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        setScanning(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-blue-800 drop-shadow-md">
          Presensi Guru & Staff
        </h1>
        <p className="text-sm text-blue-700 mt-2">
          Silakan arahkan kamera ke QR Code untuk melakukan presensi
        </p>
      </div>

      <div className="bg-white shadow-2xl rounded-xl p-6 w-full max-w-md space-y-4">
        <div
          id={qrRegionId}
          ref={qrContainerRef}
          className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden"
        ></div>

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={startScanning}
            disabled={scanning}
            className={`w-1/2 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
              scanning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Mulai Scan
          </button>
          <button
            onClick={stopScanning}
            disabled={!scanning}
            className={`w-1/2 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
              !scanning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Stop Scan
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
      <div className="mt-5">
        <ShowQR/> 
      </div>
    </div>
  );
};

export default Presensi;