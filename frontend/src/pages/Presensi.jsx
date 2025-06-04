import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShowQR from "../components/ShowQR";

const qrRegionId = "reader";

const Presensi = () => {
  const [scanning, setScanning] = useState(false);
  const [role, setRole] = useState(null);
  const html5QrCodeRef = useRef(null);
  const qrContainerRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user_data");

    if (!userData) {
      toast.error("User belum login!");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      setRole(parsedData.role);
    } catch (error) {
      console.error("Gagal parsing user_data:", error);
      toast.error("Data pengguna tidak valid.");
    }
  }, []);

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

          const userData = JSON.parse(localStorage.getItem("user_data"));

          if (!userData) {
            toast.error("Data user tidak ditemukan, silakan login kembali");
            return;
          }

          toast.success("Presensi berhasil!");

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
                totalAbsensi: userData.totalAbsensi,
                status: userData.status,
              }),
            });

            const data = await res.json();

            const timestamp = new Date().toISOString();
            const presensiData = {
              nip: userData.nip,
              nama: userData.nama,
              totalAbsensi: userData.totalAbsensi + 1,
              waktu: timestamp,
              status: "Hadir",
            };

            const existingPresensi =
              JSON.parse(localStorage.getItem("riwayat_presensi")) || [];
            const updatedPresensi = [...existingPresensi, presensiData];

            localStorage.setItem(
              "riwayat_presensi",
              JSON.stringify(updatedPresensi)
            );
            localStorage.setItem("last_presensi", JSON.stringify(presensiData));

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

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-200 text-black flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold border-4 border-black p-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-white inline-block">
          Presensi Guru & Staff
        </h1>
        <p className="text-base mt-2 font-bold">
          Arahkan kamera ke QR Code untuk presensi
        </p>
      </div>

      {role === "admin" ? (
        <div className="mt-6 w-full max-w-md ms-4 p-4">
          <ShowQR />
        </div>
      ) : (
        <>
          <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-6 w-full max-w-md space-y-4 rounded-none">
            <div
              id={qrRegionId}
              ref={qrContainerRef}
              className="w-full aspect-square bg-gray-200 border-4 h-[295px] border-black shadow-inner"
            ></div>

            <div className="flex justify-between items-center gap-4">
              <button
                onClick={startScanning}
                disabled={scanning}
                className={`w-1/2 py-3 border-4 border-black font-bold shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all duration-150 ${
                  scanning
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-400 hover:bg-green-500"
                }`}
              >
                Mulai Scan
              </button>
              <button
                onClick={stopScanning}
                disabled={!scanning}
                className={`w-1/2 py-3 border-4 border-black font-bold shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all duration-150 ${
                  !scanning
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-red-400 hover:bg-red-500"
                }`}
              >
                Stop Scan
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Presensi;
