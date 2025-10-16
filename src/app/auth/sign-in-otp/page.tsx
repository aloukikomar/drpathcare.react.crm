import SignInFormOTP from "@/components/auth/sign-in-form-otp";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

export default function SignInPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // example gradient
        background: "linear-gradient(rgba(50, 32, 248, 0.3), rgba(255,255,255,0.3)),url('/assets/login-bg.jpg') no-repeat center/cover"
      }}
    >
      
        <SignInFormOTP />
    </Box>
  );
}