const db = require('../config/database');
const moment = require('moment')

const Presensi = {
  async create(data) {
    const sql = `
      INSERT INTO presensi (
        user_id, nama_user, tanggal, hari, jam_masuk,
        created_at, latitude, longitude, distance_from_school,
        location_status, wifi_mac_address, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      data.user_id, data.nama_user, data.tanggal, data.hari, data.jam_masuk,
      data.created_at, data.latitude, data.longitude, data.distance_from_school,
      data.location_status, data.wifi_mac_address, data.status
    ]);
    return result.insertId;
  },

  async updateJamKeluar(id, jam_keluar) {
    const sql = `
      UPDATE presensi
      SET jam_keluar = ?
      WHERE id = ?
    `;
    await db.query(sql, [jam_keluar, id]);
  },
  
  async updateToHadir(id, data) {
    const sql = `
      UPDATE presensi
      SET status = 'HADIR',
          jam_masuk = ?,
          created_at = ?,
          latitude = ?,
          longitude = ?,
          distance_from_school = ?,
          location_status = ?,
          wifi_mac_address = ?
      WHERE id = ?
    `;
    await db.query(sql, [
      data.jam_masuk,
      data.created_at,
      data.latitude,
      data.longitude,
      data.distance_from_school,
      data.location_status,
      data.wifi_mac_address,
      id
    ]);
  },

  async getByRole(role) {
    const sql = `
      SELECT u.id AS user_id, u.nama, u.nip, u.no_wa, u.email, u.role,
      p.tanggal AS tanggal_terakhir,
      p.jam_masuk AS jam_masuk_terakhir,
      p.jam_keluar AS jam_keluar,
      p.location_status,
      p.status,
      (SELECT COUNT(*) FROM presensi WHERE user_id = u.id AND status = 'HADIR') AS total_absensi
      FROM users u
      LEFT JOIN presensi p ON p.id = (
        SELECT id FROM presensi 
        WHERE user_id = u.id 
        ORDER BY tanggal DESC, created_at DESC 
        LIMIT 1
      )
      WHERE u.role = ?
      GROUP BY u.id
      ORDER BY tanggal_terakhir DESC
    `;
    const results = await db.query(sql, [role]);
    return results;
  },

  async getAll() {
    const results = await db.query('SELECT * FROM presensi ORDER BY tanggal DESC');
    return results;
  },

  async getByUserId(userId, month, year) {
    const sql = `
      SELECT * FROM presensi 
      WHERE user_id = ? 
        AND MONTH(tanggal) = ? 
        AND YEAR(tanggal) = ?
      ORDER BY tanggal ASC
    `;
    const results = await db.query(sql, [userId, month, year]);
    return results;
  },

  async findByUserAndDate(user_id, tanggal) {
    const sql = `SELECT * FROM presensi WHERE user_id = ? AND tanggal = ? LIMIT 1`;
    const results = await db.query(sql, [user_id, tanggal]);
    return results.length > 0 ? results[0] : null;
  },

  async insertBelumPresensiHariIni(role) {
    const today = moment().format('YYYY-MM-DD');
    const now = moment();
    const jam00 = moment(`${today} 00:00:00`, 'YYYY-MM-DD HH:mm:ss');
  
    const sqlUsers = `SELECT id, nama FROM users WHERE role = ?`;
    const users = await db.query(sqlUsers, [role]);
  
    for (const user of users) {
      const existing = await db.query(
        `SELECT id FROM presensi WHERE user_id = ? AND tanggal = ? LIMIT 1`,
        [user.id, today]
      );
  
      if (existing.length === 0) {
        // Jika waktu sekarang sebelum jam 08:00, pakai waktu saat ini
        const jamMasuk = now.isBefore(jam00) ? now : jam00;
        const status = 'BELUM PRESENSI';
  
        await db.query(
          `INSERT INTO presensi (
            user_id, nama_user, tanggal, hari, jam_masuk, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            user.nama,
            today,
            jamMasuk.format('dddd'),
            jamMasuk.format('HH:mm:ss'),
            status,
            jamMasuk.format('YYYY-MM-DD HH:mm:ss')
          ]
        );
      }
    }
  }
  
};

module.exports = Presensi;