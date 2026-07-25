import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { verifyEmailApi, resendOtpApi } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email || "";

  const [digits, setDigits] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyEmailApi(email, otp);
      login(res.data);
      toast.success("Email verified! Welcome to CodeShare.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOtpApi(email);
      toast.success("New code sent to your email");
      setCooldown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout title="Verify Email">
        <p className="text-center text-sm text-muted">
          Missing email context.{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Go back to signup
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verify Your Email" subtitle={`Code sent to ${email}`}>
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="h-12 w-11 rounded-lg border border-white/10 bg-white/5 text-center text-lg font-semibold text-white outline-none focus:border-primary"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify Email
        </button>

        <p className="text-center text-sm text-muted">
          Didn't get the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending..." : "Resend code"}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyEmail;