const User = require('../models/User');
const bcrypt = require('bcrypt')

const UserController = {
  async getAll(req, res) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error getting users', error });
    }
  },

  async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error getting user', error });
    }
  },

  async create(req, res) {
    try {
        const { nama, nip, no_wa, email, password, role } = req.body;
    
        // Validasi role agar hanya 'guru' atau 'staf' yang bisa dibuat
        const allowedRoles = ['guru', 'staf'];
        if (!allowedRoles.includes(role)) {
          return res.status(400).json({ message: 'Role tidak valid' });
        }
    
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ 
            nama, 
            nip, 
            no_wa, 
            email, 
            password: hashedPassword, 
            role 
        });
        res.status(201).json({ message: 'User berhasil ditambahkan', data: newUser });
      } catch (error) {
        console.error('Gagal membuat user:', error);
        res.status(500).json({ message: 'Gagal menambahkan user', error: error.message });
      }
  },

  async update(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const updatedUser = await User.update(req.params.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  },

  async delete(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      await User.delete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }
};

module.exports = UserController;