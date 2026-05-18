import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MessageCircleIcon,
  LoaderIcon,
} from "lucide-react";

import toast from "react-hot-toast";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useAuthStore } from "../store/useAuthStore";

function EmailVerificationPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { verifyEmail, isVerifyingEmail } = useAuthStore();

  // HANDLE INPUT CHANGE
  const handleChange = (index, value) => {
    const newCode = [...code];

    // HANDLE PASTE
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");

      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }

      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex(
        (digit) => digit !== ""
      );

      const focusIndex =
        lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;

      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      // MOVE TO NEXT INPUT
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // HANDLE BACKSPACE
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const verificationCode = code.join("");

      await verifyEmail({ code: verificationCode });

      toast.success("Email verified successfully!");

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  // AUTO SUBMIT
  useEffect(() => {
  if (code.every((digit) => digit !== "")) {
    const submit = async () => {
      try {
        const verificationCode = code.join("");

        await verifyEmail({ code: verificationCode });

        navigate("/");
      } catch (error) {
        console.log(error);
      }
    };

    submit();
  }
}, [code]);

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900 ">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* LEFT SIDE */}
            <div className="w-full p-8 flex items-center justify-center  ">
              <div className="w-full max-w-md">
                {/* HEADER */}
                <div className="text-center mb-8 no-interaction">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-cyan-400 mb-4" />

                  <h2 className="text-3xl font-bold text-slate-200 mb-2">
                    Verify Your Email
                  </h2>

                  <p className="text-slate-400">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                {/* FORM */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* CODE INPUTS */}
                  <div className="flex justify-between gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) =>
                          (inputRefs.current[index] = el)
                        }
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) =>
                          handleChange(index, e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(index, e)
                        }
                        className="w-12 h-14 md:w-14 md:h-16 bg-slate-800 border border-slate-700 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      />
                    ))}
                  </div>

                  {/* BUTTON */}
                  <button
                    type="submit"
                    disabled={
                      isVerifyingEmail ||
                      code.some((digit) => !digit)
                    }
                    className="auth-btn"
                  >
                    {isVerifyingEmail ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "Verify Email"
                    )}
                  </button>
                </form>

                {/* FOOTER */}
                <div className="mt-6 text-center no-interaction">
                  <Link to="/signup" className="auth-link">
                    Back to Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default EmailVerificationPage;
