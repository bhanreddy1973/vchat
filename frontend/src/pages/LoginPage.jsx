import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon, MailIcon, LoaderIcon, LockIcon } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Add validation
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    if (!formData.password.trim()) {
      toast.error('Password is required');
      return;
    }

    try {
      await login(formData);
      navigate("/");
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // ✅ Fixed container sizing - same as SignUpPage
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 overflow-hidden">
      <div className="relative w-full max-w-5xl h-[85vh] max-h-[700px]"> {/* ✅ Smaller and consistent size */}
        <BorderAnimatedContainer>
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-6 md:p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-6"> {/* ✅ Reduced margin */}
                  <MessageCircleIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" /> {/* ✅ Smaller icon */}
                  <h2 className="text-xl md:text-2xl font-bold text-slate-200 mb-2">Welcome Back</h2>
                  <p className="text-sm text-slate-400">Login to access your account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4"> {/* ✅ Reduced spacing */}
                  {/* EMAIL INPUT */}
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="bhanu@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button className="auth-btn" type="submit" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <LoaderIcon className="w-5 h-5 animate-spin mx-auto" /> /* ✅ Fixed centering */
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center"> {/* ✅ Reduced margin */}
                  <Link to="/signup" className="auth-link">
                    Don't have an account? Sign Up
                  </Link>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:flex md:w-1/2 items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div className="text-center">
                {/* ✅ Limited max width */}
                <img
                  src="/login.png"
                  alt="People using mobile devices"
                  className="w-full max-w-sm h-auto object-contain mx-auto"
                />
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-cyan-400 mb-4">Connect anytime, anywhere</h3>
                  <div className="flex justify-center gap-3">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default LoginPage;