import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateProfileApi } from "../../services/authService";
import { changePasswordApi } from "../../services/authService";

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const [tab, setTab] = useState("profile");

  const profileForm = useForm({ defaultValues: { name: user?.name, bio: user?.bio } });
  const passForm = useForm();

  const onProfileSave = async (data) => {
    try {
      const res = await updateProfileApi(data);
      setUser({ ...user, ...res.data });
      toast.success("Profile updated");
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
  };

  const onPasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) return toast.error("Passwords don't match");
    try {
      await changePasswordApi(data);
      toast.success("Password changed");
      passForm.reset();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to change password"); }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold text-white">Settings</h1>

      <div className="mb-6 flex gap-2 border-b border-white/10">
        {["profile", "security"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${tab === t ? "border-b-2 border-primary text-white" : "text-muted"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="glass space-y-4 rounded-xl2 p-6">
          <div>
            <label className="mb-1 block text-sm text-muted">Name</label>
            <input {...profileForm.register("name")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Bio</label>
            <textarea {...profileForm.register("bio")} rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={profileForm.formState.isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium hover:bg-primary/90">
            {profileForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      )}

      {tab === "security" && (
        <form onSubmit={passForm.handleSubmit(onPasswordChange)} className="glass space-y-4 rounded-xl2 p-6">
          <div>
            <label className="mb-1 block text-sm text-muted">Current Password</label>
            <input type="password" {...passForm.register("currentPassword", { required: true })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">New Password</label>
            <input type="password" {...passForm.register("newPassword", { required: true, minLength: 6 })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Confirm New Password</label>
            <input type="password" {...passForm.register("confirmPassword", { required: true })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-primary" />
          </div>
          <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 font-medium hover:bg-primary/90">
            Update Password
          </button>

          <div className="mt-6 border-t border-white/10 pt-4">
            <button type="button" onClick={logout} className="text-sm text-danger hover:underline">
              Log out of this account
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;