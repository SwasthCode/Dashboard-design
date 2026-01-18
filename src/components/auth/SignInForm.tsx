


import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

// Icons
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const PasswordInput = (props: React.ComponentProps<typeof Input>) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        {show ? <EyeIcon className="size-5" /> : <EyeOffIcon className="size-5" />}
      </button>
    </div>
  )
}

interface FormErrors {
  mobile?: string;
  otp?: string;
  username?: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function SignInForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [method, setMethod] = useState<"mobile" | "credentials">("mobile"); // Toggle login method

  // Mobile/OTP State
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Credentials State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Error State
  const [errors, setErrors] = useState<FormErrors>({});

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

  const validateMobile = () => {
    const newErrors: FormErrors = {};
    if (!mobile || mobile.length !== 10) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    } else if (!/^\d+$/.test(mobile)) {
      newErrors.mobile = "Mobile number should contain only digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors: FormErrors = {};
    if (!otp || otp.trim() === "") {
      newErrors.otp = "Please enter the OTP";
    } else if (otp.length !== 4) {
      newErrors.otp = "OTP must be 4 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCredentials = () => {
    const newErrors: FormErrors = {};

    if (!username || username.trim() === "") {
      newErrors.username = "Please enter a username";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = () => {
    const newErrors: FormErrors = {};

    if (!newPassword || newPassword.trim() === "") {
      newErrors.newPassword = "Please enter a new password";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  const handleSendOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateMobile()) return;

    // 🔥 DUMMY: Accept any 10-digit mobile number
    console.log(`📱 Sending OTP to ${mobile}...`);
    console.log("🔐 DUMMY OTP: 1234");

    setOtpSent(true);
    setTimer(60);
    setCanResend(false);
    setErrors({}); // Clear errors on success
  };

  const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateCredentials()) return;

    try {
      console.log("✅ Credentials Submitted:", { username, password });
      // @ts-ignore
      const resultAction = await dispatch(loginUser({ username, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        console.log("✅ Login Successful!", resultAction.payload);
        setErrors({});
        navigate("/"); // Redirect to root (Dashboard)
      } else {
        console.error("❌ Login Failed Action:", resultAction);
        if (resultAction.payload) {
          // Ensure payload is a string or extract message
          setErrors({ password: String(resultAction.payload) });
        } else {
          const errorMsg = (resultAction.error as any)?.message || 'Login failed';
          setErrors({ password: errorMsg });
        }
      }
    } catch (err: any) {
      console.error("❌ Login Error:", err);
      setErrors({ password: "An unexpected error occurred." });
    }
  };


  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === "signin") {
      if (!validateOtp()) return;

      try {
        // @ts-ignore
        const resultAction = await dispatch(loginUser({ mobile, otp }));
        if (loginUser.fulfilled.match(resultAction)) {
          console.log("✅ Login Successful!", resultAction.payload);
          setErrors({});
          navigate("/");
        } else {
          if (resultAction.payload) {
            // Assuming payload is string message
            setErrors({ otp: String(resultAction.payload) });
          } else {
            const errorMsg = (resultAction.error as any)?.message || 'Login failed';
            setErrors({ otp: errorMsg });
          }
        }
      } catch (err) {
        console.error("Failed to login: ", err);
        setErrors({ otp: "An unexpected error occurred. Please try again." });
      }
    } else {
      // Forgot Password Mode Validation
      if (!validateOtp()) return;
      if (!validateNewPassword()) return;

      // Verify OTP (Mock logic)
      if (otp === "1234") {
        console.log("✅ Password Reset Successful!", { mobile, otp, newPassword });
        alert(`✅ Password Reset Successful!\n\nYour password has been updated.\nYou can now sign in with your new password.`);
        // Reset to sign-in mode
        switchMode("signin");
      } else {
        setErrors((prev) => ({ ...prev, otp: "Invalid OTP. Please use OTP: 1234" }));
      }
    }
  };

  const handleResendOtp = () => {
    setTimer(60);
    setCanResend(false);
    setOtp("");
    setErrors({});

    console.log(`📱 Resending OTP to ${mobile}...`);
    console.log("🔐 DUMMY OTP: 1234");

    // Kept alert for toast-like notification or replace with toast if available
    alert(`✅ OTP resent successfully to ${mobile}\n\n🔐 Dummy OTP: 1234\n(For testing only)`);
  };

  const resetForm = () => {
    setMobile("");
    setOtp("");
    setOtpSent(false);
    setUsername("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimer(60);
    setCanResend(false);
    setErrors({});
  };

  const switchMode = (newMode: "signin" | "forgot") => {
    setMode(newMode);
    resetForm();
  };

  const handleInputChange = (setter: (val: string) => void, field: keyof FormErrors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };


  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm">
            {mode === "signin" ? "Sign In" : "Reset Password"}
          </h1>
          <p className="text-sm text-gray-500">
            {mode === "signin"
              ? "Access your dashboard using your credentials or mobile number."
              : "Enter your mobile number to reset password"}
          </p>
        </div>

        {/* Login Method Toggles */}
        {mode === "signin" && (
          <div className="flex mb-6 border-b border-gray-200">
            <button
              className={`pb-2 px-4 text-sm font-medium ${method === "mobile" ? "text-brand-500 border-b-2 border-brand-500" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => { setMethod("mobile"); resetForm(); }}
            >
              Mobile & OTP
            </button>
            <button
              className={`pb-2 px-4 text-sm font-medium ${method === "credentials" ? "text-brand-500 border-b-2 border-brand-500" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => { setMethod("credentials"); resetForm(); }}
            >
              Username & Password
            </button>
          </div>
        )}

        <form onSubmit={
          mode === "signin" && method === "credentials"
            ? handleCredentialsLogin
            : otpSent ? handleVerifyOtp : handleSendOtp
        }>
          <div className="space-y-5">

            {/* Mobile Login Flow */}
            {mode === "signin" && method === "mobile" || mode === "forgot" ? (
              <>
                {/* Mobile Number */}
                <div>
                  <Label>
                    Mobile Number <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="Enter 10 digit mobile number"
                    value={mobile}
                    onChange={handleInputChange(setMobile, "mobile")}
                    maxLength={10}
                    error={!!errors.mobile}
                    hint={errors.mobile}
                    required={false} // Custom validation
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
                        onChange={handleInputChange(setOtp, "otp")}
                        error={!!errors.otp}
                        hint={errors.otp}
                        required={false}
                      />
                    </div>

                    {/* New Password Fields - Only for Forgot Password */}
                    {mode === "forgot" && (
                      <>
                        <div>
                          <Label>
                            New Password <span className="text-error-500">*</span>
                          </Label>
                          <PasswordInput
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={handleInputChange(setNewPassword, "newPassword")}
                            error={!!errors.newPassword}
                            hint={errors.newPassword}
                            required={false}
                          />
                        </div>
                        <div>
                          <Label>
                            Confirm Password <span className="text-error-500">*</span>
                          </Label>
                          <PasswordInput
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={handleInputChange(setConfirmPassword, "confirmPassword")}
                            error={!!errors.confirmPassword}
                            hint={errors.confirmPassword}
                            required={false}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

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
              </>
            ) : (
              /* Username/Password Login Flow */
              <>
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={handleInputChange(setUsername, "username")}
                    error={!!errors.username}
                    hint={errors.username}
                    required={false}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <PasswordInput
                    placeholder="Enter password"
                    value={password}
                    onChange={handleInputChange(setPassword, "password")}
                    error={!!errors.password}
                    hint={errors.password}
                    required={false}
                  />
                  {!errors.password && (
                    <p className="mt-1 text-xs text-gray-400">
                      Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
                    </p>
                  )}
                </div>
              </>
            )}


            {/* Forgot Password Link - Only show in Sign In mode before OTP */}
            {mode === "signin" && !otpSent && method === "mobile" && (
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
                {mode === "signin"
                  ? method === "credentials" ? "Sign In" : otpSent ? "Verify OTP & Sign In" : "Send OTP"
                  : otpSent ? "Reset Password" : "Send OTP"
                }
              </Button>
            </div>


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
          {/* <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600">
              Sign Up
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}

