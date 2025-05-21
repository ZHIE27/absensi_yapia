import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState({ Guru: [], Staff: [] });
  const [filters, setFilters] = useState({ Guru: "", Staff: "" });
  const [newRows, setNewRows] = useState({ Guru: null, Staff: null });
  const [editRows, setEditRows] = useState({ Guru: null, Staff: null }); // State untuk baris yang sedang diedit
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const date = new Date();
  const formattedDate = date.toLocaleDateString('id-ID', {
    weekday: 'long', // name hari panjang (Senin)
    year: 'numeric', // tahun (2023)
    month: 'long',   // name bulan panjang (Januari)
    day: 'numeric'   // tanggal (1)
  });
  const dateForExportFile = date.toLocaleDateString('id-ID', {
    year: 'numeric', // tahun (2023)
    month: 'long',   // name bulan panjang (Januari)
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  
    const loadData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/role/guru", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(res.data)
  
        // Pastikan res.data berisi objek dengan key Guru dan Staff
        const guruData = res.data.Guru || [];
        const staffData = res.data.Staff || [];
  
        setData({
          Guru: guruData,
          Staff: staffData,
        });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [navigate]);
  
  const generateId = () => Date.now() + Math.random();
  const isAdmin = () => currentUser?.role === "admin";

  const showAccessDenied = () => alert("Hanya admin yang dapat mengakses fitur ini!");

  const renderUserAttendance = () => {
    if (!currentUser || currentUser.role !== "user") return null;

    return (
      <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg shadow mb-4 max-w-5xl mx-auto">
        <strong>Halo, {currentUser.name}!</strong> Jumlah kehadiran Anda bulan ini:{currentUser.totalAbsensi}
        <strong>{currentUser.totalAbsensi ?? 0}</strong>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user_data");
    navigate("/");
    return;
  };

  // Fungsi hapus data
  const handleDelete = (id, tipe) => {
    if (!isAdmin()) return showAccessDenied();
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;

    setData({
      ...data,
      [tipe]: data[tipe].filter((item) => item.id !== id),
    });

    // Jika sedang edit baris yang dihapus, batalkan editnya
    if (editRows[tipe]?.id === id) {
      setEditRows({ ...editRows, [tipe]: null });
    }
  };

  // Fungsi tambah data baru 
  const handleAdd = (tipe) => {
    if (!isAdmin()) return showAccessDenied();

    setNewRows({
      ...newRows,
      [tipe]: {
        id: generateId(),
        name: "",
        nip: "",
        status: "Hadir",
        totalAbsensi: 1,
        waktuPresensi: new Date().toLocaleString(),
        role: "user",
        noWa: "",
        position: tipe,
        isNew: true,
      },
    });
  };

  // Simpan data baru 
  const saveNewRow = (tipe) => {
    const rowData = newRows[tipe];
    if (!rowData.name.trim() || !rowData.nip.trim()) {
      return alert("Nama dan NIP wajib diisi!");
    }

    setData({
      ...data,
      [tipe]: [...data[tipe], { ...rowData, isNew: false }],
    });
    setNewRows({ ...newRows, [tipe]: null });
  };

  // Mulai edit baris
  const handleEdit = (item, tipe) => {
    if (!isAdmin()) return showAccessDenied();
    setEditRows({ ...editRows, [tipe]: { ...item } });
  };

  // Batalkan edit baris
  const cancelEdit = (tipe) => {
    setEditRows({ ...editRows, [tipe]: null });
  };

  // Simpan hasil edit baris
  const saveEditRow = (tipe) => {
    const edited = editRows[tipe];
    if (!edited.name.trim() || !edited.nip.trim()) {
      return alert("Nama dan NIP wajib diisi!");
    }
  
    // Cari data lama berdasarkan id
    const original = data[tipe].find((item) => item.id === edited.id);
  
    let totalAbsensi = edited.totalAbsensi;
    let waktuPresensi = edited.waktuPresensi;
  
    if (edited.status === "Hadir" && original.status !== "Hadir") {
      totalAbsensi += 1;
      waktuPresensi = new Date().toLocaleString();
    }
  
    if (edited.status !== "Hadir") {
      waktuPresensi = "-";
    }
  
    const updated = { ...edited, totalAbsensi, waktuPresensi };
  
    setData({
      ...data,
      [tipe]: data[tipe].map((item) =>
        item.id === updated.id ? updated : item
      ),
    });
  
    setEditRows({ ...editRows, [tipe]: null });
  };
  

  // EXPORT PDF/EXCEL
  const handleExport = (tipe, format) => {
    const exportData = data[tipe].map(
      ({ name, nip, status, totalAbsensi, noWa }) => ({
        name: name,
        NIP: nip,
        Status: status,
        "Total Absensi": totalAbsensi,
        "No. WhatsApp": noWa,
        Posisi: tipe,
      })
    );

    const filename = `data_absensi_guru_dan_staff${tipe.toLowerCase()}_${new Date()
      .toISOString()
      .split("T")[0]}`;

    if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.text(`Data Absensi ${tipe} ${dateForExportFile}`, 10, 10);
      autoTable(doc,{
        head: [["name", "NIP", "Status", "Total Absensi", "No. WhatsApp", "Posisi"]],
        body: exportData.map((item) => Object.values(item)),
      });
      doc.save(`${filename}.pdf`);
    }
  };

  const renderTable = (tipe) => {
    const filteredData = data[tipe].filter((item) =>
      item.name?.toLowerCase().includes(filters[tipe].toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow p-5 w-full max-w-5xl mx-auto mb-10 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Tabel Data {tipe}</h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder={`Cari ${tipe.toLowerCase()}...`}
            value={filters[tipe]}
            onChange={(e) => setFilters({ ...filters, [tipe]: e.target.value })}
            className="p-2 border rounded-lg w-full sm:w-64"
          />
          <div className=" w-[60%]">
            {isAdmin() && (
              <div className="flex justify-end gap-4">
              <button
                onClick={() => handleAdd(tipe)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Tambah {tipe}
              </button>
            <button
              onClick={() => handleExport(tipe, "excel")}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              onClick={() => handleExport(tipe, "pdf")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Export PDF
            </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm text-center">
            <thead className="bg-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="border border-gray-300 px-3 py-1">No</th>
                <th className="border border-gray-300 px-3 py-1">name</th>
                <th className="border border-gray-300 px-3 py-1">NIP</th>
                <th className="border border-gray-300 px-3 py-1">Status</th>
                <th className="border border-gray-300 px-3 py-1">Total Absensi</th>
                <th className="border border-gray-300 px-3 py-1">Waktu Presensi</th>
                <th className="border border-gray-300 px-3 py-1">No. WhatsApp</th>
                <th className="border border-gray-300 px-3 py-1">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {newRows[tipe] && (
                <tr className="bg-green-50">
                  <td className="border px-3 py-1 text-center">Baru</td>
                  <td className="border px-3 py-1">
                    <input
                      type="text"
                      value={newRows[tipe].name}
                      onChange={(e) =>
                        setNewRows({
                          ...newRows,
                          [tipe]: { ...newRows[tipe], name: e.target.value },
                        })
                      }
                      className="border rounded p-1 w-full"
                      placeholder="name"
                    />
                  </td>
                  <td className="border px-3 py-1">
                    <input
                      type="text"
                      value={newRows[tipe].nip}
                      onChange={(e) =>
                        setNewRows({
                          ...newRows,
                          [tipe]: { ...newRows[tipe], nip: e.target.value },
                        })
                      }
                      className="border rounded p-1 w-full"
                      placeholder="NIP"
                    />
                  </td>
                  <td className="border px-3 py-1">
                    <select
                      value={newRows[tipe].status}
                      onChange={(e) => {
                        const status = e.target.value;
                        setNewRows({
                          ...newRows,
                          [tipe]: {
                            ...newRows[tipe],
                            status,
                            totalAbsensi: status === "Hadir" ? 1 : 0,
                            waktuPresensi:
                              status === "Hadir" ? new Date().toLocaleString() : "-",
                          },
                        });
                      }}
                      className="border rounded p-1 w-full"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Izin">Izin</option>
                      <option value="Tidak Hadir">Tidak Hadir</option>
                    </select>
                  </td>
                  <td className="border px-3 py-1 text-center">
                    {newRows[tipe].totalAbsensi}
                  </td>
                  <td className="border px-3 py-1 text-center">
                    {newRows[tipe].waktuPresensi}
                  </td>
                  <td className="border px-3 py-1">
                    <input
                      type="text"
                      value={newRows[tipe].noWa}
                      onChange={(e) =>
                        setNewRows({
                          ...newRows,
                          [tipe]: { ...newRows[tipe], noWa: e.target.value },
                        })
                      }
                      className="border rounded p-1 w-full"
                      placeholder="No WhatsApp"
                    />
                  </td>
                  <td className="border px-3 py-1 space-x-2">
                    <button
                      onClick={() => saveNewRow(tipe)}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() =>
                        setNewRows({ ...newRows, [tipe]: null })
                      }
                      className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      Batal
                    </button>
                  </td>
                </tr>
              )}

              {filteredData.map((item, index) => {
                const isEditing = editRows[tipe]?.id === item.id;

                return (
                  <tr key={item.id} className={isEditing ? "bg-yellow-50" : ""}>
                    <td className="border px-3 py-1">{index + 1}</td>

                    {/* name */}
                    <td className="border px-3 py-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editRows[tipe].name}
                          onChange={(e) =>
                            setEditRows({
                              ...editRows,
                              [tipe]: { ...editRows[tipe], name: e.target.value },
                            })
                          }
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        item.name
                      )}
                    </td>

                    {/* NIP */}
                    <td className="border px-3 py-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editRows[tipe].nip}
                          onChange={(e) =>
                            setEditRows({
                              ...editRows,
                              [tipe]: { ...editRows[tipe], nip: e.target.value },
                            })
                          }
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        item.nip
                      )}
                    </td>

                    {/* Status */}
                    <td className="border px-3 py-1">
                      {isEditing ? (
                        <select
                          value={editRows[tipe].status}
                          onChange={(e) =>
                            setEditRows({
                              ...editRows,
                              [tipe]: { ...editRows[tipe], status: e.target.value },
                            })
                          }
                          className="border rounded p-1 w-full"
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Izin">Izin</option>
                          <option value="Tidak Hadir">Tidak Hadir</option>
                        </select>
                      ) : (
                        item.status
                      )}
                    </td>

                    {/* Total Absensi */}
                      <td className="border px-3 py-1 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editRows[tipe].totalAbsensi}
                            onChange={(e) =>
                              setEditRows({
                                ...editRows,
                                [tipe]: {
                                  ...editRows[tipe],
                                  totalAbsensi: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="border rounded p-1 w-20 text-center"
                          />
                        ) : (
                          item.totalAbsensi
                        )}
                      </td>


                    {/* Waktu Presensi */}
                    <td className="border px-3 py-1 text-center">
                      {isEditing ? "-" : item.waktuPresensi}
                    </td>

                    {/* No WhatsApp */}
                    <td className="border px-3 py-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editRows[tipe].noWa}
                          onChange={(e) =>
                            setEditRows({
                              ...editRows,
                              [tipe]: { ...editRows[tipe], noWa: e.target.value },
                            })
                          }
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        item.noWa
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="border px-3 py-1 space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEditRow(tipe)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => cancelEdit(tipe)}
                            className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          {isAdmin() && (
                            <>
                              <button
                                onClick={() => handleEdit(item, tipe)}
                                className="px-2 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, tipe)}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Hapus
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-3 text-center text-gray-500">
                    Tidak ada data {tipe.toLowerCase()} yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <header className="max-w-5xl mx-auto mb-6 flex flex-col justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">Dashboard Absensi Guru & Staff</h1>
        <h1 className="text-2xl font-bold text-gray-700">{formattedDate}</h1>

      </header>
      <div className="bg-slate-400 relative px-2 w-100 py-1 rounded-md flex items-center">
        <p className="text-slate-900 font-bold">anda login sebagai role</p>
            <button
              onClick={handleLogout}
              className="px-2 py-.5 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
      </div>

      {renderUserAttendance()}

      {renderTable("Guru")}
      {renderTable("Staff")}
    </div>
  );
};

export default Dashboard;
