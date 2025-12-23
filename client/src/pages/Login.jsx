import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#03012C] flex items-center justify-center">
      <Card>
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-semibold mb-8 text-[#03012C]">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" className="w-full mt-2 py-2.5">
              Login
            </Button>
          </form>

          <p className="text-sm text-[#03012C] mt-6">
            Don’t have an account?{" "}
            <Link to="/register" className="text-[#E16F7C] font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
