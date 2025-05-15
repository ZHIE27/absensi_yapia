import Login from "./components/Login"
import Dashboard from "./pages/Dashboard"
import {Route, Routes} from "react-router-dom"
import Presensi from "./pages/Presensi"
import Navbar from "./components/Navbar"
import Profile from "./pages/Profile"
function App() {

  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/presensi" element={<Presensi />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  )
}

export default App
