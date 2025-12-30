import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminBooking() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("adminBookingDark") === "true"
  );

  /* ================= THEME ================= */
  useEffect(() => {
    localStorage.setItem("adminBookingDark", darkMode);
  }, [darkMode]);

  const theme = {
    bg: darkMode ? "#020617" : "#f4f6fb",
    card: darkMode ? "#0f172a" : "#ffffff",
    text: darkMode ? "#e5e7eb" : "#0f172a",
    muted: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "#1e293b" : "#e5e7eb",
    header: darkMode
      ? "linear-gradient(90deg, #020617, #020617)"
      : "linear-gradient(90deg, #2563eb, #1e40af)",
  };

  /* ================= FETCH BOOKINGS ================= */
  const fetchBookings = async () => {
    const snap = await getDocs(collection(db, "bookings"));
    setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ================= UPDATE STATUS + AUTO STOCK ================= */
  const updateStatus = async (booking, status) => {
    try {
      if (status === "accepted") {
        const carRef = doc(db, "cars", booking.carId);
        const carSnap = await getDoc(carRef);

        if (!carSnap.exists()) {
          toast.error("Car not found");
          return;
        }

        const carData = carSnap.data();
        if ((carData.stock || 0) <= 0) {
          toast.error("No stock available");
          return;
        }

        await updateDoc(carRef, { stock: carData.stock - 1 });
      }

      await updateDoc(doc(db, "bookings", booking.id), { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  /* ================= STATS ================= */
  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const accepted = bookings.filter(b => b.status === "accepted").length;
  const rejected = bookings.filter(b => b.status === "rejected").length;

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter(b => b.status === filter);

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: "100vh", color: theme.text }}>
      <ToastContainer position="top-right" />

      <div className="container-fluid py-4">

        {/* HEADER */}
        <div
          className="card mb-4 border-0"
          style={{
            background: theme.header,
            color: "#fff",
            borderRadius: 12,
          }}
        >
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h3 className="fw-bold mb-1">📘 Booking Management</h3>
              <small>Approve bookings & auto-manage stock</small>
            </div>

            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="row g-3 mb-4">
          <Stat title="Total" value={total} color="#2563eb" theme={theme} />
          <Stat title="Pending" value={pending} color="#f59e0b" theme={theme} />
          <Stat title="Accepted" value={accepted} color="#16a34a" theme={theme} />
          <Stat title="Rejected" value={rejected} color="#dc2626" theme={theme} />
        </div>

        {/* FILTERS */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          {["all", "pending", "accepted", "rejected"].map(s => (
            <button
              key={s}
              className="btn btn-sm"
              style={{
                backgroundColor:
                  filter === s ? "#2563eb" : theme.card,
                color: filter === s ? "#fff" : theme.text,
                border: `1px solid ${theme.border}`,
              }}
              onClick={() => setFilter(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div
          className="card shadow-sm border-0 d-none d-md-block"
          style={{ background: theme.card }}
        >
          <div className="card-body table-responsive">
            <table className="table align-middle">
              <thead style={{ backgroundColor: theme.border }}>
                <tr>
                  <th>Car</th>
                  <th>User</th>
                  <th>Status</th>
                  <th style={{ width: 180 }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.brand} {b.model}</strong></td>
                    <td style={{ color: theme.muted }}>{b.userId}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      {b.status === "pending" ? (
                        <>
                          <button
                            className="btn btn-sm me-2 btn-success"
                            onClick={() => updateStatus(b, "accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => updateStatus(b, "rejected")}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-muted">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="d-md-none">
          {filteredBookings.map(b => (
            <div
              key={b.id}
              className="card shadow-sm mb-3 border-0"
              style={{ background: theme.card }}
            >
              <div className="card-body">
                <strong>{b.brand} {b.model}</strong>
                <p className="small" style={{ color: theme.muted }}>{b.userId}</p>
                <StatusBadge status={b.status} />

                {b.status === "pending" && (
                  <div className="d-flex gap-2 mt-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => updateStatus(b, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => updateStatus(b, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <p className="text-muted mt-3">No bookings found.</p>
        )}

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ title, value, color, theme }) {
  return (
    <div className="col-6 col-md-3">
      <div
        className="card shadow-sm border-0 text-center"
        style={{ background: theme.card }}
      >
        <div className="card-body">
          <h6 style={{ color: theme.muted }}>{title}</h6>
          <h3 className="fw-bold" style={{ color }}>{value}</h3>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "#f59e0b",
    accepted: "#16a34a",
    rejected: "#dc2626",
  };

  return (
    <span
      className="badge"
      style={{ backgroundColor: colors[status], color: "#fff" }}
    >
      {status}
    </span>
  );
}
