import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { forgotPasswordApi } from "../../services/authService";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await forgotPasswordApi(data.email);
      toast.success("Reset link sent! Check your email.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="We'll send you a link to reset it"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Email</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-primary"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Reset Link
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Remembered your password?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;