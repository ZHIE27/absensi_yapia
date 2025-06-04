const Notifikasi = require('../models/Notifikasi');

const NotifikasiController = {
  async send(req, res) {
    try {
        const data = {
            ...req.body,
            user_id: req.user.id
          };
        await Notifikasi.send(data);
        res.json({ message: 'Notifikasi disimpan' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menyimpan notifikasi' });
    }
  },
    async getByUserId(req, res) {
        try {
        const userId = req.user.id;
        const data = await Notifikasi.getByUserId(userId);
        res.status(201).json(data);
        } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil notifikasi' });
        }
    }
};

module.exports = NotifikasiController;
