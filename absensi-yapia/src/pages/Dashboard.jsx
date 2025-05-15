import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // STATE MANAGEMENT
  const [data, setData] = useState({ Guru: [], Staff: [] }); // Gabung data Guru & Staff
  const [filters, setFilters] = useState({ Guru: "", Staff: "" });
  const [newRows, setNewRows] = useState({ Guru: null, Staff: null });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // INITIALIZATION: Check auth status on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) navigate("/login");
    else setCurrentUser(JSON.parse(userData));
  }, [navigate]);

  // UTILITY FUNCTIONS
  const generateId = () => Date.now() + Math.random();

  /**
   * Memeriksa apakah user saat ini adalah admin
   * @returns {boolean}
   */
  const isAdmin = () => currentUser?.role === "admin";

  /**
   * Menampilkan alert jika akses ditolak
   */
  const showAccessDenied = () => alert("Hanya admin yang dapat mengakses fitur ini!");

  // CRUD OPERATIONS
  /**
   * Memulai proses penambahan data baru
   * @param {string} tipe - 'Guru' atau 'Staff'
   */
  const handleAdd = (tipe) => {
    if (!isAdmin()) return showAccessDenied();
    
    setNewRows({
      ...newRows,
      [tipe]: {
        id: generateId(),
        nama: "",
        nip: "",
        role: tipe,
        status: "Hadir",
        waktu: new Date().toISOString().slice(0, 16).replace("T", " "),
        kehadiran: 1,
        isNew: true,
      }
    });
  };

  /**
   * Menyimpan data baru
   * @param {string} tipe - 'Guru' atau 'Staff'
   */
  const saveNewRow = (tipe) => {
    const rowData = newRows[tipe];
    if (!rowData.nama || !rowData.nip) return alert("Nama dan NIP wajib diisi!");

    setData({
      ...data,
      [tipe]: [...data[tipe], { ...rowData, isEditing: false, isNew: false }]
    });
    setNewRows({ ...newRows, [tipe]: null });
  };

  /**
   * Memulai proses edit data
   * @param {string} id - ID data yang akan diedit
   * @param {string} tipe - 'Guru' atau 'Staff'
   */
  const handleEdit = (id, tipe) => {
    if (!isAdmin()) return showAccessDenied();

    setData({
      ...data,
      [tipe]: data[tipe].map(item => 
        item.id === id ? { ...item, isEditing: true } : item
      )
    });
  };

  /**
   * Menghapus data
   * @param {string} id - ID data yang akan dihapus
   * @param {string} tipe - 'Guru' atau 'Staff'
   */
  const handleDelete = (id, tipe) => {
    if (!isAdmin()) return showAccessDenied();
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    setData({
      ...data,
      [tipe]: data[tipe].filter(item => item.id !== id)
    });
  };

  // EXPORT FUNCTIONALITY
  /**
   * Mengekspor data ke Excel/PDF
   * @param {string} tipe - 'Guru' atau 'Staff'
   * @param {string} format - 'excel' atau 'pdf'
   */
  const handleExport = (tipe, format) => {
    const exportData = data[tipe].map(({ nama, nip, role, status, waktu, kehadiran }) => ({
      Nama: nama, NIP: nip, Role: role, Status: status, Waktu: waktu, Kehadiran: kehadiran
    }));

    const filename = `absensi_${tipe.toLowerCase()}_${new Date().toISOString().split('T')[0]}`;

    if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.text(`Laporan Absensi ${tipe}`, 10, 10);
      doc.autoTable({ 
        head: [["Nama", "NIP", "Role", "Status", "Waktu", "Kehadiran"]],
        body: exportData.map(item => Object.values(item))
      });
      doc.save(`${filename}.pdf`);
    }
  };

  // RENDER LOGIC
  /**
   * Merender tabel untuk tipe tertentu (Guru/Staff)
   * @param {string} tipe - 'Guru' atau 'Staff'
   * @returns {JSX.Element}
   */
  const renderTable = (tipe) => {
    const filteredData = data[tipe].filter(item =>
      item.nama.toLowerCase().includes(filters[tipe].toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow p-5 w-full max-w-5xl mx-auto mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Tabel Absensi {tipe}</h2>

        {/* Search and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="Cari nama..."
            value={filters[tipe]}
            onChange={(e) => setFilters({ ...filters, [tipe]: e.target.value })}
            className="p-2 border rounded-lg w-full sm:w-64"
          />
          <div className="flex flex-wrap gap-2">
            {isAdmin() && (
              <button onClick={() => handleAdd(tipe)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                + Tambah
              </button>
            )}
            <button onClick={() => handleExport(tipe, "excel")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Export Excel
            </button>
            <button onClick={() => handleExport(tipe, "pdf")} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Export PDF
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm text-center">
            {/* Table Header */}
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {["Nama", "NIP", "Role", "Status", "Waktu", "Total Kehadiran", "Aksi"].map((header) => (
                  <th key={header} className="border px-3 py-2">{header}</th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {/* New Row Form */}
              {newRows[tipe] && (
                <tr className="bg-yellow-50">
                  {["nama", "nip", "role", "status", "waktu", "kehadiran"].map((field) => (
                    <td key={field} className="border px-2 py-1">
                      {field === "status" ? (
                        <select
                          value={newRows[tipe][field]}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewRows({
                              ...newRows,
                              [tipe]: {
                                ...newRows[tipe],
                                status: value,
                                kehadiran: ["Hadir", "Sakit", "Izin"].includes(value) ? 1 : 0
                              }
                            });
                          }}
                          className="w-full border rounded p-1"
                        >
                          {["Hadir", "Izin", "Sakit", "Tidak Hadir"].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field === "role" ? (
                        tipe
                      ) : field === "kehadiran" ? (
                        newRows[tipe][field]
                      ) : (
                        <input
                          type="text"
                          value={newRows[tipe][field]}
                          onChange={(e) => setNewRows({
                            ...newRows,
                            [tipe]: { ...newRows[tipe], [field]: e.target.value }
                          })}
                          className="w-full border rounded p-1"
                        />
                      )}
                    </td>
                  ))}
                  <td className="border px-2 py-1 space-x-1">
                    <button onClick={() => saveNewRow(tipe)} className="text-green-600 hover:underline">Simpan</button>
                    <button onClick={() => setNewRows({ ...newRows, [tipe]: null })} className="text-gray-500 hover:underline">Batal</button>
                  </td>
                </tr>
              )}

              {/* Existing Data Rows */}
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {["nama", "nip", "role", "status", "waktu", "kehadiran"].map((field) => (
                    <td key={`${item.id}-${field}`} className="border px-2 py-1">
                      {item.isEditing && field !== "role" && field !== "kehadiran" ? (
                        field === "status" ? (
                          <select
                            value={item[field]}
                            onChange={(e) => {
                              const value = e.target.value;
                              setData({
                                ...data,
                                [tipe]: data[tipe].map(i => 
                                  i.id === item.id ? { 
                                    ...i, 
                                    status: value,
                                    kehadiran: ["Hadir", "Sakit", "Izin"].includes(value) ? 1 : 0
                                  } : i
                                )
                              });
                            }}
                            className="w-full border rounded p-1"
                          >
                            {["Hadir", "Izin", "Sakit", "Tidak Hadir"].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={item[field]}
                            onChange={(e) => setData({
                              ...data,
                              [tipe]: data[tipe].map(i => 
                                i.id === item.id ? { ...i, [field]: e.target.value } : i
                              )
                            })}
                            className="w-full border rounded p-1"
                          />
                        )
                      ) : (
                        item[field]
                      )}
                    </td>
                  ))}
                  <td className="border px-2 py-1 space-x-1">
                    {item.isEditing ? (
                      <button onClick={() => setData({
                        ...data,
                        [tipe]: data[tipe].map(i => 
                          i.id === item.id ? { ...i, isEditing: false } : i
                        )
                      })} className="text-green-600 hover:underline">
                        Simpan
                      </button>
                    ) : (
                      isAdmin() && (
                        <>
                          <button onClick={() => handleEdit(item.id, tipe)} className="text-blue-600 hover:underline">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(item.id, tipe)} className="text-red-600 hover:underline">
                            Hapus
                          </button>
                        </>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // MAIN RENDER
  if (!currentUser) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-center md:text-left text-blue-800">
          Dashboard Absensi Guru & Staff
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Login sebagai: <span className="font-semibold">{currentUser.nama}</span> 
            ({currentUser.role})
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Render Tables */}
      {renderTable("Guru")}
      {renderTable("Staff")}
    </div>
  );
};

export default Dashboard;