// TODO: Halaman profil user dan pengaturan akun
export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Profil Pengguna</h1>
      <div className="bg-background-lighter p-6 rounded-xl border border-gray-700 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-full" />
          <div>
            <div className="text-xl font-semibold">User Name Placeholder</div>
            <div className="text-gray-400">user@example.com</div>
          </div>
        </div>
        {/* <UpdateProfileForm /> */}
      </div>
    </div>
  );
}
