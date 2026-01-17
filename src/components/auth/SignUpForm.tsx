
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { registerUser } from "../../store/slices/authSlice";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignUpForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
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
    if (mobile.length === 10) {
      setOtpSent(true);
      setTimer(60);
      setCanResend(false);

      console.log(`📱 Sending OTP to ${mobile}...`);
      console.log("🔐 DUMMY OTP: 1234");
    } else {
      alert("Enter valid 10 digit mobile number");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp || otp.trim() === "") {
      alert("❌ Please enter the OTP");
      return;
    }

    if (!isChecked) {
      alert("❌ Please accept the Terms and Conditions");
      return;
    }

    try {
      // @ts-ignore
      const resultAction = await dispatch(registerUser({ mobile, otp }));
      if (registerUser.fulfilled.match(resultAction)) {
        console.log("✅ Registration Successful!", resultAction.payload);
        navigate("/"); // Or redirect to specific post-signup page
      } else {
        const errorMsg = (resultAction.error as any)?.message || 'Registration failed';
        alert(`❌ Registration Failed: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error("Failed to register: ", err);
      alert("❌ An unexpected error occurred/n" + (err.message || err));
    }
  };

  const handleResendOtp = () => {
    setTimer(60);
    setCanResend(false);
    setOtp("");

    console.log(`📱 Resending OTP to ${mobile}...`);
    console.log("🔐 DUMMY OTP: 1234");
    alert(`✅ OTP resent successfully to ${mobile}\n\n🔐 Dummy OTP: 1234`);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm">
            Sign Up with Mobile
          </h1>
          <p className="text-sm text-gray-500">
            Enter your mobile number to create an account
          </p>
        </div>

        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          <div className="space-y-5">
            {/* Mobile Number */}
            <div>
              <Label>
                Mobile Number<span className="text-error-500">*</span>
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
              <div>
                <Label>
                  OTP<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Checkbox */}
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <p className="inline-block font-normal text-gray-500">
                By creating an account you agree to our{" "}
                <span className="text-gray-800">Terms and Conditions</span> and{" "}
                <span className="text-gray-800">Privacy Policy</span>
              </p>
            </div>

            {/* Button */}
            <div>
              <Button className="w-full" size="sm" type="submit">
                {otpSent ? "Verify OTP & Sign Up" : "Send OTP"}
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

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/signin" className="text-brand-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
