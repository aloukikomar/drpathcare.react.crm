"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";
import { sendOtp, verifyOtp } from "@/api/auth";
import { Box, Typography, TextField, Button, Paper, Link } from "@mui/material";

export default function SignInFormOTP() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("AuthContext not found");
  const { login } = authContext;

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const validateMobile = (value: string) => /^[0-9]{10}$/.test(value); // adjust length if needed
  const validateOtp = (value: string) => /^[0-9]{4}$/.test(value); // 4-digit OTP

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateMobile(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await sendOtp(mobile);
      setStep("otp");
      setTimer(30);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateOtp(otp)) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await verifyOtp(mobile, otp);
      login(data.user, data.access, data.refresh);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // countdown effect
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={4} sx={{ p: 6, width: 400, borderRadius: 3 }}>
        <Box
          component="img"
          src="/assets/logo.png"
          alt="Logo"
          sx={{ width: 300, height: 100, mr: 1.5, objectFit: "contain" }}
        />
        <Typography variant="h5" mt={3} mb={3} align="center">
          Sign in to CRM
        </Typography>

        {step === "mobile" ? (
          <form onSubmit={handleSendOtp}>
            <TextField
              type="text"
              required
              fullWidth
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} // allow only digits
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 10 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading || !mobile}
            >
              {loading ? "Sending..." : "Get OTP"}
            </Button>

            <Typography variant="body2" color="text.secondary" align="center" mt={3}>
              For any issue, contact support at{" "}
              <Link href="mailto:info@drpathcare.com " underline="hover" sx={{ fontWeight: 600 }}>
                info@drpathcare.com 
              </Link>
            </Typography>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <Typography variant="body2" color="text.secondary" align="center" mb={2}>
              SMS sent to number <strong>{mobile}</strong>
            </Typography>

            <TextField
              type="text"
              required
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 4 }}
            />

            <Box display="flex" gap={2}>
              <Button fullWidth variant="contained" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button fullWidth variant="outlined" onClick={() => setStep("mobile")}>
                Back
              </Button>
            </Box>

            {timer > 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                Resend OTP in {timer}s
              </Typography>
            ) : (
              <Button variant="text" fullWidth onClick={handleSendOtp}>
                Resend OTP
              </Button>
            )}
            <Typography variant="body2" color="text.secondary" align="center" mt={3}>
              For any issue, contact support at{" "}
              <Link href="mailto:info@drpathcare.com " underline="hover" sx={{ fontWeight: 600 }}>
                info@drpathcare.com 
              </Link>
            </Typography>
          </form>
        )}

        {error && (
          <Typography color="error" mt={2} align="center">
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
