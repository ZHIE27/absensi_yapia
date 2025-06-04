-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 04 Jun 2025 pada 15.42
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_presensi_guru`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `laporan`
--

CREATE TABLE `laporan` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `bulan` tinyint(4) NOT NULL,
  `tahun` year(4) NOT NULL,
  `file_pdf` varchar(255) DEFAULT NULL,
  `file_excel` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id` int(11) NOT NULL,
  `presensi_id` int(11) NOT NULL,
  `jenis` enum('presensi','laporan') NOT NULL,
  `isi_pesan` text NOT NULL,
  `status` enum('terkirim','gagal') DEFAULT 'terkirim',
  `waktu_kirim` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `perizinan`
--

CREATE TABLE `perizinan` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `jenis` enum('izin','sakit') NOT NULL,
  `keterangan` text DEFAULT NULL,
  `bukti_sakit` varchar(255) DEFAULT NULL,
  `status_approval` enum('pending','disetujui','ditolak') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `perizinan`
--

INSERT INTO `perizinan` (`id`, `user_id`, `tanggal`, `jenis`, `keterangan`, `bukti_sakit`, `status_approval`, `created_at`) VALUES
(1, 2, '2025-05-29', 'izin', 'Ada urusan keluarga', NULL, 'disetujui', '2025-05-28 17:45:31'),
(2, 13, '2025-05-29', 'izin', 'malas', NULL, 'disetujui', '2025-05-29 03:59:06'),
(9, 13, '2025-05-30', 'izin', 'malas', NULL, 'disetujui', '2025-05-29 04:42:32'),
(20, 13, '2025-05-31', 'izin', 'malas', NULL, 'disetujui', '2025-05-29 05:37:44'),
(22, 2, '2025-05-30', 'izin', 'malas', NULL, 'disetujui', '2025-05-29 05:42:31'),
(32, 2, '2025-05-31', 'izin', 'as', NULL, 'pending', '2025-05-30 16:37:26'),
(36, 2, '2025-06-04', 'izin', 'asu', NULL, 'pending', '2025-05-30 16:38:22'),
(41, 54, '2025-06-05', 'izin', 'malas', NULL, 'disetujui', '2025-06-04 13:23:21'),
(42, 54, '2025-06-06', 'sakit', '-', 'bukti_sakit-1749043493938-349304650.png', 'disetujui', '2025-06-04 13:24:53'),
(43, 54, '2025-06-14', 'izin', 'ass', NULL, 'pending', '2025-06-04 13:28:28');

-- --------------------------------------------------------

--
-- Struktur dari tabel `presensi`
--

CREATE TABLE `presensi` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nama_user` varchar(100) NOT NULL,
  `tanggal` date NOT NULL,
  `hari` varchar(10) NOT NULL,
  `jam_masuk` time NOT NULL,
  `jam_keluar` time DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `distance_from_school` float NOT NULL,
  `location_status` enum('valid','invalid') NOT NULL,
  `wifi_mac_address` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'BELUM PRESENSI'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `presensi`
--

INSERT INTO `presensi` (`id`, `user_id`, `nama_user`, `tanggal`, `hari`, `jam_masuk`, `jam_keluar`, `created_at`, `latitude`, `longitude`, `distance_from_school`, `location_status`, `wifi_mac_address`, `status`) VALUES
(1, 2, 'Guru Satu', '2025-05-21', 'Rabu', '07:02:00', NULL, '2025-05-21 07:02:00', -6.20000000, 106.81666667, 0.05, 'valid', '00:11:22:33:44:55', 'HADIR'),
(2, 2, 'Guru Satu', '2025-05-28', 'Wednesday', '21:47:47', NULL, '2025-05-28 21:47:47', -6.43019560, 106.70431060, 28449.6, 'valid', '00:11:22:33:44:55', 'HADIR'),
(11, 2, 'Guru Satu', '2025-05-29', 'Thursday', '00:09:35', NULL, '2025-05-29 00:09:35', -6.43019560, 106.70431060, 28449.6, 'valid', '00:11:22:33:44:55', 'HADIR'),
(12, 13, 'bayu', '2025-05-29', 'Thursday', '09:21:48', NULL, '2025-05-29 09:21:48', -6.20625920, 106.83023360, 1653.44, 'valid', '00:11:22:33:44:55', 'HADIR'),
(13, 17, 'Fahrezi', '2025-05-30', 'Friday', '01:14:34', NULL, '2025-05-30 01:14:34', -6.19444910, 106.82291980, 926.77, 'valid', '00:11:22:33:44:55', 'HADIR'),
(19, 2, 'Guru Satu', '2025-05-30', 'Friday', '00:00:00', NULL, '2025-05-30 23:55:23', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(20, 3, 'Staf TU', '2025-05-30', 'Friday', '00:00:00', NULL, '2025-05-30 23:55:23', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(21, 5, 'eji', '2025-05-30', 'Friday', '00:00:00', NULL, '2025-05-30 23:55:23', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(22, 29, 'nan', '2025-05-30', 'Friday', '00:00:00', NULL, '2025-05-30 23:55:23', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(24, 13, 'bayu', '2025-05-30', 'Friday', '00:00:00', NULL, '2025-05-30 23:55:23', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(25, 27, 'bagus', '2025-05-30', 'Friday', '00:00:00', NULL, '2025-05-30 23:55:23', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(26, 28, 'bagas', '2025-05-30', 'Friday', '00:00:00', NULL, '2025-05-30 23:55:23', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(27, 2, 'Guru Satu', '2025-05-31', 'Saturday', '00:00:00', NULL, '2025-05-31 00:05:06', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(28, 5, 'eji', '2025-05-31', 'Saturday', '00:00:00', NULL, '2025-05-31 00:05:06', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(30, 13, 'bayu', '2025-05-31', 'Saturday', '00:00:00', NULL, '2025-05-31 00:05:06', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(31, 17, 'Fahrezi', '2025-05-31', 'Saturday', '00:00:00', NULL, '2025-05-31 00:05:06', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(33, 27, 'bagus', '2025-05-31', 'Saturday', '00:00:00', NULL, '2025-05-31 00:05:06', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(34, 28, 'bagas', '2025-05-31', 'Saturday', '00:00:00', NULL, '2025-05-31 00:05:06', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(36, 3, 'Staf TU', '2025-05-31', 'Saturday', '00:00:00', NULL, '2025-05-31 00:06:44', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(37, 29, 'nan', '2025-05-31', 'Saturday', '00:00:00', NULL, '2025-05-31 00:06:44', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(41, 34, 'dwdakn', '2025-05-31', 'Saturday', '08:00:00', NULL, '2025-05-31 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(44, 37, 'kheril', '2025-05-31', 'Saturday', '01:08:46', NULL, '2025-05-31 01:08:46', -6.20625920, 106.83023360, 27363.5, 'valid', '60:14:B3:D3:CD:C5', 'HADIR'),
(45, 38, 'eji', '2025-05-31', 'Saturday', '08:00:00', NULL, '2025-05-31 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(51, 2, 'Guru Satu', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(52, 3, 'Staf TU', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(53, 5, 'eji', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(54, 29, 'nan', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(55, 13, 'bayu', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(56, 17, 'Fahrezi', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(57, 27, 'bagus', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(58, 28, 'bagas', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(59, 34, 'dwdakn', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(60, 37, 'kheril', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(61, 38, 'eji', '2025-06-04', 'Wednesday', '08:00:00', NULL, '2025-06-04 08:00:00', 0.00000000, 0.00000000, 0, 'valid', NULL, 'BELUM PRESENSI'),
(62, 54, 'Alwi', '2025-06-04', 'Wednesday', '20:21:52', '20:41:03', '2025-06-04 20:21:52', -6.20625920, 106.83023360, 27363.5, 'valid', '60:14:B3:D3:CD:C5', 'HADIR');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nip` varchar(20) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `no_wa` varchar(20) NOT NULL,
  `role` enum('admin','guru','staf','kepala_sekolah') DEFAULT 'guru',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `nip`, `nama`, `email`, `password`, `no_wa`, `role`, `created_at`, `updated_at`) VALUES
(1, '10000001', 'Admin Utama', 'admin@example.com', '$2b$10$1fOkCkJ2Jd.7c/ahzx0WuukBy0knJt6dOvOQc8MwTYVWtNzGRi2f6', '081234567001', 'admin', '2025-05-20 16:35:27', '2025-05-20 17:22:17'),
(2, '10000002', 'Guru Satu', 'guru@example.com', '$2b$10$wFR9kywW7.Epwi4BoAqlheYOD5He5WOufF5XCDhMlSXSPPHNrBzSe', '081234567002', 'guru', '2025-05-20 16:35:27', '2025-05-20 17:22:58'),
(3, '10000003', 'Staf TU', 'staf@example.com', '$2b$10$gywH8k9zPtlA.X/GoNR9VuyaZMs2Cno3lcgBQhUexpQ1Zmlj8QD8y', '081234567003', 'staf', '2025-05-20 16:35:27', '2025-05-20 17:23:47'),
(4, '10000004', 'Ibu Kepala', 'kepsek@example.com', '$2b$10$aMKH8kbfCY88.e5seT9rTuTARv2G53XONkpXpivpLTfoBOdP.rWSe', '081234567004', 'kepala_sekolah', '2025-05-20 16:35:27', '2025-05-20 17:24:28'),
(5, '1213123', 'eji', 'anjay@gmail.com', '123', '090', 'guru', '2025-05-27 17:44:26', '2025-05-27 17:44:26'),
(13, '21011', 'bayu', 'rus@gmail.com', '$2b$10$on6UOtUySPnPsMmIcPJJAOVUwwHPEpmmnamHxcgMf1KZ2bJc5ouJe', '0895192354092', 'guru', '2025-05-29 02:20:46', '2025-05-29 02:20:46'),
(17, '122446', 'Fahrezi', 'cuyanjaymabar5@gmail.com', '$2b$10$wqWVCIpX.N4fDNPzy64eBOEoI/YIA12ovDeGLlhtTVhfgcDGyGqYm', '082255', 'guru', '2025-05-29 18:13:27', '2025-05-29 18:13:27'),
(27, '132', 'bagus', 'asdas@gmail.com', '$2b$10$RSHywZvNipRYFpuNSxSUmujOvZ866Et0taAEDlUBUflsxu497bDRK', '0899', 'guru', '2025-05-30 02:41:22', '2025-05-30 02:41:22'),
(28, '98279', 'bagas', 'asdasl@gmail.com', '$2b$10$eOo2JzZR.PIm4DEAMwaSDe3EFGSA36rStdP4QzMr/8jYaHpm1NhCe', '9339', 'guru', '2025-05-30 02:41:45', '2025-05-30 02:41:45'),
(29, '767', 'nan', 'nan@gmail.com', '$2b$10$wLb.G1e9t2ftiwMxc7pynuvgmd1uuukCvP3b5a8lIrUmvCmT9BADm', '989', 'staf', '2025-05-30 02:47:25', '2025-05-30 02:47:25'),
(34, '1728628', 'dwdakn', 'hskh@gmail.com', '$2b$10$RhAw.ub8JOlTlSC.6QIFHOwT.uVq7ED1VTnTOeyNELLcqVMaTSZJO', '0922727', 'guru', '2025-05-30 17:46:04', '2025-05-30 17:46:04'),
(37, '1723635', 'kheril', 'januarkherilirli@gmail.com', '$2b$10$ndtPfXvdn14SkHc4mePl0uLSb2pFMeEqlv/VgCWyNh/VEypnpLLUW', '0827363', 'guru', '2025-05-30 17:59:19', '2025-05-30 17:59:19'),
(38, '121', 'eji', 'era@gmail.com', '$2b$10$sUgLrrt1DdS/634MR26K0uZLY7IMYfbKMkB/B/wWj2jPNFD.lnKBC', '090', 'guru', '2025-05-30 18:09:34', '2025-05-30 18:09:34'),
(54, '12321', 'Alwi', 'bacadoa@gmail.com', '$2b$10$1U16tI4R8Wvww5uqv7JyOuIqO8RAOfs0DT7OEC6yTYSNeQYPhMita', '123', 'guru', '2025-06-04 13:18:26', '2025-06-04 13:18:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `wifi_terdaftar`
--

CREATE TABLE `wifi_terdaftar` (
  `id` int(11) NOT NULL,
  `nama_tempat` varchar(100) NOT NULL,
  `ssid` varchar(100) DEFAULT NULL,
  `mac_address` varchar(100) NOT NULL,
  `keterangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `laporan`
--
ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_laporan` (`bulan`,`tahun`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indeks untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `presensi_id` (`presensi_id`);

--
-- Indeks untuk tabel `perizinan`
--
ALTER TABLE `perizinan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_perizinan` (`user_id`,`tanggal`);

--
-- Indeks untuk tabel `presensi`
--
ALTER TABLE `presensi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_presensi` (`user_id`,`tanggal`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nip` (`nip`);

--
-- Indeks untuk tabel `wifi_terdaftar`
--
ALTER TABLE `wifi_terdaftar`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mac_address` (`mac_address`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `laporan`
--
ALTER TABLE `laporan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `perizinan`
--
ALTER TABLE `perizinan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT untuk tabel `presensi`
--
ALTER TABLE `presensi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT untuk tabel `wifi_terdaftar`
--
ALTER TABLE `wifi_terdaftar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `laporan`
--
ALTER TABLE `laporan`
  ADD CONSTRAINT `laporan_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD CONSTRAINT `notifikasi_ibfk_1` FOREIGN KEY (`presensi_id`) REFERENCES `presensi` (`id`);

--
-- Ketidakleluasaan untuk tabel `perizinan`
--
ALTER TABLE `perizinan`
  ADD CONSTRAINT `perizinan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `presensi`
--
ALTER TABLE `presensi`
  ADD CONSTRAINT `presensi_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
