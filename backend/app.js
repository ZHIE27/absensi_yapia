const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const cors = require('cors');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Izinkan CORS sebelum semua route
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // jika kamu pakai cookie/session
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// ✅ Pastikan CORS sudah aktif sebelum ini
app.use('/api', apiRoutes);
app.use('/uploads', express.static('uploads'));


app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
