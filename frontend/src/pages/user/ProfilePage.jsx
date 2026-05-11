import useAuthStore from "../../stores/use-auth-store";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <div className="bg-background-lighter p-6 rounded-xl border border-my-border space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-full" />
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
