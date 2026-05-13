import { useState } from "react";
import useAuthStore from "../../stores/use-auth-store";
import ProfilePageForm from "./ProfilePageForm";

export default function ProfilePage() {
  const { user, updateProfile, isLoading, error, clearError } = useAuthStore();

  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
        <h1 className="text-3xl font-bold">Your Profile</h1>

        <div className="bg-background-lighter/40 p-6 rounded-2xl border space-y-8 border-my-border backdrop-blur-md top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
          {/* User Info Header */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 bg-linear-to-tr from-primary/80 to-primary/40">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : ""}
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
          <ProfilePageForm
            key={user?.email || "loading"}
            user={user}
            updateProfile={updateProfile}
            isLoading={isLoading}
            error={error}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            clearError={clearError}
            validationError={validationError}
            setValidationError={setValidationError}
          />
        </div>
      </div>

      {successMessage && (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-green-900/10 border border-green-500/50 text-green-500 p-4 rounded-xl text-sm mt-8 text-center animate-fade-up">
          {successMessage}
        </div>
      )}
      {validationError && (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8 text-center bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-xl text-sm animate-fade-up">
          {validationError}
        </div>
      )}
    </>
  );
}
