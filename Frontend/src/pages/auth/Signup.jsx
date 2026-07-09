import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { signupApi } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await signupApi(data);
      login(res.data);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Start collaborating in real time">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Full Name</label>
          <input
            {...register("name", { required: "Name is required" })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none focus:border-primary"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
          )}
        </div>

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
          <label className="mb-1 block text-sm text-muted">Password</label>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign Up
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;