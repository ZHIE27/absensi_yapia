const Perizinan = require('../models/Perizinan');
const { sendApprovalEmail } = require("../utils/mailer");
const { sendNewPerizinanNotificationToKepsek } = require("../utils/mailer")
const User = require("../models/User")

const PerizinanController = {
  async getAll(req, res) {
    try {
      const izinList = await Perizinan.getAll();
      res.status(200).json(izinList);
    } catch (err) {
      res.status(500).json({ message: 'Gagal mengambil data perizinan' });
    }
  },

  async getByUserId(req, res) {
    try {
      const userId = req.user.id;
      const data = await Perizinan.getByUserId(userId);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil data perizinan user', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { tanggal, jenis, keterangan } = req.body;
      const userId = req.user.id;
      let buktiSakit = null;

      if (jenis === 'sakit') {
        if (!req.file) {
          return res.status(400).json({ message: 'Surat sakit wajib diunggah!' });
        }
        buktiSakit = req.file.filename;
      }

      const izinDate = new Date(tanggal);
      const month = izinDate.getMonth() + 1;
      const year = izinDate.getFullYear();

      const izinCount = await Perizinan.countPerizinanInMonth(userId, month, year);
      console.log(`[CEK LIMIT] User ${userId} sudah izin ${izinCount}x di bulan ${month}-${year}`);

      if (izinCount >= 3) {
        return res.status(400).json({ message: 'Maaf, maksimal 3 kali izin dalam 1 bulan.' });
      }

      const data = {
        tanggal,
        jenis,
        keterangan,
        user_id: userId,
        bukti_sakit: buktiSakit,
      };

      console.log("[CREATE] Data yg disimpan ke DB:", data);
      const insertId = await Perizinan.create(data);

      const detailPerizinan = await Perizinan.getUserByPerizinanId(insertId);
      const kepalaSekolah = await User.getKepalaSekolah();

      if (kepalaSekolah && kepalaSekolah.email && detailPerizinan) {
        try {
          await sendNewPerizinanNotificationToKepsek(
            kepalaSekolah.email,
            detailPerizinan.nama,      // nama guru yang izin
            detailPerizinan.tanggal,
            detailPerizinan.jenis
          );
          console.log("✅ Email ke kepala sekolah dikirim.");
        } catch (err) {
          console.error("❌ Gagal kirim email ke kepala sekolah:", err);
        }
      }


      res.status(201).json({ message: 'Pengajuan berhasil!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengajukan izin.' });
    }
  },

  async approve(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['disetujui', 'ditolak'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    try {
      const affectedRows = await Perizinan.updateStatus(id, status);

      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Perizinan tidak ditemukan' });
      }

      const info = await Perizinan.getUserByPerizinanId(id);
      if (info) {
        await sendApprovalEmail(info.email, info.nama, status, info.tanggal, info.jenis);
      }

      res.status(200).json({ message: `Perizinan berhasil di${status}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal memperbarui status perizinan' });
    }
  }
};

module.exports = PerizinanController;
