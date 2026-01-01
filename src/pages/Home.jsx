import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("homeDark") === "true"
  );

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
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text }}>

      {/* ================= HERO (NAVBAR OVERLAY) ================= */}
      <div
        id="heroCarousel"
        className="carousel slide carousel-fade hero-carousel"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {[
            "https://qz.com/cdn-cgi/image/width=1920,quality=85,format=auto/https://assets.qz.com/media/8829c0e55f0522cea7b589fec420db88.jpg",
            "https://news.dupontregistry.com/wp-content/uploads/2024/01/download-2024-01-25T133212.738.jpeg",
            "https://lapoloin.s3.ap-south-1.amazonaws.com/20251014162459/000-Best-Luxury-Cars-to-Buy.jpg",
          ].map((img, i) => (
            <div key={i} className={`carousel-item ${i === 0 ? "active" : ""}`}>
              <img src={img} className="hero-img" alt="Luxury Cars" />
              <div className="hero-overlay" />

              <div className="carousel-caption text-start">
                <h1 className="fw-bold display-4">Elite Motors</h1>
                <p className="lead mb-4">Luxury • Performance • Comfort</p>
                <a
                  href="#collection"
                  className="btn btn-warning btn-lg rounded-pill fw-semibold px-4"
                >
                  Explore Collection
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CARS ================= */}
      <div id="collection" className="container py-5">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">🚗 Explore Cars</h2>
            <p style={{ color: theme.muted }}>Choose your perfect ride</p>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="row g-4">
          {cars.map(car => {
            const stock = car.stock ?? 0;
            const inStock = stock > 0;

            return (
              <div key={car.id} className="col-12 col-sm-6 col-lg-4">
                <div
                  className="card h-100 border-0"
                  style={{
                    background: theme.card,
                    borderRadius: 18,
                    overflow: "hidden",
                    boxShadow: "0 15px 30px rgba(0,0,0,.15)",
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
                      position: "relative",
                    }}
                  >
                    <img
                      src={car.images?.[0]}
                      alt="car"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />

                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "#2563eb",
                        color: "#fff",
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      ₹{car.price?.toLocaleString()}
                    </span>
                  </div>

                  {/* BODY */}
                  <div className="card-body d-flex flex-column">
                    <h5 className="fw-bold">{car.brand} {car.model}</h5>

                    <p className="small mb-2" style={{ color: theme.muted }}>
                      {car.description?.slice(0, 90) || "Premium luxury vehicle"}…
                    </p>

                    {/* STOCK */}
                    <p
                      className="fw-semibold mb-3"
                      style={{ color: inStock ? "#16a34a" : "#dc2626" }}
                    >
                      {inStock ? `In Stock (${stock})` : "Out of Stock"}
                    </p>

                    <button
                      disabled={!inStock}
                      className="btn mt-auto"
                      style={{
                        background: inStock ? "#2563eb" : "#94a3b8",
                        color: "#fff",
                        borderRadius: 12,
                        fontWeight: 600,
                      }}
                      onClick={() => inStock && navigate(`/car/${car.id}`)}
                    >
                      {inStock ? "View Details" : "Sold Out"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= FOOTER (HOME ONLY) ================= */}
      <footer className="home-footer">
        <div className="container text-center">
          <h6 className="fw-bold mb-1">Elite Motors</h6>
          <p className="small mb-2">Premium cars • Trusted service</p>

          <div className="d-flex justify-content-center gap-4 small">
            <span>About</span>
            <span>Contact</span>
          </div>

          <p className="small mt-3 mb-0">
            © {new Date().getFullYear()} Elite Motors
          </p>
        </div>
      </footer>

      {/* ================= STYLES ================= */}
      <style>{`
        .hero-carousel,
        .hero-carousel .carousel-item {
          height: 100vh;
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,.4),
            rgba(0,0,0,.75)
          );
        }

        .home-footer {
          background: #020617;
          color: #e5e7eb;
          padding: 40px 0;
        }

        .home-footer span {
          cursor: pointer;
          color: #94a3b8;
        }

        .home-footer span:hover {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
