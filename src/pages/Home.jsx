import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchCars = async () => {
      const snap = await getDocs(collection(db, "cars"));
      setCars(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchCars();
  }, []);

  return (
    <div style={{ background: "#f4f6fb" }}>

      {/* ================= HERO ================= */}
      <div className="hero-wrapper">
        {/* Desktop Image */}
        <img
          src="https://qz.com/cdn-cgi/image/width=1920,quality=85,format=auto/https://assets.qz.com/media/8829c0e55f0522cea7b589fec420db88.jpg"
          alt="Luxury Cars"
          className="hero-image hero-desktop"
        />

        {/* Mobile Image */}
        <img
          src="https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?q=80&w=1080&auto=format&fit=crop"
          alt="Luxury Cars Mobile"
          className="hero-image hero-mobile"
        />

        <div className="hero-content">
          <h1>Elite Motors</h1>
          <p>Luxury • Performance • Comfort</p>

          <a href="#collection" className="hero-btn">
            Explore Collection →
          </a>
        </div>
      </div>

      {/* ================= CARS ================= */}
      <div id="collection" className="container py-4">
        <div className="mb-3">
          <h4 className="fw-bold mb-1">🚗 Explore Cars</h4>
          <p className="text-muted small mb-0">
            Choose your perfect ride
          </p>
        </div>

        <div className="row g-3">
          {cars.map(car => (
            <div key={car.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100 rounded-4">

                <div className="car-img-box">
                  <img src={car.images?.[0]} alt="car" />
                  <span>₹{car.price?.toLocaleString()}</span>
                </div>

                <div className="card-body">
                  <h6 className="fw-bold mb-1">
                    {car.brand} {car.model}
                  </h6>

                  <p className="small text-muted mb-3">
                    {car.description?.slice(0, 80)}…
                  </p>

                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => navigate(`/car/${car.id}`)}
                  >
                    View Details
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        /* ================= HERO ================= */
        .hero-wrapper {
          position: relative;
          height: 100vh;
          background: #020617;
          overflow: hidden;
        }

        .hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-mobile {
          display: none;
        }

        .hero-wrapper::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,.55);
        }

        .hero-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 6%;
          color: #fff;
          max-width: 520px;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .hero-content p {
          font-size: 1.2rem;
          margin-bottom: 1.6rem;
        }

        /* HERO BUTTON */
        .hero-btn {
          align-self: flex-start;
          padding: 10px 22px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          text-decoration: none;
          border: 1.5px solid rgba(255,255,255,0.8);
          border-radius: 999px;
          backdrop-filter: blur(6px);
          background: rgba(255,255,255,0.08);
          transition: all 0.25s ease;
        }

        .hero-btn:hover {
          background: #ffffff;
          color: #020617;
        }

        /* ================= CARDS ================= */
        .car-img-box {
          height: 200px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border-radius: 16px 16px 0 0;
        }

        .car-img-box img {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
        }

        .car-img-box span {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #2563eb;
          color: #fff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        /* ================= MOBILE (CLEAN & NEAT) ================= */
        @media (max-width: 768px) {
          .hero-wrapper {
            height: 65vh;
          }

          .hero-desktop {
            display: none;
          }

          .hero-mobile {
            display: block;
          }

          .hero-content {
            justify-content: flex-end;
            padding: 0 1.25rem 2.2rem;
            text-align: center;
            align-items: center;
          }

          .hero-content h1 {
            font-size: 1.85rem;   /* ↓ refined */
            line-height: 1.15;
          }

          .hero-content p {
            font-size: 0.9rem;    /* ↓ refined */
            margin-bottom: 1.1rem;
          }

          .hero-btn {
            padding: 8px 16px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
