import { useState, useEffect } from "react";
import useAuthStore from "../../stores/use-auth-store";

export default function ProfilePage() {
  const { user, updateProfile, isLoading, error, clearError } = useAuthStore();
  
  // Local state for form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // Jangan tampilkan password lama
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (successMessage) setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    
    // Validasi sederhana: minimal satu field harus diisi jika password kosong
    const dataToUpdate = {};
    if (formData.name !== user.name) dataToUpdate.name = formData.name;
    if (formData.email !== user.email) dataToUpdate.email = formData.email;
    if (formData.password) dataToUpdate.password = formData.password;

    if (Object.keys(dataToUpdate).length === 0) {
      return;
    }

    try {
      await updateProfile(dataToUpdate);
      setSuccessMessage("Profil berhasil diperbarui!");
      setFormData(prev => ({ ...prev, password: "" })); // Clear password field
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold">Profil Anda</h1>
      
      <div className="bg-background p-6 rounded-2xl border border-my-border space-y-8 shadow-sm">
        {/* User Info Header */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 bg-gradient-to-tr from-primary to-blue-400">
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center text-3xl font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{user?.name}</div>
            <div className="text-gray-400 font-mono text-sm">@{user?.username}</div>
            <div className="text-gray-500 text-sm mt-1">{user?.email}</div>
          </div>
        </div>

        <hr className="border-my-border" />

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
                placeholder="Nama Anda"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
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
            <label className="text-sm font-medium text-gray-400 ml-1">Password Baru (Opsional)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white font-mono"
              placeholder="Kosongkan jika tidak ingin mengubah"
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl text-sm">
              {successMessage}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-background font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
