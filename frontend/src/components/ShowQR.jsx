import React from "react";
import { QRCode } from "react-qrcode-logo";

const ShowQR = () => {
  const today = new Date().toISOString().slice(0, 10); // format "YYYY-MM-DD"
  const qrContent = `PRESENSI-${today}`;

  return (
    <div className="bg-white shadow-xl p-6 rounded-xl w-full max-w-sm text-center">
      <h2 className="text-xl font-bold text-blue-800 mb-4">QR Presensi Hari Ini</h2>
      <QRCode
        value={qrContent}
        size={256}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        eyeRadius={5}
      />
      <p className="text-sm text-gray-600 mt-4">
        Scan QR ini dengan aplikasi presensi hari ini
      </p>
    </div>
  );
};

export default ShowQR;
