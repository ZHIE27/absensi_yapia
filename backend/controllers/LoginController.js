const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const LoginController = {
  async login(req, res) {
    const { no_wa, password } = req.body;
    try {
      const user = await User.findByNoWa(no_wa);
      if (!user) {
        return res.status(401).json({ message: 'Nomor Wa tidak ditemukan' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Password salah' });
      }


      const token = jwt.sign({ id: user.id, role: user.role, nama: user.nama }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({ token, user });
    } catch (err) {
      res.status(500).json({ message: 'Kesalahan server', error: err });
    }
  }
}

module.exports = LoginController;