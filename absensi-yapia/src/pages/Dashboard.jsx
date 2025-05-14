import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [searchTerm, setSearchTerm] = useState("");
  const [dataGuru, setDataGuru] = useState([
    { id: 1, nama: "Budi", nip: "123456", role: "Guru", status: "Hadir", waktu: "2025-05-05 07:15", kehadiran: 1, isEditing: false },
    { id: 2, nama: "Alex", nip: "234567", role: "Guru", status: "Hadir", waktu: "2025-05-05 07:15", kehadiran: 1, isEditing: false },
  ]);
  const [dataStaff, setDataStaff] = useState([
    { id: 3, nama: "Dina", nip: "654321", role: "Staff", status: "Sakit", waktu: "2025-05-05 07:32", kehadiran: 1, isEditing: false },
  ]);

  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

  const handleAdd = (tipe) => {
    const nama = prompt("Nama:");
    const nip = prompt("NIP:");
    const status = prompt("Status (Hadir/Izin/Sakit/Tidak Hadir):");
    if (!nama || !nip || !status) return;

    const waktu = new Date().toISOString().slice(0, 16).replace("T", " ");
    const kehadiran = status === "Hadir" || status === "Sakit" ? 1 : 0;
    const newData = { id: generateId(), nama, nip, role: tipe, status, waktu, kehadiran, isEditing: false };

    tipe === "Guru"
      ? setDataGuru([...dataGuru, newData])
      : setDataStaff([...dataStaff, newData]);
  };

  const toggleEdit = (id, tipe) => {
    const setter = tipe === "Guru" ? setDataGuru : setDataStaff;
    const data = tipe === "Guru" ? dataGuru : dataStaff;
    const updated = data.map(item =>
      item.id === id ? { ...item, isEditing: !item.isEditing } : item
    );
    setter(updated);
  };

  const handleStatusChange = (id, value, tipe) => {
    const setter = tipe === "Guru" ? setDataGuru : setDataStaff;
    const data = tipe === "Guru" ? dataGuru : dataStaff;
    const updated = data.map(item =>
      item.id === id
        ? {
            ...item,
            status: value,
            kehadiran: value === "Hadir" || value === "Sakit" || value === "Izin" ? 1 : 0,
          }
        : item
    );
    setter(updated);
  };

  const handleDelete = (id, tipe) => {
    const setter = tipe === "Guru" ? setDataGuru : setDataStaff;
    const data = tipe === "Guru" ? dataGuru : dataStaff;
    const nama = data.find(item => item.id === id)?.nama;
    const confirmDelete = window.confirm(`Hapus data atas nama "${nama}"?`);
    if (!confirmDelete) return;
    setter(data.filter(item => item.id !== id));
  };

  const exportPDF = (title, data) => {
    const doc = new jsPDF();
    doc.text(title, 14, 10);
    autoTable(doc, {
      head: [["Nama", "NIP", "Role", "Status", "Waktu", "Total Kehadiran"]],
      body: data.map(d => [d.nama, d.nip, d.role, d.status, d.waktu, d.kehadiran]),
    });
    doc.save(`${title}.pdf`);
  };

  const exportExcel = (title, data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title}.xlsx`);
  };

  const renderTable = (title, data, tipe) => {
    const filtered = data
      .filter(d => d.nama.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.nama.localeCompare(b.nama));

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="space-x-2">
            <button onClick={() => handleAdd(tipe)} className="bg-green-500 text-white px-2 py-1 rounded text-sm">+ Tambah</button>
            <button onClick={() => exportPDF(title, filtered)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">PDF</button>
            <button onClick={() => exportExcel(title, filtered)} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Excel</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-3 py-1">Nama</th>
                <th className="border px-3 py-1">NIP</th>
                <th className="border px-3 py-1">Role</th>
                <th className="border px-3 py-1">Status</th>
                <th className="border px-3 py-1">Waktu</th>
                <th className="border px-3 py-1">Total Kehadiran</th>
                <th className="border px-3 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="text-center">
                  <td className="border px-3 py-1">{item.nama}</td>
                  <td className="border px-3 py-1">{item.nip}</td>
                  <td className="border px-3 py-1">{item.role}</td>
                  <td className="border px-3 py-1">
                    {item.isEditing ? (
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value, tipe)}
                        className="border p-1 rounded"
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Tidak Hadir">Tidak Hadir</option>
                      </select>
                    ) : (
                      <span className={
                        item.status === "Hadir" ? "text-green-600" :
                        item.status === "Izin" ? "text-yellow-600" :
                        item.status === "Sakit" ? "text-red-600" :
                        "text-gray-600"
                      }>
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="border px-3 py-1">{item.waktu}</td>
                  <td className="border px-3 py-1">{item.kehadiran}</td>
                  <td className="border px-3 py-1 space-x-1">
                    <button onClick={() => toggleEdit(item.id, tipe)} className="text-blue-600">
                      {item.isEditing ? "Simpan" : "Edit"}
                    </button>
                    <button onClick={() => handleDelete(item.id, tipe)} className="text-red-600">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Absensi</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3"
        />
      </div>
      {renderTable("Absensi Guru", dataGuru, "Guru")}
      {renderTable("Absensi Staff", dataStaff, "Staff")}
    </div>
  );
};

export default Dashboard;
