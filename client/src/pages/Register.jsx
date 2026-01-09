import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful. Please login.");
      navigate("/");
    } catch (error) {
      alert("Registration failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F7F9] flex items-center justify-center font-sans p-4 py-8">
      <Card>
        <div className="flex flex-col items-center text-center p-4">

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-[#FF6B6B] tracking-tight mb-2">Limitly</h1>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Create Account</h2>
            <p className="text-gray-500 text-sm mt-1">Join us to manage your expenses</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-2"
          >
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#F0F2F5] focus:bg-white"
            />

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#F0F2F5] focus:bg-white"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#F0F2F5] focus:bg-white"
            />

            <Button
              type="submit"
              className="w-full mt-4 bg-[#FF6B6B] hover:bg-[#FF5252] text-white shadow-lg shadow-[#FF6B6B]/30 rounded-xl py-3 text-lg font-semibold transform hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              Register
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 w-full">
            <p className="text-sm text-gray-500">Already have an account?</p>
            <Link
              to="/"
              className="w-full text-center py-3 rounded-xl bg-[#6C63FF] hover:bg-[#5a52d5] text-white font-semibold shadow-lg shadow-[#6C63FF]/30 transform hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
