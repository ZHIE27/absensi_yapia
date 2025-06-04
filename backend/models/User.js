const db = require('../config/database');

const User = {
    async findByNoWa(no_wa) {
      const results = await db.query('SELECT * FROM users WHERE no_wa = ?', [no_wa]);
      return results[0];
    },
  
    async findById(id) {
      const rows = await db.query('SELECT id, nip, nama, email, no_wa, role FROM users WHERE id = ?', [id]);
      return rows[0];
    },
  
    async getDashboardData() {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'guru') AS total_guru,
          (SELECT COUNT(*) FROM users WHERE role = 'staf') AS total_staf,
          (SELECT COUNT(*) FROM users WHERE role = 'kepala_sekolah') AS total_kepala_sekolah,
          (SELECT COUNT(*) FROM presensi WHERE tanggal = CURDATE()) AS total_presensi_hari_ini
      `;
      const rows = await db.query(sql);
      return rows[0];
    },
    async create(data) {
      const sql = `INSERT INTO users (nama, nip, no_wa, email, password, role) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [data.nama, data.nip, data.no_wa, data.email, data.password, data.role];
      const result = await db.query(sql, values);
      return { id: result.insertId, ...data };
    },
    //KODE DIBAWAH DIEDIT OLEH EJI
    async update(id, data) {
      const sql = `UPDATE users SET nama = ?, no_wa = ?, email = ? WHERE id = ?`;
      const values = [data.nama, data.no_wa, data.email, id];
      await db.query(sql, values);
      return { id, ...data };
    },
    async delete(id) {
      const sql = `DELETE FROM users WHERE id = ?`;
      await db.query(sql, [id]);
      return { id };
    },

    async getKepalaSekolah() {
      const rows = await db.query(
        `SELECT * FROM users WHERE role = 'kepala_sekolah' LIMIT 1`
      );
      return rows[0]; // Ambil satu kepala sekolah
    },
    
  };
  
  module.exports = User;