import { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Ganti useNavigate dengan useLocation
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  // Gunakan useLocation untuk mendapatkan path/lokasi saat ini
  const location = useLocation();
  
  // Jika pathname adalah "/", jangan render navbar
  if (location.pathname === "/") {
    return null;
  }

  return (
    <>
      <nav className="bg-cyan-400 fixed w-full top-0 left-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[60px]">
            {/* LOGO */}
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="ml-2 font-bold text-white text-lg">MyApp</span>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex space-x-6 text-white font-medium">
              <Link to="/dashboard" className="hover:text-gray-200 transition">Dashboard</Link>
              <Link to="/presensi" className="hover:text-gray-200 transition">Presensi</Link>
              <Link to="/profile" className="hover:text-gray-200 transition">Profile</Link>
              <Link to="/permission" className="hover:text-gray-200 transition">Permission</Link>
              <Link to="/confirm-permission" className="hover:text-gray-200 transition">Confirm Permission</Link>
            </div>

            {/* HAMBURGER (MOBILE) */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-white focus:outline-none"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out bg-cyan-300 overflow-hidden ${
            isOpen ? "max-h-[200px] py-2" : "max-h-0"
          }`}
        >
          <div className="flex flex-col items-start px-6 space-y-4 text-white font-medium">
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/presensi" onClick={() => setIsOpen(false)}>Presensi</Link>
            <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
          </div>
        </div>
      </nav>
      
      <div className="h-[60px] md:h-[60px]" />
    </>
  );
};

export default Navbar;