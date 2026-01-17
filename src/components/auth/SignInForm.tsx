


import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation: Check if mobile number is 10 digits
    if (mobile.length !== 10) {
      alert("❌ Please enter a valid 10-digit mobile number");
      return;
    }

    // Validation: Check if mobile number contains only digits
    if (!/^\d+$/.test(mobile)) {
      alert("❌ Mobile number should contain only digits");
      return;
    }

    // 🔥 DUMMY: Accept any 10-digit mobile number
    // In production, this will be an API call
    console.log(`📱 Sending OTP to ${mobile}...`);
    console.log("🔐 DUMMY OTP: 1234");

    setOtpSent(true);
    setTimer(60);
    setCanResend(false);
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const dispatch = useDispatch();

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation: Check if OTP is entered
    if (!otp || otp.trim() === "") {
      alert("❌ Please enter the OTP");
      return;
    }

    // Validation: Check if OTP is 4 digits
    if (otp.length !== 4) {
      alert("❌ OTP must be 4 digits");
      return;
    }

    if (mode === "signin") {
      try {
        // @ts-ignore
        const resultAction = await dispatch(loginUser({ mobile, otp }));
        if (loginUser.fulfilled.match(resultAction)) {
          console.log("✅ Login Successful!", resultAction.payload);
          navigate("/");
        } else {
          if (resultAction.payload) {
            alert(`❌ Login Failed: ${resultAction.payload}`);
          } else {
            const errorMsg = (resultAction.error as any)?.message || 'Login failed';
            alert(`❌ Login Failed: ${errorMsg}`);
          }
        }
      } catch (err) {
        console.error("Failed to login: ", err);
        alert("❌ An unexpected error occurred/n" + err);
      }
    } else {
      // Forgot Password Mode Validation

      // Validate new password
      if (!newPassword || newPassword.trim() === "") {
        alert("❌ Please enter a new password");
        return;
      }

      if (newPassword.length < 6) {
        alert("❌ Password must be at least 6 characters long");
        return;
      }

      // Validate password match
      if (newPassword !== confirmPassword) {
        alert("❌ Passwords do not match");
        return;
      }

      // Verify OTP (Mock logic for password reset stays local for now, as API might be different)
      if (otp === "1234") {
        console.log("✅ Password Reset Successful!", { mobile, otp, newPassword });
        alert(`✅ Password Reset Successful!\n\nYour password has been updated.\nYou can now sign in with your new password.`);
        // Reset to sign-in mode
        switchMode("signin");
      } else {
        alert("❌ Invalid OTP\n\nPlease use OTP: 1234");
      }
    }
  };

  const handleResendOtp = () => {
    setTimer(60);
    setCanResend(false);
    setOtp("");

    console.log(`📱 Resending OTP to ${mobile}...`);
    console.log("🔐 DUMMY OTP: 1234");

    alert(`✅ OTP resent successfully to ${mobile}\n\n🔐 Dummy OTP: 1234\n(For testing only)`);
  };

  const resetForm = () => {
    setMobile("");
    setOtp("");
    setOtpSent(false);
    setNewPassword("");
    setConfirmPassword("");
    setTimer(60);
    setCanResend(false);
  };

  const switchMode = (newMode: "signin" | "forgot") => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="flex flex-col flex-1">
      {/* <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div> */}

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm">
            {mode === "signin" ? "Sign In with Mobile" : "Reset Password"}
          </h1>
          <p className="text-sm text-gray-500">
            {mode === "signin"
              ? "Enter your mobile number to receive OTP"
              : "Enter your mobile number to reset password"}
          </p>
        </div>

        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          <div className="space-y-5">
            {/* Mobile Number */}
            <div>
              <Label>
                Mobile Number <span className="text-error-500">*</span>
              </Label>
              <Input
                type="tel"
                placeholder="Enter 10 digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={10}
                required
              />
            </div>

            {/* OTP */}
            {otpSent && (
              <>
                <div>
                  <Label>
                    OTP <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                {/* New Password Fields - Only for Forgot Password */}
                {mode === "forgot" && (
                  <>
                    <div>
                      <Label>
                        New Password <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>
                        Confirm Password <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Forgot Password Link - Only show in Sign In mode before OTP */}
            {mode === "signin" && !otpSent && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-sm text-brand-500 hover:text-brand-600"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <Button className="w-full" size="sm" type="submit">
                {otpSent
                  ? mode === "signin"
                    ? "Verify OTP & Sign In"
                    : "Reset Password"
                  : "Send OTP"}
              </Button>
            </div>

            {/* Resend OTP */}
            {otpSent && (
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Didn't receive OTP?{" "}
                    <span className="text-brand-500 hover:text-brand-600">
                      Resend
                    </span>
                  </button>
                ) : (
                  <p className="text-sm text-gray-600">
                    Resend OTP in{" "}
                    <span className="font-semibold text-brand-500">
                      {timer}s
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-5 text-center space-y-2">
          {mode === "forgot" && (
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <button
                onClick={() => switchMode("signin")}
                className="text-brand-500 hover:text-brand-600"
              >
                Sign In
              </button>
            </p>
          )}
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

