import { useState } from "react";

export default function ProfilePageForm({ user, updateProfile, isLoading, error, successMessage, setSuccessMessage, clearError, validationError, setValidationError }) {
  // Local state for form
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (successMessage) setSuccessMessage("");
    if (validationError) setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setValidationError("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match!");
      setTimeout(() => {
        setValidationError("");
      }, 3000);
      return;
    }

    // Validasi sederhana: minimal satu field harus diisi jika password kosong
    const dataToUpdate = {};
    if (formData.name !== user?.name) dataToUpdate.name = formData.name;
    if (formData.email !== user?.email) dataToUpdate.email = formData.email;
    if (formData.password) dataToUpdate.password = formData.password;

    if (Object.keys(dataToUpdate).length === 0) {
      return;
    }

    try {
      await updateProfile(dataToUpdate);
      setSuccessMessage("Profile Update Successfully");
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" })); // Clear password field

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
            placeholder="Your Name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
            placeholder="email@example.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400 ml-1">New Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white font-mono"
          placeholder="Leave blank to keep current password"
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400 ml-1">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white font-mono"
          placeholder="Confirm Your New Password"
          minLength={8}
          required={formData.password.length > 0}
        />
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">{error}</div>}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-background font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
