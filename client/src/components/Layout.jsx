import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-[#03012C] text-[#FFFBFA]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#03012C]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-4">
          {!isDashboard && (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-[#FFFBFA] transition-all hover:scale-105 active:scale-95"
              title="Go Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
          <Link
            to="/dashboard"
            className="text-2xl font-extrabold text-[#FF6B6B] tracking-tight hover:opacity-90 transition-opacity"
          >
            Limitly
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/ai-assistant" className="text-[#FFFBFA] hover:text-[#6C63FF] transition-colors font-medium flex items-center gap-2 relative z-10">
            Ask Limitly ✨
          </Link>

          <Link to="/profile" className="relative group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#FF6B6B] p-[2px] shadow-lg shadow-[#6C63FF]/30 transition-transform transform group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#03012C] flex items-center justify-center text-[#FFFBFA] font-bold text-sm">
                {/* Initials or Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-gray-400 hover:text-[#E16F7C] transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto p-6 pt-24">
        {children}
      </main>
    </div>
  );
}
