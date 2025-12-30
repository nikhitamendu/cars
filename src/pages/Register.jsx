import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        email,
        role: "customer",
        createdAt: new Date(),
      });

      alert("Registration successful");
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: "#f4f6f9" }}
    >
      <div className="card shadow-lg" style={{ maxWidth: "900px", width: "100%" }}>
        <div className="row g-0">

          {/* LEFT IMAGE */}
          <div className="col-md-6 d-none d-md-block position-relative">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
              alt="Register"
              className="img-fluid h-100 rounded-start"
              style={{ objectFit: "cover" }}
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <div className="text-center px-3">
                <h3 className="fw-bold">Join Us Today</h3>
                <p className="small">
                  Create an account to access exclusive features
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="col-md-6 p-5">
            <h3 className="text-center mb-4 fw-bold">
              <i className="bi bi-person-plus-fill me-2 text-success"></i>
              Register
            </h3>

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
                onChange={e => setEmail(e.target.value)}
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
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              className="btn btn-success w-100 py-2 fw-semibold"
              onClick={register}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Registering...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Create Account
                </>
              )}
            </button>

            <p className="text-center text-muted mt-3 mb-0">
              Already have an account?{" "}
              <span
                className="text-success fw-semibold"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
