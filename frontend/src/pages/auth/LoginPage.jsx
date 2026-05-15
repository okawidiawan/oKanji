import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/use-auth-store";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const isFormValid = formData.username.trim() !== "" && formData.password.trim() !== "";

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Bersihkan error saat user mulai mengetik ulang
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      const identifier = formData.username.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(identifier);

      const loginPayload = {
        password: formData.password,
        [isEmail ? "email" : "username"]: identifier,
      };

      await login(loginPayload);
      navigate("/profile");
    } catch (err) {
      // Error ditangani oleh store
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-400 text-sm mt-1">Please Login to Continue Your Kanji Journey.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            className="w-full bg-background-lighter border border-my-border rounded-lg px-4 py-2.5 text-white placeholder-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Input Username or Email"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="w-full bg-background-lighter border border-my-border rounded-lg px-4 py-2.5 text-white placeholder-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
              {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading || !isFormValid} className="w-full bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors mt-2">
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              processing...
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-gray-400 text-sm">
          Don't have an account ?{" "}
          <Link to="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Register free
          </Link>
        </p>
      </div>
    </div>
  );
}
