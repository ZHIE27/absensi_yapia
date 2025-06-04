import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherTable from "../components/TeacherTable";
import StaffTable from "../components/StaffTable";
import UserDashboard from "../components/UserDashboard";

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user_data"));
    const date = new Date();
    const formattedDate = date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    setCurrentDate(formattedDate);
    if (!userData) {
      navigate("/"); // Redirect ke login jika tidak ada user_data
      return;
    }

    try {
      const parsedData = userData;
      const storedRole = parsedData.role;

      if (!storedRole) {
        navigate("/"); // Redirect jika role tidak ditemukan
        return;
      }

      setRole(storedRole);
      setLoading(false);
    } catch (error) {
      console.error("Gagal parse user_data:", error);
      navigate("/"); // Redirect jika JSON error
    }
  }, [navigate]);



  if (loading) {
    return (
      <div className="mt-5">
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h2 className="text-center font-extrabold text-[1.6rem]">Data Absensi Guru dan Staff {currentDate}</h2>
      {role == "admin" || role === "kepala_sekolah" ? (
        <>
          <TeacherTable />
          <StaffTable />
        </>
      ) : (
        <UserDashboard />
      )}


    </div>
  );
};

export default Dashboard;
