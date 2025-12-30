import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("homeDark") === "true"
  );
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");

  const navigate = useNavigate();

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchCars = async () => {
      const snap = await getDocs(collection(db, "cars"));
      setCars(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchCars();
  }, []);

  useEffect(() => {
    localStorage.setItem("homeDark", darkMode);
  }, [darkMode]);

  /* ================= THEME ================= */
  const theme = {
    bg: darkMode
      ? "radial-gradient(circle at top, #020617, #000)"
      : "#f4f6fb",
    card: darkMode ? "#0f172a" : "#ffffff",
    text: darkMode ? "#e5e7eb" : "#020617",
    muted: darkMode ? "#94a3b8" : "#64748b",
    frame: darkMode ? "#020617" : "#f8fafc",
    accent: "#2563eb",
  };

  /* ================= FILTER ================= */
  let filteredCars = [...cars];

  if (brand) {
    filteredCars = filteredCars.filter(
      c => c.brand?.toLowerCase() === brand.toLowerCase()
    );
  }

  if (price === "low") filteredCars.sort((a, b) => a.price - b.price);
  if (price === "high") filteredCars.sort((a, b) => b.price - a.price);

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text }}>

      {/* ================= HERO ================= */}
      <div
        id="heroCarousel"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {[
            "https://qz.com/cdn-cgi/image/width=1920,quality=85,format=auto/https://assets.qz.com/media/8829c0e55f0522cea7b589fec420db88.jpg",
            "https://news.dupontregistry.com/wp-content/uploads/2024/01/download-2024-01-25T133212.738.jpeg",
            "https://lapoloin.s3.ap-south-1.amazonaws.com/20251014162459/000-Best-Luxury-Cars-to-Buy.jpg",
            "https://images.hindustantimes.com/auto/auto-images/bmw/i7/exterior_bmw-i7_front-left-side_600x400.jpg",
          ].map((img, i) => (
            <div key={i} className={`carousel-item ${i === 0 ? "active" : ""}`}>
              <img
                src={img}
                alt="Luxury Cars"
                className="d-block w-100"
                style={{ height: "100vh", objectFit: "cover" }}
              />

              {/* Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,.75))",
                }}
              />

              <div className="carousel-caption text-start">
                <h1 className="fw-bold display-4">
                  Premium Car Dealership
                </h1>

                <p className="lead mb-4">
                  Luxury • Performance • Comfort
                </p>

                {/* 🔥 Explore Button */}
                <a
                  href="#collection"
                  className="btn btn-warning btn-lg px-4 rounded-pill fw-semibold"
                >
                  Explore Collection
                </a>
              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" />
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" />
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div id="collection" className="container py-5">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold">🚗 Explore Cars</h2>
            <p style={{ color: theme.muted }}>
              Choose your perfect ride
            </p>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* FILTERS */}
        <div className="card shadow-sm mb-4" style={{ background: theme.card }}>
          <div className="card-body row g-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={brand}
                onChange={e => setBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {[...new Set(cars.map(c => c.brand))].map(b => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={price}
                onChange={e => setPrice(e.target.value)}
              >
                <option value="">Default Price</option>
                <option value="low">Low → High</option>
                <option value="high">High → Low</option>
              </select>
            </div>

            <div className="col-md-4">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setBrand("");
                  setPrice("");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* ================= CAR GRID ================= */}
        <div className="row g-4">
          {filteredCars.map(car => (
            <div key={car.id} className="col-12 col-sm-6 col-lg-4">
              <div
                className="card h-100 border-0"
                style={{
                  background: darkMode
                    ? "linear-gradient(180deg, #0f172a, #020617)"
                    : "#ffffff",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: darkMode
                    ? "0 20px 40px rgba(0,0,0,.6)"
                    : "0 15px 30px rgba(0,0,0,.15)",
                  transition: "all .35s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow =
                    "0 30px 60px rgba(37,99,235,.35)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = darkMode
                    ? "0 20px 40px rgba(0,0,0,.6)"
                    : "0 15px 30px rgba(0,0,0,.15)";
                }}
              >
                {/* IMAGE */}
                <div
                  style={{
                    height: 230,
                    background: theme.frame,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 14,
                    position: "relative",
                  }}
                >
                  <img
                    src={car.images?.[0] || "https://via.placeholder.com/400x250"}
                    alt="car"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />

                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background:
                        "linear-gradient(90deg, #2563eb, #1e40af)",
                      color: "#fff",
                      padding: "6px 14px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    ₹{car.price?.toLocaleString()}
                  </span>
                </div>

                {/* BODY */}
                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold mb-1">
                    {car.brand} {car.model}
                  </h5>

                  <p className="small mb-3" style={{ color: theme.muted }}>
                    {car.description
                      ? car.description.slice(0, 90) + "…"
                      : "Luxury vehicle with premium features"}
                  </p>

                  <button
                    className="btn mt-auto"
                    style={{
                      background:
                        "linear-gradient(90deg, #2563eb, #1e40af)",
                      color: "#fff",
                      borderRadius: 12,
                      fontWeight: 600,
                      border: "none",
                    }}
                    onClick={() => navigate(`/car/${car.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <p className="text-center mt-5" style={{ color: theme.muted }}>
            No cars match your filters.
          </p>
        )}
      </div>

      {/* SMOOTH SCROLL */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
