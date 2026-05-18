import { useState } from "react";
import useAuthStore from "../../stores/use-auth-store";
import ProfilePageForm from "./ProfilePageForm";
import useUserProgressStore from "../../stores/use-user-progress-store";
import { FaUser } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";

export default function ProfilePage() {
  const { user, updateProfile, isLoading, error, clearError } = useAuthStore();
  const { stats } = useUserProgressStore();
  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="flex flex-col gap-8">
          {/* Bagian Statistik Kanji */}
          <div className="kanji-progress flex flex-col gap-4">
            <div className="flex items-center text-2xl gap-2">
              <GiProgression className="text-primary" />
              {/* <FaUser className="text-primary" /> */}
              <h2 className="text-2xl font-bold text-white font-outfit">Kanji Progress</h2>
              {/* <h2 className="text-2xl font-bold text-white font-outfit">Your Profile</h2> */}
            </div>
            <div className="bg-background-lighter/40 p-4 rounded-2xl border border-my-border backdrop-blur-md shadow-lg space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                {stats.map((item) => (
                  <div key={item.level} className="bg-background/50 p-4 rounded-xl border border-my-border/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">{item.level}</span>
                      <span className="text-xs text-gray-400 font-mono">
                        {item.memorized} / {item.total} Memorized
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-secondary-dark h-2.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }} />
                    </div>

                    {/* Keterangan Detail */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>On Going: {item.notMemorized}</span>
                      <span>Not Added: {item.notAdded}</span>
                      <span className="text-primary/90 font-semibold">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Detail */}
          <div className="profile-detail flex flex-col gap-4">
            <div className="flex items-center text-2xl gap-2">
              <FaUser className="text-primary" />
              <h2 className="text-2xl font-bold text-white font-outfit">Your Profile</h2>
            </div>
            <div className="bg-background-lighter/40 p-6 rounded-2xl border space-y-8 border-my-border backdrop-blur-md top-0 shadow-[0_8px_8px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-primary/20 p-1 bg-linear-to-tr from-primary/80 to-primary/40">
                  <div className="w-full h-full bg-background rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-primary">
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
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-green-900/10 border border-green-500/50 text-green-500 p-4 rounded-xl text-sm mt-8 text-center ">{successMessage}</div>
          )}
          {validationError && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8 text-center bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-xl text-sm ">{validationError}</div>
          )}
          {error && <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8 text-center bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">{error}</div>}
        </div>
      </div>
    </>
  );
}
