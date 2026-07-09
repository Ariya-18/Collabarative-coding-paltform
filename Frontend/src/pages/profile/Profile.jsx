import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Camera, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { updateProfileApi, updateProfilePictureApi } from "../../services/authService";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await updateProfileApi(data);
      setUser({ ...user, ...res.data });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    setUploading(true);
    try {
      const res = await updateProfilePictureApi(formData);
      setUser({ ...user, profilePicture: res.data.profilePicture });
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl p-6"
    >
      <div className="glass rounded-xl2 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <img
              src={
                user?.profilePicture
                  ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}${user.profilePicture}`
                  : `https://ui-avatars.com/api/?name=${user?.name}&background=6366F1&color=fff`
              }
              alt="avatar"
              className="h-20 w-20 rounded-full border-2 border-primary object-cover"
            />
            <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-1.5 hover:bg-primary/90">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.name}</h2>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted">Name</label>
            <input
              {...register("name")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">Bio</label>
            <textarea
              {...register("bio")}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Profile;