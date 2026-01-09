import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import api from "../services/api";
import limitlyLogo from "../assets/limitly-logo.png";
import loginHero from "../assets/login-hero.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      api.get("/users/me")
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data));
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Failed to fetch user", err);
          alert("Google Login failed. Please try again.");
        });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex overflow-hidden">

      {/* LEFT SIDE - HERO IMAGE */}
      <div className="hidden lg:flex w-1/2 bg-[#F8F9FD] items-center justify-center relative p-12">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <img src={limitlyLogo} alt="Limitly" className="w-8 h-8 object-contain" />
          <h1 className="text-2xl font-bold text-[#FF6B6B] tracking-tight">Limitly</h1>
        </div>

        <div className="max-w-xl">
          <img
            src={loginHero}
            alt="Finance Growth"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold text-[#03012C] mb-4">Manage Your Finances Masterfully</h2>
            <p className="text-gray-500 text-lg">Track expenses, split bills with friends, and gain insights into your spending habits all in one place.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#03012C] p-6">
        <div className="w-full max-w-md">
          <Card className="!bg-white/5 backdrop-blur-none border-none shadow-none text-center">

            {/* Mobile Logo */}
            <div className="flex lg:hidden flex-col items-center mb-8">
              <img src={limitlyLogo} alt="Limitly" className="w-12 h-12 object-contain mb-2" />
              <h1 className="text-3xl font-bold text-[#FF6B6B]">Limitly</h1>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-400 mb-8">Please login to your account</p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
              <div>
                <label className="text-gray-300 text-sm ml-1 mb-1 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#F0F2F5] border-none text-[#03012C] focus:ring-2 focus:ring-[#6C63FF] placeholder-gray-400 !mb-0"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm ml-1 mb-1 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#F0F2F5] border-none text-[#03012C] focus:ring-2 focus:ring-[#6C63FF] placeholder-gray-400 !mb-0"
                />
              </div>

              <div className="flex justify-end">
                <Link to="#" className="text-sm text-[#FF6B6B] hover:underline">Forgot password?</Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF5252] hover:to-[#FF7B3B] text-white shadow-lg shadow-orange-500/20 py-3 text-lg font-bold mt-2"
              >
                Login
              </Button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px bg-[#2D2B55] flex-1"></div>
              <span className="text-gray-500 text-sm">OR</span>
              <div className="h-px bg-[#2D2B55] flex-1"></div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
                className="w-full flex items-center justify-center gap-3 bg-white text-[#03012C] py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Login with Google
              </button>

              <p className="text-gray-400 mt-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-[#6C63FF] font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
