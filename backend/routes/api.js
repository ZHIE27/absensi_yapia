const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload')
const PresensiController = require('../controllers/PresensiController');
const NotifikasiController = require('../controllers/NotifikasiController');
const LoginController = require('../controllers/LoginController');
const PerizinanController = require('../controllers/PerizinanController');
const UserController = require('../controllers/UserController');

//login router
router.post('/login', LoginController.login);


router.get('/users', authenticate, authorize('admin'), UserController.getAll);
router.get('/users/:id', authenticate, authorize('admin'), UserController.getById);
router.post('/users', authenticate, authorize('admin'), UserController.create);
router.put('/users/:id', authenticate, authorize('admin'), UserController.update);
router.delete('/users/:id', authenticate, authorize('admin'), UserController.delete);

//presensi router
router.post('/presensi', authenticate, PresensiController.createPresensi);
router.post('/absen-keluar', authenticate, PresensiController.absenKeluar);
router.get('/presensi', authenticate, PresensiController.getAll);
router.get('/presensi/my', authenticate, PresensiController.getMyPresensi);
router.get('/presensi/role/:role', authenticate, authorize('admin', 'kepala_sekolah'), PresensiController.getByRole);
router.get('/presensi/qrcode', authenticate, authorize('admin'), PresensiController.getQRCode);

router.get('/notifikasi', authenticate, NotifikasiController.getByUserId);
router.get('/notifikasi', authenticate, NotifikasiController.send);

router.post('/perizinan',
    authenticate, authorize('guru', 'staf'),
    (req, res, next) => {
      const contentType = (req.headers['content-type'] || '').toLowerCase();
      if (contentType.includes('multipart/form-data')) {
        upload.single('bukti_sakit')(req, res, (err) => {
          if (err) {
            console.error("Upload error:", err);
            return res.status(400).json({ message: err.message });
          }
          next();
        });
      } else {
        next();
      }
    },
    PerizinanController.create
  );
router.get('/perizinan/me', authenticate, authorize('guru', 'staf'), PerizinanController.getByUserId);
router.get('/perizinan', authenticate, authorize('kepala_sekolah'), PerizinanController.getAll);
router.put('/perizinan/:id/approve', authenticate, authorize('kepala_sekolah'), PerizinanController.approve);

module.exports = router;