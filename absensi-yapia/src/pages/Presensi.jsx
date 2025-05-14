import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// -6.4091892706737985, 106.69225348988748

const qrRegionId = "reader";
const SCHOOL_COORDINATES = {
  lat: -6.4091892706737985, // Ganti dengan koordinat sekolah
  lng: 106.69225348988748,
};
const LOCATION_THRESHOLD_METERS = 100;

const Presensi = () => {
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

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

      const config = { fps: 10, qrbox: 250 };
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
      toast.error(error);
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

  // Hitung jarak lokasi (Haversine formula)
  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371000; // Radius of the earth in meters
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-blue-800">Presensi Guru & Staff</h1>
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md">
        <div id={qrRegionId} className="w-full aspect-square bg-gray-200 rounded-md mb-4"></div>
        <div className="flex justify-between">
          <button
            onClick={startScanning}
            disabled={scanning}
            className={`px-4 py-2 rounded-md text-white ${
              scanning ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Mulai Scan
          </button>
          <button
            onClick={stopScanning}
            disabled={!scanning}
            className={`px-4 py-2 rounded-md text-white ${
              !scanning ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Stop Scan
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Presensi;
