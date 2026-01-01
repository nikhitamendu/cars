import { FaCarSide } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  // ✅ Footer ONLY on Home page
  if (location.pathname !== "/") return null;

  return (
    <footer className="ultra-footer">
      <div className="footer-line">
        <FaCarSide size={11} />
        <span className="brand">Elite Motors</span>

        <span className="dot">•</span>

        <Link to="/privacy">Privacy</Link>
        <span className="dot">•</span>
        <Link to="/terms">Terms</Link>

        <span className="dot">•</span>
        <span>© {new Date().getFullYear()}</span>
      </div>

      <style>{`
        .ultra-footer {
          background: #000;
          padding: 4px 0;
        }

        .footer-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 10.5px;
          color: #9ca3af;
          white-space: nowrap;
        }

        .footer-line svg {
          color: #FFD700;
        }

        .brand {
          color: #FFD700;
          font-weight: 600;
        }

        .footer-line a {
          color: #9ca3af;
          text-decoration: none;
        }

        .footer-line a:hover {
          color: #FFD700;
        }

        .dot {
          color: #475569;
        }

        @media (max-width: 480px) {
          .footer-line {
            font-size: 10px;
            gap: 5px;
          }
        }
      `}</style>
    </footer>
  );
}
