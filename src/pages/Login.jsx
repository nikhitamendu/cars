import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(role === "admin" ? "/admin" : "/");
    } catch {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        minHeight: "100svh",
        background: darkMode ? "#121212" : "#f4f6f9",
      }}
    >
      {/* THEME TOGGLE */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
        style={{ position: "absolute", top: 15, right: 15, zIndex: 10 }}
      >
        {darkMode ? "🌞 Light" : "🌙 Dark"}
      </button>

      <div className="login-wrapper">
        <div className="card login-card shadow-lg">
          <div className="row g-0 h-100">

            {/* LEFT IMAGE */}
            <div className="col-md-6 d-none d-md-block position-relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                alt="Login"
                className="login-img"
              />
              <div className="login-overlay">
                <div className="text-center px-4">
                  <h3 className="fw-bold">Welcome Back</h3>
                  <p className="small">
                    Login to continue managing your account
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className={`col-md-6 p-5 ${darkMode ? "bg-dark text-light" : ""}`}>
              <h3 className="text-center mb-4 fw-bold">
                Login
              </h3>

              {/* ROLE SELECTOR */}
              <div className="d-flex justify-content-center mb-3">
                <button
                  className={`btn me-2 ${
                    role === "customer"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setRole("customer")}
                >
                  Customer
                </button>
                <button
                  className={`btn ${
                    role === "admin"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setRole("admin")}
                >
                  Admin
                </button>
              </div>

              {/* EMAIL */}
              <div className="input-group mb-3">
                <span className="input-group-text">@</span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* PASSWORD */}
              <div className="input-group mb-4">
                <span className="input-group-text">🔒</span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              {/* LOGIN BUTTON */}
              <button
                className="btn btn-primary w-100 py-2 fw-semibold"
                onClick={login}
                disabled={loading}
              >
                {loading ? "Logging in..." : `Login as ${role}`}
              </button>

              <p className="text-center text-muted mt-3 mb-0">
                Don’t have an account?{" "}
                <span
                  className="text-primary fw-semibold"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/register")}
                >
                  Register
                </span>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .login-wrapper {
          width: 100%;
          max-width: 900px;
          padding: 16px;
        }

        .login-card {
          border-radius: 16px;
          overflow: hidden;
          height: 100%;
        }

        .login-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .login-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        /* MOBILE FIX */
        @media (max-width: 768px) {
          .login-wrapper {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}