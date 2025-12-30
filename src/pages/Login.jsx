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
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: darkMode ? "#121212" : "#f4f6f9" }}
    >
      {/* THEME TOGGLE */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
        style={{ position: "absolute", top: 15, right: 15 }}
      >
        {darkMode ? "🌞 Light" : "🌙 Dark"}
      </button>

      <div className="card shadow-lg" style={{ maxWidth: "900px", width: "100%" }}>
        <div className="row g-0">

          {/* LEFT IMAGE */}
          <div className="col-md-6 d-none d-md-block position-relative">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="Login"
              className="img-fluid h-100 rounded-start"
              style={{ objectFit: "cover" }}
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <div className="text-center px-4">
                <h3 className="fw-bold">Welcome Back</h3>
                <p className="small">
                  Login to continue managing your account
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div
            className={`col-md-6 p-5 ${
              darkMode ? "bg-dark text-light" : ""
            }`}
          >
            <h3 className="text-center mb-4 fw-bold">
              <i className="bi bi-box-arrow-in-right me-2 text-primary"></i>
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
                <i className="bi bi-person me-1"></i> Customer
              </button>
              <button
                className={`btn ${
                  role === "admin"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setRole("admin")}
              >
                <i className="bi bi-shield-lock me-1"></i> Admin
              </button>
            </div>

            {/* EMAIL */}
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-envelope-fill"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div className="input-group mb-4">
              <span className="input-group-text">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* LOGIN BUTTON */}
            <button
              className="btn btn-primary w-100 py-2 fw-semibold"
              onClick={login}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Login as {role}
                </>
              )}
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
  );
}
