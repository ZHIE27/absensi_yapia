const nodemailer = require("nodemailer");
require ('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // email pengirim
    pass: process.env.EMAIL_PASS, // password atau app password
  },
});

const sendApprovalEmail = async (to, nama, status, tanggal, jenis) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Status Pengajuan ${jenis} Anda`,
    html: `
      <p>Yth. ${nama},</p>
      <p>Pengajuan ${jenis} Anda untuk tanggal <b>${tanggal}</b> telah <b>${status}</b> oleh Kepala Sekolah.</p>
      <p>Terima kasih.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPresensiEmail = async (to, nama, tanggal, jamMasuk) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Presensi Berhasil',
      html: `
        <p>Halo ${nama},</p>
        <p>Presensi Anda pada tanggal <b>${tanggal}</b> jam <b>${jamMasuk}</b> berhasil dicatat.</p>
        <p>Terima kasih telah melakukan presensi tepat waktu.</p>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  };

  const sendNewPerizinanNotificationToKepsek = async (to, nama, created_at, jenis) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Pengajuan ${jenis} baru dari ${nama}`,
      html: `
        <p>Yth. Kepala Sekolah,</p>
        <p>Guru atas nama <b>${nama}</b> telah mengajukan <b>${jenis}</b> untuk tanggal <b>${created_at}</b>.</p>
        <p>Silakan cek dan verifikasi pengajuan tersebut melalui sistem.</p>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  };

module.exports = { sendApprovalEmail, sendPresensiEmail, sendNewPerizinanNotificationToKepsek };
