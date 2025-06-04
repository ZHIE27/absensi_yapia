const db = require('../config/database');

const Notifikasi = {
  async send(data) {
    const sql = `
      INSERT INTO notifikasi (presensi_id, jenis, isi_pesan, status)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(sql, [data.presensi_id, data.jenis, data.isi_pesan, data.status || 'terkirim']);
  }, 
  async getByUserId(userId) {
    const sql = `SELECT * FROM notifikasi WHERE user_id = ? ORDER BY created_at DESC`;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }
};

module.exports = Notifikasi;