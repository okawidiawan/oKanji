import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/use-auth-store";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const isFormValid = formData.username.trim().length >= 3 && validateEmail(formData.email) && formData.password.length >= 8 && formData.password === formData.confirmPassword;

  useEffect(() => {
    // Bersihkan error saat pertama kali masuk halaman
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      await register(formData);
      // Sukses -> diredirect ke login (sesuai catatan arsitektur)
      navigate("/auth/login", {
        state: { message: "Account created successfully! Please login." },
      });
    } catch (err) {
      // Error ditangani oleh store
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Create New Account</h1>
        <p className="text-gray-400 text-sm mt-1">Start Your Kanji Journey, Now.</p>
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
            className="w-full bg-background-lighter border border-my-border rounded-lg px-4 py-2.5 text-white placeholder-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Input Username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full bg-background-lighter border border-my-border rounded-lg px-4 py-2.5 text-white placeholder-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Input Your Name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-background-lighter border border-my-border rounded-lg px-4 py-2.5 text-white placeholder-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="example@gmail.com"
            value={formData.email}
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
              className="w-full bg-background-lighter border border-my-border rounded-lg px-4 py-2.5 text-white placeholder-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Password at least 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
              {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              className="w-full bg-background-lighter border border-my-border rounded-lg px-4 py-2.5 text-white placeholder-secondary-dark/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="text-primary text-xs mt-1">Passwords do not match!</p>}
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
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
              Registering...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-gray-400 text-sm">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary hover:text-primary font-semibold transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
