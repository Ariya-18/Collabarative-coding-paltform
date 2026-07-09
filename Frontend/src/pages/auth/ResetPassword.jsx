import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { resetPasswordApi } from "../../services/authService";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await resetPasswordApi(token, data.password);
      toast.success("Password reset successful. Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted">New Password</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Min 6 characters" },
            })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-primary"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword", {
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-primary"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset Password
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;