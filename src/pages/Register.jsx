import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    if (!name || !mobile || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (mobile.length !== 10) {
      alert("Mobile number must be 10 digits");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);  //creates user in firebase authentication

      await updateProfile(res.user, {
        displayName: name,  //saves the user name in firebase auth profile
      });

      await setDoc(doc(db, "users", res.user.uid), {    //creates a firestore document
        name,
        mobile,
        email,
        role: "customer",
        createdAt: serverTimestamp(),
      });

      alert("Registration successful");

      // ✅ REDIRECT TO LOGIN
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
          <div className="col-md-6 d-none d-md-block position-relative">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
              alt="Register"
              className="img-fluid h-100 rounded-start"
              style={{ objectFit: "cover" }}
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white"
              style={{ background: "rgba(0,0,0,0.55)" }}  //darkoverlay over
            >
              <div className="text-center px-3">
                <h3 className="fw-bold">Join Us Today</h3>
                <p className="small">
                  Create an account to access exclusive features
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 p-5">
            <h3 className="text-center mb-4 fw-bold">Register</h3>

            <input
              className="form-control mb-3"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              className="form-control mb-3"
              placeholder="Mobile Number"
              value={mobile}
              maxLength={10}
              onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
            />

            <input
              className="form-control mb-3"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="form-control mb-4"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              className="btn btn-success w-100"
              onClick={register}
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
