import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { loginApi } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await loginApi(data);
      login(res.data);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to continue">
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

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm text-muted">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-primary"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Log In
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;