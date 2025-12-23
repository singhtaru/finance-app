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
    <div className="h-screen w-screen bg-[#03012C] flex items-center justify-center">
      <Card>
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-semibold mb-8 text-[#03012C]">
            Create Account
          </h2>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm"
          >
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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

            <Button
              type="submit"
              className="w-full mt-2 py-2.5"
            >
              Register
            </Button>
          </form>

          <p className="text-sm text-[#03012C] mt-6">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-[#E16F7C] font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
