import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const qrRegionId = "reader";
const SCHOOL_COORDINATES = {
  lat: -6.4091892706737985,
  lng: 106.69225348988748,
};
const LOCATION_THRESHOLD_METERS = 100;

const Presensi = () => {
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const qrContainerRef = useRef(null);

  const checkLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation tidak didukung");
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const distance = getDistanceFromLatLonInMeters(
            latitude,
            longitude,
            SCHOOL_COORDINATES.lat,
            SCHOOL_COORDINATES.lng
          );
          if (distance <= LOCATION_THRESHOLD_METERS) {
            resolve(true);
          } else {
            reject("Lokasi Anda tidak sesuai dengan lokasi sekolah.");
          }
        },
        () => reject("Gagal mendapatkan lokasi.")
      );
    });
  };

  const startScanning = async () => {
    try {
      // await checkLocation();

      const containerWidth = qrContainerRef.current.offsetWidth;
      const config = {
        fps: 10,
        qrbox: { width: containerWidth * 0.8, height: containerWidth * 0.8 }, // Ukuran kamera responsif
      };

      html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          html5QrCodeRef.current.stop();
          setScanning(false);
          toast.success(`Presensi berhasil: ${decodedText}`);
        },
        (err) => console.warn(err)
      );
      setScanning(true);
    } catch (error) {
      toast.error("Izinkan kamera dan lokasi untuk melakukan presensi!");
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

  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371000;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

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
    </div>
  );
};

export default Presensi;
