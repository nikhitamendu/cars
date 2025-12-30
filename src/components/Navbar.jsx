import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { FaCarSide, FaTachometerAlt } from "react-icons/fa";

export default function Navbar() {
  const { user, role } = useContext(AuthContext);

  return (
    <>
      {/* ================= LUXURY NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg navbar-dark luxury-navbar sticky-top">
        <div className="container-fluid px-4">

          {/* Brand */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <FaCarSide size={28} className="brand-icon" />
            <span className="brand-text">Elite Motors</span>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Items */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2">

              {!user && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/login">Login</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link highlight-link" to="/register">
                      Register
                    </NavLink>
                  </li>
                </>
              )}

              {user && role === "customer" && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/my-bookings">
                      My Bookings
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/my-enquiries">
                      My Enquiries
                    </NavLink>
                  </li>
                </>
              )}

              {user && role === "admin" && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin">Cars</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/dashboard">
                      <FaTachometerAlt className="me-1" /> Dashboard
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin-bookings">
                      Bookings
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin-enquiries">
                      Enquiries
                    </NavLink>
                  </li>
                </>
              )}

              {user && (
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm logout-btn"
                    onClick={() => signOut(auth)}
                  >
                    Logout
                  </button>
                </li>
              )}

            </ul>
          </div>
        </div>
      </nav>

      {/* ================= STYLES ================= */}
      <style>{`
        .luxury-navbar {
          background: linear-gradient(90deg, #000000, #111111);
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
          backdrop-filter: blur(6px);
        }

        .brand-text {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #FFD700;
        }

        .brand-icon {
          color: #FFD700;
        }

        .navbar-nav .nav-link {
          color: #e0e0e0;
          font-weight: 500;
          padding: 6px 14px;
          transition: all 0.3s ease;
        }

        .navbar-nav .nav-link:hover {
          color: #FFD700;
          transform: translateY(-1px);
        }

        .navbar-nav .nav-link.active {
          color: #FFD700;
          border-bottom: 2px solid #FFD700;
        }

        .highlight-link {
          background: #FFD700;
          color: #000 !important;
          border-radius: 20px;
          padding: 6px 16px !important;
          font-weight: 600;
        }

        .highlight-link:hover {
          background: #ffcc00;
        }

        .logout-btn {
          border-radius: 20px;
          padding: 5px 14px;
        }

        /* Mobile Styling */
        @media (max-width: 991px) {
          .navbar-nav {
            padding-top: 1rem;
          }

          .navbar-nav .nav-link {
            padding: 10px;
            text-align: center;
          }

          .navbar-nav .nav-link.active {
            border-bottom: none;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 8px;
          }
        }
      `}</style>
    </>
  );
}
