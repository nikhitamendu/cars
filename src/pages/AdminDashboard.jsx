import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

export default function AdminDashboard() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("adminDashboardDark") === "true"
  );

  /* ================= THEME ================= */
  useEffect(() => {
    localStorage.setItem("adminDashboardDark", darkMode);
  }, [darkMode]);

  const theme = {
    bg: darkMode ? "#020617" : "#f4f6fb",
    card: darkMode ? "#0f172a" : "#ffffff",
    text: darkMode ? "#e5e7eb" : "#020617",
    muted: darkMode ? "#94a3b8" : "#64748b",
    grid: darkMode ? "#1e293b" : "#e5e7eb",
  };

  /* ================= REAL-TIME ================= */
  useEffect(() => {
    const unsubCars = onSnapshot(collection(db, "cars"), snap => {
      setCars(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubBookings = onSnapshot(collection(db, "bookings"), snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubCars();
      unsubBookings();
    };
  }, []);

  /* ================= KPIs (NO STOCK) ================= */
  const totalCars = cars.length;
  const totalModels = cars.length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;

  /* ================= FUEL TYPE PIE ================= */
  const fuelStats = cars.reduce((acc, car) => {
    const fuel = car.fuelType || "Unknown";
    acc[fuel] = (acc[fuel] || 0) + 1;
    return acc;
  }, {});

  const fuelChartData = Object.entries(fuelStats).map(
    ([name, value]) => ({ name, value })
  );

  /* ================= BOOKING TREND (7 DAYS) ================= */
  const today = new Date();
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const bookingTrend = last7Days.map(date => ({
    date,
    count: bookings.filter(b => {
      const bookingDate = b.bookingDate?.toDate
        ? b.bookingDate.toDate().toISOString().split("T")[0]
        : null;
      return bookingDate === date;
    }).length,
  }));

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text }}>
      <div className="container-fluid py-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">📊 Admin Dashboard</h3>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* STATS */}
        <div className="row g-3 mb-4">
          <Stat title="Total Cars" value={totalCars} theme={theme} />
          <Stat title="Models" value={totalModels} theme={theme} />
          <Stat title="Bookings" value={totalBookings} theme={theme} />
          <Stat title="Pending" value={pendingBookings} color="#f59e0b" theme={theme} />
        </div>

        {/* CHARTS */}
        <div className="row g-4">

          {/* FUEL PIE */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100" style={{ background: theme.card }}>
              <div className="card-body">
                <h5 className="mb-3">⛽ Fuel Type Distribution</h5>

                {fuelChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={fuelChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {fuelChartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted">No fuel data available</p>
                )}
              </div>
            </div>
          </div>

          {/* BOOKING TREND */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100" style={{ background: theme.card }}>
              <div className="card-body">
                <h5 className="mb-3">📈 Booking Trend (Last 7 Days)</h5>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bookingTrend}>
                    <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */

function Stat({ title, value, color = "#2563eb", theme }) {
  return (
    <div className="col-6 col-md-3">
      <div
        className="card shadow-sm text-center"
        style={{ background: theme.card }}
      >
        <div className="card-body">
          <h6 style={{ color: theme.muted }}>{title}</h6>
          <h2 className="fw-bold" style={{ color }}>{value}</h2>
        </div>
      </div>
    </div>
  );
}
