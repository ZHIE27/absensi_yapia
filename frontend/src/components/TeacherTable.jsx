import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const initialData = [
  { 
    nama: 'Dewi Lestari', 
    nip: '198706252010122003', 
    statusHariIni: 'Hadir', 
    waktuAbsensi: '08:15', 
    totalAbsensi: 19, 
    whatsapp: '081234567890', 
    email: 'dewi@example.com' 
  },
  { 
    nama: 'Rahmat Hidayat', 
    nip: '197912142005031004', 
    statusHariIni: 'Hadir', 
    waktuAbsensi: '07:45', 
    totalAbsensi: 21, 
    whatsapp: '082345678901', 
    email: 'rahmat@example.com' 
  },
  { 
    nama: 'Nur Aini', 
    nip: '198305202008032005', 
    statusHariIni: 'Tidak Hadir', 
    waktuAbsensi: '-', 
    totalAbsensi: 17, 
    whatsapp: '083456789012', 
    email: 'nur@example.com' 
  },
];

const statusOptions = ['Hadir', 'Tidak Hadir', 'Izin', 'Sakit'];

const TeacherTable = () => {
  const [staffData, setStaffData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEntry, setNewEntry] = useState({ 
    nama: '', 
    nip: '', 
    statusHariIni: 'Hadir', 
    waktuAbsensi: '',
    whatsapp: '', 
    email: '' 
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const filteredData = staffData
    .filter(item => item.nama.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.nama.localeCompare(b.nama));

  const handleAdd = () => {
    const waktu = newEntry.statusHariIni === 'Hadir' 
      ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '-';
    
    const newData = {
      ...newEntry,
      waktuAbsensi: waktu,
      totalAbsensi: newEntry.statusHariIni === 'Hadir' ? 1 : 0,
    };
    setStaffData([...staffData, newData]);
    setNewEntry({ 
      nama: '', 
      nip: '', 
      statusHariIni: 'Hadir', 
      waktuAbsensi: '',
      whatsapp: '', 
      email: '' 
    });
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditData({ ...staffData[index] });
  };

  const handleSave = (index) => {
    const updated = [...staffData];
    updated[index] = { ...editData };
    
    // Update waktu absensi jika status berubah
    if (editData.statusHariIni === 'Hadir' && !editData.waktuAbsensi) {
      updated[index].waktuAbsensi = new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (editData.statusHariIni !== 'Hadir') {
      updated[index].waktuAbsensi = '-';
    }
    
    setStaffData(updated);
    setEditIndex(null);
  };

  const handleDelete = (index) => {
    const confirmDelete = window.confirm('Yakin ingin menghapus data ini?');
    if (confirmDelete) {
      const updated = [...staffData];
      updated.splice(index, 1);
      setStaffData(updated);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Nama', 'NIP', 'Status', 'Waktu Absensi', 'Total Absensi', 'WhatsApp', 'Email']],
      body: staffData.map(d => [d.nama, d.nip, d.statusHariIni, d.waktuAbsensi, d.totalAbsensi, d.whatsapp, d.email]),
    });
    doc.save('data_absensi.pdf');
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(staffData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DataAbsensi');
    XLSX.writeFile(workbook, 'data_absensi.xlsx');
  };

  return (
    <div className="p-3">
      <div className="p-6 bg-yellow-200 border-[3px] border-black shadow-[6px_6px_0_rgba(0,0,0,1)]">
        <h1 className="text-2xl font-extrabold mb-4 text-black">📋 Data Absensi Guru</h1>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <input
            type="text"
            placeholder="Cari berdasarkan nama..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border-[3px] border-black bg-white text-black shadow-[4px_4px_0_rgba(0,0,0,1)] focus:outline-none"
          />
          <div className="flex gap-2">
            <button onClick={exportPDF} className="bg-pink-400 border-[3px] border-black text-black px-3 py-2 font-bold shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-pink-300">
              Export PDF
            </button>
            <button onClick={exportExcel} className="bg-lime-400 border-[3px] border-black text-black px-3 py-2 font-bold shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-lime-300">
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-[3px] border-black shadow-[6px_6px_0_rgba(0,0,0,1)] bg-white">
            <thead className="bg-black text-white text-left">
              <tr>
                {['Nama', 'NIP', 'Status Hari Ini', 'Waktu Absensi', 'Total Absensi', 'WhatsApp', 'Email', 'Aksi'].map(header => (
                  <th key={header} className="p-2 border-b-[3px] border-white">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-yellow-100 border-b-[2px] border-black">
                  {editIndex === index ? (
                    <>
                      <td className="p-2"><input value={editData.nama} onChange={e => setEditData({ ...editData, nama: e.target.value })} className="w-full border-[2px] border-black" /></td>
                      <td className="p-2"><input value={editData.nip} onChange={e => setEditData({ ...editData, nip: e.target.value })} className="w-full border-[2px] border-black" /></td>
                      <td className="p-2">
                        <select 
                          value={editData.statusHariIni} 
                          onChange={e => {
                            const waktu = e.target.value === 'Hadir' 
                              ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                              : '-';
                            setEditData({ 
                              ...editData, 
                              statusHariIni: e.target.value,
                              waktuAbsensi: waktu
                            });
                          }} 
                          className="w-full border-[2px] border-black"
                        >
                          {statusOptions.map(status => <option key={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="p-2">
                        {editData.statusHariIni === 'Hadir' ? (
                          <input 
                            value={editData.waktuAbsensi} 
                            onChange={e => setEditData({ ...editData, waktuAbsensi: e.target.value })} 
                            className="w-full border-[2px] border-black" 
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-2 text-center">{editData.totalAbsensi}</td>
                      <td className="p-2"><input value={editData.whatsapp} onChange={e => setEditData({ ...editData, whatsapp: e.target.value })} className="w-full border-[2px] border-black" /></td>
                      <td className="p-2"><input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="w-full border-[2px] border-black" /></td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleSave(index)} className="bg-green-400 border-[2px] border-black px-2 py-1 font-bold shadow-[2px_2px_0_rgba(0,0,0,1)]">Simpan</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{item.nama}</td>
                      <td className="p-2">{item.nip}</td>
                      <td className="p-2">{item.statusHariIni}</td>
                      <td className="p-2">{item.waktuAbsensi}</td>
                      <td className="p-2 text-center">{item.totalAbsensi}</td>
                      <td className="p-2">{item.whatsapp}</td>
                      <td className="p-2">{item.email}</td>
                      <td className="p-2 flex gap-1 justify-center">
                        <button onClick={() => handleEdit(index)} className="bg-blue-400 border-[2px] border-black px-2 py-1 font-bold shadow-[2px_2px_0_rgba(0,0,0,1)]">Edit</button>
                        <button onClick={() => handleDelete(index)} className="bg-red-400 border-[2px] border-black px-2 py-1 font-bold shadow-[2px_2px_0_rgba(0,0,0,1)]">Hapus</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              <tr className="bg-yellow-100 border-t-[3px] border-black">
                <td className="p-2"><input placeholder="Nama" value={newEntry.nama} onChange={e => setNewEntry({ ...newEntry, nama: e.target.value })} className="w-full border-[2px] border-black" /></td>
                <td className="p-2"><input placeholder="NIP" value={newEntry.nip} onChange={e => setNewEntry({ ...newEntry, nip: e.target.value })} className="w-full border-[2px] border-black" /></td>
                <td className="p-2">
                  <select 
                    value={newEntry.statusHariIni} 
                    onChange={e => {
                      const waktu = e.target.value === 'Hadir' 
                        ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-';
                      setNewEntry({ 
                        ...newEntry, 
                        statusHariIni: e.target.value,
                        waktuAbsensi: waktu
                      });
                    }} 
                    className="w-full border-[2px] border-black"
                  >
                    {statusOptions.map(status => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  {newEntry.statusHariIni === 'Hadir' ? (
                    <input 
                      placeholder="Waktu" 
                      value={newEntry.waktuAbsensi} 
                      onChange={e => setNewEntry({ ...newEntry, waktuAbsensi: e.target.value })} 
                      className="w-full border-[2px] border-black" 
                    />
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-2 text-center">0</td>
                <td className="p-2"><input placeholder="WA" value={newEntry.whatsapp} onChange={e => setNewEntry({ ...newEntry, whatsapp: e.target.value })} className="w-full border-[2px] border-black" /></td>
                <td className="p-2"><input placeholder="Email" value={newEntry.email} onChange={e => setNewEntry({ ...newEntry, email: e.target.value })} className="w-full border-[2px] border-black" /></td>
                <td className="p-2 text-center">
                  <button onClick={handleAdd} className="bg-blue-400 border-[2px] border-black px-2 py-1 font-bold shadow-[2px_2px_0_rgba(0,0,0,1)]">Tambah</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherTable;