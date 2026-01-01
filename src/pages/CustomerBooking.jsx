import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function CustomerBooking() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("bookingDark") === "true"
  );

  useEffect(() => {
    localStorage.setItem("bookingDark", darkMode);
  }, [darkMode]);

  /* ================= FETCH BOOKINGS ================= */
  const fetchBookings = async () => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid)
    );
    const snap = await getDocs(q);
    setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  /* ================= CANCEL ================= */
  const cancelBooking = async (booking) => {
    const res = await Swal.fire({
      title: "Cancel booking?",
      text: "Stock will be restored automatically",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, cancel it",
    });

    if (!res.isConfirmed) return;

    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
      });

      Swal.fire("Cancelled", "Booking cancelled successfully", "success");
      fetchBookings();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  /* ================= GROUP ================= */
  const active = bookings.filter(b => b.status !== "cancelled");
  const cancelled = bookings.filter(b => b.status === "cancelled");

  const bg = darkMode ? "#020617" : "#f4f6fb";
  const card = darkMode ? "#0f172a" : "#ffffff";
  const text = darkMode ? "#e5e7eb" : "#020617";
  const muted = darkMode ? "#94a3b8" : "#64748b";

  return (
    <div style={{ background: bg, minHeight: "100vh", color: text }}>
      <div className="container py-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">📦 My Bookings</h2>
            <p style={{ color: muted }}>Manage your bookings</p>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* ACTIVE BOOKINGS */}
        <h5 className="fw-bold mb-3">Active</h5>
        <div className="row g-4">
          {active.map(b => (
            <div key={b.id} className="col-md-6">
              <div className="card border-0 shadow-sm" style={{ background: card }}>
                <div className="card-body">
                  <h5 className="fw-bold">
                    🚗 {b.brand} {b.model}
                  </h5>

                  <small style={{ color: muted }}>
                    📅 {b.bookingDate?.toDate().toLocaleDateString()}
                  </small>

                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <span className="badge bg-warning text-dark">
                      {b.status.toUpperCase()}
                    </span>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/car/${b.carId}`)}
                      >
                        View
                      </button>

                      {b.status === "pending" && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cancelBooking(b)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CANCELLED */}
        <h5 className="fw-bold mt-5 mb-3 text-danger">Cancelled</h5>
        {cancelled.length === 0 && (
          <p style={{ color: muted }}>No cancelled bookings</p>
        )}

        <div className="row g-4">
          {cancelled.map(b => (
            <div key={b.id} className="col-md-6">
              <div
                className="card border-0 shadow-sm"
                style={{ background: card, opacity: 0.7 }}
              >
                <div className="card-body">
                  <h6 className="fw-bold">
                    🚗 {b.brand} {b.model}
                  </h6>
                  <span className="badge bg-danger">CANCELLED</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
