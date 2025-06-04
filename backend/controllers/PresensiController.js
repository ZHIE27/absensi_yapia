const Presensi = require('../models/Presensi');
const Perizinan = require('../models/Perizinan');
const { sendPresensiEmail } = require('../utils/mailer');
const User = require('../models/User');
const qr = require('qrcode');
const moment = require('moment');

const PresensiController = {
  async createPresensi(req, res) {
    try {
      const user = req.user;
      const now = moment();
      const tanggal = now.format('YYYY-MM-DD');
  
      const existing = await Presensi.findByUserAndDate(user.id, tanggal);
  
      if (existing) {
        if (existing.status === 'BELUM PRESENSI') {
          // Update menjadi HADIR
          await Presensi.updateToHadir(existing.id, {
            jam_masuk: now.format('HH:mm:ss'),
            created_at: now.format('YYYY-MM-DD HH:mm:ss'),
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            distance_from_school: req.body.distance_from_school,
            location_status: req.body.location_status,
            wifi_mac_address: req.body.wifi_mac_address,
          });
  
          const fullUser = await User.findById(user.id);
          if (fullUser && fullUser.email) {
            try {
              await sendPresensiEmail(fullUser.email, fullUser.nama, tanggal, now.format('HH:mm:ss'));
            } catch (err) {
              console.error('❌ Gagal kirim email presensi:', err);
            }
          }
  
          return res.status(200).json({ message: 'Presensi diperbarui menjadi HADIR' });
        }
  
        return res.status(400).json({ message: 'Anda sudah presensi hari ini' });
      }
  
      // Insert baru jika belum ada presensi sama sekali
      const data = {
        user_id: user.id,
        nama_user: user.nama,
        tanggal,
        hari: now.format('dddd'),
        jam_masuk: now.format('HH:mm:ss'),
        created_at: now.format('YYYY-MM-DD HH:mm:ss'),
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        distance_from_school: req.body.distance_from_school,
        location_status: req.body.location_status,
        wifi_mac_address: req.body.wifi_mac_address,
        status: 'HADIR'
      };
  
      const presensiId = await Presensi.create(data);
  
      const fullUser = await User.findById(user.id);
      if (fullUser && fullUser.email) {
        try {
          await sendPresensiEmail(fullUser.email, fullUser.nama, tanggal, data.jam_masuk);
        } catch (err) {
          console.error('❌ Gagal kirim email presensi:', err);
        }
      }
  
      res.status(201).json({ message: 'Presensi berhasil', presensi_id: presensiId });
    } catch (err) {
      console.error('❌ Gagal create presensi:', err);
      res.status(500).json({ message: 'Gagal presensi', error: err.message });
    }
  },

  async absenKeluar(req, res) {
    try {
      const user = req.user;
      const now = moment();
      const tanggal = now.format('YYYY-MM-DD');
      const jamKeluar = now.format('HH:mm:ss');
  
      const existing = await Presensi.findByUserAndDate(user.id, tanggal);
  
      if (!existing) {
        return res.status(400).json({ message: 'Anda belum absen masuk hari ini.' });
      }
  
      if (existing.jam_keluar) {
        return res.status(400).json({ message: 'Anda sudah absen keluar hari ini.' });
      }
  
      await Presensi.updateJamKeluar(existing.id, jamKeluar);
  
      res.status(200).json({ message: 'Berhasil absen keluar', jam_keluar: jamKeluar });
    } catch (err) {
      console.error('❌ Gagal absen keluar:', err);
      res.status(500).json({ message: 'Gagal absen keluar', error: err.message });
    }
  },
  

  async getAll(req, res) {
    try {
      const data = await Presensi.getAll();
      res.status(200).json({ data });
    } catch (err) {
      res.status(500).json({ message: 'Gagal mengambil data presensi', error: err.message });
    }
  },

  async getQRCode(req, res) {
    const today = moment().format('YYYY-MM-DD');
    const url = `${process.env.FRONTEND_URL}/presensi/scan?date=${today}`;

    try {
      const qrCode = await qr.toDataURL(url);
      res.status(200).json({ qr: qrCode, date: today });
    } catch (err) {
      res.status(500).json({ message: 'Gagal membuat QR Code', error: err.message });
    }
  },

  async getByRole(req, res) {
    try {
      // const role = req.query.role || 'guru';
      const role = req.params.role || 'guru';
      await Presensi.insertBelumPresensiHariIni(role);
      let data = await Presensi.getByRole(role);
      const perizinanData = await Perizinan.getAll();
      const today = moment().format('YYYY-MM-DD');
  
      data = data.map(item => {
        const isPresensiToday = moment(item.tanggal_terakhir).format('YYYY-MM-DD') === today;
        const izinHariIni = perizinanData.find(
          izin =>
            izin.user_id === item.user_id &&
            moment(izin.tanggal).format('YYYY-MM-DD') === today &&
            izin.status_approval === 'disetujui'
        );
  
        let status;
        if (izinHariIni) {
          status = izinHariIni.jenis.toUpperCase(); // e.g., 'IZIN' or 'SAKIT'
        } else if (isPresensiToday) {
          status = item.status === 'BELUM PRESENSI' ? 'BELUM PRESENSI' : 'HADIR';
        } else {
          status = 'TIDAK HADIR';
        }
  
        return {
          id: item.user_id,
          nama: item.nama,
          nip: item.nip,
          jam_masuk: item.jam_masuk_terakhir,
          jam_keluar: item.jam_keluar,
          tanggal: item.tanggal_terakhir,
          location_status: item.location_status,
          total_absensi: item.total_absensi,
          no_wa: item.no_wa,
          email: item.email,
          status
        };
      });
  
      res.status(200).json({ data });
    } catch (err) {
      res.status(500).json({ message: 'Gagal mengambil data presensi per role', error: err.message });
    }
  },

  async getMyPresensi(req, res) {
    try {
      const userId = req.user.id;
      const month = req.query.month || moment().format('MM');
      const year = req.query.year || moment().format('YYYY');
  
      const presensiData = await Presensi.getByUserId(userId, month, year);
      const perizinanData = await Perizinan.getByUserId(userId);
      const izinDisetujui = perizinanData.filter(i => i.status_approval === 'disetujui');
  
      const dataMap = {};
  
      presensiData.forEach(p => {
        const tanggalFormatted = moment(p.tanggal).format('YYYY-MM-DD');
        dataMap[tanggalFormatted] = {
          tanggal: tanggalFormatted,
          status: p.status || 'HADIR',
          jam_masuk: p.jam_masuk || null,
          jam_keluar: p.jam_keluar || null
        };
      });
  
      izinDisetujui.forEach(i => {
        const tanggalFormatted = moment(i.tanggal).format('YYYY-MM-DD');
        const status = i.jenis.toUpperCase();
        dataMap[tanggalFormatted] = {
          tanggal: tanggalFormatted,
          status,
          jam_masuk: null,
          jam_keluar: null
        };
      });
  
      const daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
      const finalData = [];
      const today = moment().format('YYYY-MM-DD');
  
      for (let day = 1; day <= daysInMonth; day++) {
        const paddedDay = String(day).padStart(2, '0');
        const date = `${year}-${month}-${paddedDay}`;
  
        if (dataMap[date]) {
          finalData.push(dataMap[date]);
        } else if (moment(date).isBefore(today)) {
          finalData.push({
            tanggal: date,
            status: 'TIDAK HADIR',
            jam_masuk: null,
            jam_keluar: null
          });
        } else {
          finalData.push({
            tanggal: date,
            status: 'BELUM PRESENSI',
            jam_masuk: null,
            jam_keluar: null
          });
        }
      }
  
      res.status(200).json({ data: finalData });
    } catch (err) {
      console.error('❌ Gagal getMyPresensi:', err);
      res.status(500).json({ message: 'Gagal mengambil data daftar hadir', error: err.message });
    }
  }
  
  
  
};

module.exports = PresensiController;