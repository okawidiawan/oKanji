import useAuthStore from "../../stores/use-auth-store";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <div className="bg-background p-6 rounded-xl border border-my-border space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-my-border z-50 p-2">
            <div className="w-full h-full bg-primary/40 rounded-full"></div>
          </div>
          <div>
            <div className="text-xl font-semibold">{user?.name}</div>
            <div className="text-gray-400">{user?.email}</div>
          </div>
        </div>
        {/* <UpdateProfileForm /> */}
      </div>
    </div>
  );
}
