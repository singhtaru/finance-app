import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#FFFBFA] text-[#03012C]">
      {/* Navbar */}
      <nav className="bg-[#03012C] px-6 py-4 flex justify-between items-center">
        <Link
          to="/dashboard"
          className="text-2xl font-extrabold text-[#9684A1]"
        >
          Limitly
        </Link>

        <button className="text-2xl text-[#E16F7C] hover:opacity-80">
          Logout
        </button>
      </nav>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
