import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function CustomerBooking() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);

      setBookings(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }))
      );
    };

    fetchBookings();
  }, [user]);

  return (
    <div style={{ background: "#f4f6fb", minHeight: "100vh" }}>
      <div className="container py-4">

        {/* HEADER */}
        <div className="mb-4 text-center">
          <h2 className="fw-bold">📦 My Bookings</h2>
          <p className="text-muted">Track the status of your bookings</p>
        </div>

        {/* BOOKINGS */}
        <div className="row g-4">
          {bookings.map(b => (
            <div key={b.id} className="col-12 col-md-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column">

                  <h5 className="fw-bold mb-1">
                    🚗 {b.brand} {b.model}
                  </h5>

                  {b.id && (
                    <small className="text-muted mb-2">
                      Booking ID: {b.id.slice(0, 8)}...
                    </small>
                  )}

                  <div className="mt-auto">
                    <span
                      className={`badge rounded-pill px-3 py-2 ${
                        b.status === "pending"
                          ? "bg-warning text-dark"
                          : b.status === "accepted"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {bookings.length === 0 && (
          <div className="text-center mt-5">
            <h5 className="text-muted">No bookings yet</h5>
            <p className="text-muted">
              Browse cars and book your first one 🚀
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
