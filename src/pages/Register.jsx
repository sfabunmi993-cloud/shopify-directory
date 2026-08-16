import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import GoogleIcon from "@/components/GoogleIcon";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SHOPIFY_LOGO =
  "https://cdn.shopify.com/b/shopify-brochure2-assets/08b278c519512d187520e1fe10b4f5b7.svg";

const fallIn = {
  initial: { y: "-100vh", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { type: "spring", stiffness: 90, damping: 18, mass: 0.8 }
};

function AppleIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.26 3.18-.84.98-1.86 1.54-2.94 1.46-.13-1.06.42-2.18 1.2-3 .78-.82 1.86-1.36 3-1.64zM20.4 17.36c-.36.84-.54 1.22-1.02 1.96-.66 1-1.6 2.24-2.76 2.25-1.04.01-1.3-.68-2.7-.67-1.4.01-1.7.69-2.74.67-1.16-.02-2.04-1.14-2.7-2.14-1.86-2.82-2.06-6.12-.9-7.88.62-.98 1.6-1.56 2.52-1.56 1.18 0 1.52.76 2.84.76 1.32 0 1.6-.74 2.84-.74.92 0 1.9.5 2.6 1.4-2.28 1.24-1.9 4.48.02 5.95z" />
    </svg>
  );
}

function FacebookIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 01-4.82-1.32l-.35-.2-3.57.94.95-3.49-.23-.36a9.46 9.46 0 01-1.45-5.04c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.77a9.42 9.42 0 012.77 6.71c0 5.22-4.25 9.46-9.47 9.46zM20.52 3.49A11.78 11.78 0 0012.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.23-1.63a11.94 11.94 0 005.81 1.48h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.47-8.42z" />
    </svg>
  );
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [humanChecked, setHumanChecked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = "/become-a-partner";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast.success("Code sent — check your email for the new code.");
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/");
  const handleApple = () => base44.auth.loginWithProvider("apple", "/");
  const handleFacebook = () => base44.auth.loginWithProvider("facebook", "/");
  const handleUnsupported = () => toast("This sign-in option isn't available yet");

  if (showOtp) {
    return (
      <div className="min-h-screen bg-[#0b0c0d] flex flex-col items-center justify-center px-4 py-10">
        <img src={SHOPIFY_LOGO} alt="Shopify" className="w-8 h-8 mb-6" />
        <motion.div variants={fallIn} initial="initial" animate="animate" className="w-full max-w-[440px]">
          <div className="w-full bg-white rounded-2xl px-8 py-10 shadow-xl">
            <h1 className="text-[28px] font-bold text-[#212326] leading-tight">Verify your email</h1>
            <p className="text-[15px] text-[#6d7175] mt-1 mb-8">We sent a code to {email}</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                autoFocus
                autoComplete="one-time-code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || otpCode.length < 6}
              className="w-full h-11 rounded-lg bg-[#006fbb] hover:bg-[#005a99] text-white text-[15px] font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </button>

            <p className="text-center text-[14px] text-[#6d7175] mt-4">
              Didn't receive the code?{" "}
              <button onClick={handleResend} className="text-[#006fbb] font-medium hover:underline">
                Resend
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0d] flex flex-col items-center justify-center px-4 py-10">
      <motion.img
        src={SHOPIFY_LOGO}
        alt="Shopify"
        className="w-8 h-8 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      />

      <motion.div variants={fallIn} initial="initial" animate="animate" className="w-full max-w-[440px]">
        <div className="w-full bg-white rounded-2xl px-8 py-10 shadow-xl">
          <h1 className="text-[28px] font-bold text-[#212326] leading-tight">Create account</h1>
          <p className="text-[15px] text-[#6d7175] mt-1 mb-8">Continue to Shopify</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-medium text-[#212326]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-[#c9ccd1] focus:border-[#006fbb] focus:ring-[#006fbb] text-[15px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] font-medium text-[#212326]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg border-[#c9ccd1] focus:border-[#006fbb] focus:ring-[#006fbb] text-[15px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-[13px] font-medium text-[#212326]">
                Confirm Password
              </Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-lg border-[#c9ccd1] focus:border-[#006fbb] focus:ring-[#006fbb] text-[15px]"
                required
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[#c9ccd1] p-3">
              <button
                type="button"
                onClick={() => setHumanChecked((v) => !v)}
                className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                  humanChecked ? "bg-[#006fbb] border-[#006fbb]" : "bg-white border-[#c9ccd1]"
                }`}
                aria-pressed={humanChecked}
                aria-label="I am human"
              >
                {humanChecked && <ShieldCheck className="w-3.5 h-3.5 text-white" />}
              </button>
              <div className="flex-1">
                <p className="text-[14px] text-[#212326] font-medium">I am human</p>
                <p className="text-[11px] text-[#6d7175] mt-0.5">Privacy - Terms</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-11 rounded-lg bg-[#e8e8e8] text-white text-[15px] font-medium enabled:bg-[#006fbb] enabled:hover:bg-[#005a99] transition-colors"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e1e3e5]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[13px] text-[#6d7175]">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUnsupported}
            className="w-full h-11 rounded-lg bg-[#f6f6f7] hover:bg-[#ececee] text-[#212326] text-[15px] font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-[#212326] text-white inline-flex items-center justify-center text-[10px]">
              <ShieldCheck className="w-3 h-3" />
            </span>
            Sign in with passkey
          </button>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={handleGoogle}
              aria-label="Continue with Google"
              className="w-11 h-11 rounded-lg border border-[#c9ccd1] hover:bg-[#f6f6f7] inline-flex items-center justify-center transition-colors"
            >
              <GoogleIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleApple}
              aria-label="Continue with Apple"
              className="w-11 h-11 rounded-lg bg-[#212326] hover:opacity-90 text-white inline-flex items-center justify-center transition-opacity"
            >
              <AppleIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleFacebook}
              aria-label="Continue with Facebook"
              className="w-11 h-11 rounded-lg bg-[#1877f2] hover:opacity-90 text-white inline-flex items-center justify-center transition-opacity"
            >
              <FacebookIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleUnsupported}
              aria-label="Continue with WhatsApp"
              className="w-11 h-11 rounded-lg bg-[#25d366] hover:opacity-90 text-white inline-flex items-center justify-center transition-opacity"
            >
              <WhatsAppIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <p className="text-[15px] text-white mt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-[#006fbb] font-medium hover:underline">
          Log in →
        </Link>
      </p>
    </div>
  );
}