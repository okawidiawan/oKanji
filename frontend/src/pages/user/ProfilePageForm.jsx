import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function ProfilePageForm({ user, updateProfile, isLoading, error, successMessage, setSuccessMessage, clearError, validationError, setValidationError }) {
  // Local state for form
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  const [isTransittioning, setIsTransitioning] = useState(false);

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsEdit(false);

    if (validationError) setValidationError("");
  };

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
      setIsEdit(false);
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
            className="w-full bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white disabled:text-secondary-dark disabled:opacity-70"
            placeholder="Your Name"
            required
            disabled={!isEdit}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white disabled:text-secondary-dark disabled:opacity-70"
            placeholder="email@example.com"
            required
            disabled={!isEdit}
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
          className="w-full text-xs sm:text-sm bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-secondary font-mono disabled:text-secondary-dark disabled:opacity-70"
          placeholder="Leave blank to keep current password"
          minLength={8}
          disabled={!isEdit}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400 ml-1">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full text-xs sm:text-sm bg-background-lighter border border-my-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white font-mono disabled:text-secondary-dark disabled:opacity-70"
          placeholder="Confirm Your New Password"
          minLength={8}
          required={formData.password.length > 0}
          disabled={!isEdit}
        />
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">{error}</div>}

      <div className="flex flex-wrap justify-start gap-4">
        {/* Jika sedang mode edit, tampilkan tombol Cancel */}
        {isEdit && (
          <button type="button" onClick={handleCancel} className="w-full sm:w-fit px-6 py-3 border border-my-border rounded-xl hover:bg-white/5 transition-all cursor-pointer">
            Cancel
          </button>
        )}

        {/* Tombol utama: Toggle antara Edit dan Save */}
        {!isEdit ? (
          <button
            type="button"
            disabled={isTransittioning}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setIsEdit(true);
                setIsTransitioning(false);
              }, 800);
            }}
            className="w-full sm:w-fit px-6 py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary/80 transition-all cursor-pointer disabled:opacity-50"
          >
            {isTransittioning ? (
              <div className="flex items-center justify-center gap-2">
                <AiOutlineLoading3Quarters className="animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              "Edit Profile"
            )}
          </button>
        ) : (
          <button type="submit" disabled={isLoading} className="w-full sm:w-fit px-6 py-3 border border-green-600 text-green-600 font-bold rounded-xl hover:bg-green-600 hover:text-secondary transition-all cursor-pointer">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <AiOutlineLoading3Quarters className="animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
