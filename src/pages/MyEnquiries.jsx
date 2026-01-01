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

export default function MyEnquiries() {
  const { user } = useContext(AuthContext);
  const [enquiries, setEnquiries] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("myEnquiryDark") === "true"
  );

  // modal state
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [followUpText, setFollowUpText] = useState("");

  useEffect(() => {
    localStorage.setItem("myEnquiryDark", darkMode);
  }, [darkMode]);

  const theme = {
    bg: darkMode ? "#020617" : "#f8fafc",
    card: darkMode ? "#0f172a" : "#ffffff",
    text: darkMode ? "#e5e7eb" : "#020617",
    muted: darkMode ? "#94a3b8" : "#64748b",
    line: darkMode ? "#1e293b" : "#e5e7eb",
  };

  /* ================= FETCH ================= */
  const fetchEnquiries = async () => {
    if (!user) return;

    const q = query(
      collection(db, "enquiries"),
      where("userId", "==", user.uid)
    );

    const snap = await getDocs(q);

    setEnquiries(
      snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        )
    );
  };

  useEffect(() => {
    fetchEnquiries();
  }, [user]);

  /* ================= ACTIONS ================= */

  const resolveTicket = async (e) => {
    await updateDoc(doc(db, "enquiries", e.id), {
      status: "resolved",
      resolvedByCustomerAt: serverTimestamp(),
    });
    fetchEnquiries();
  };

  const submitFollowUp = async () => {
    if (!followUpText.trim()) return;

    await updateDoc(doc(db, "enquiries", activeEnquiry.id), {
      status: "open",
      followUpMessage: followUpText,
      followedUpAt: serverTimestamp(),
    });

    setFollowUpText("");
    setActiveEnquiry(null);
    fetchEnquiries();
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text }}>
      <div className="container py-4" style={{ maxWidth: 900 }}>

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">🧾 My Enquiries</h3>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* TIMELINE */}
        <div className="timeline-wrapper">
          <div className="timeline-line" style={{ background: theme.line }} />

          {enquiries.map(e => (
            <div key={e.id} className="timeline-item">

              <span
                className={`timeline-dot ${e.status === "open" ? "pulse" : ""}`}
                style={{
                  background:
                    e.status === "resolved" ? "#16a34a" : "#2563eb",
                }}
                title={e.status}
              />

              <div className="timeline-card" style={{ background: theme.card }}>
                <div className="d-flex justify-content-between mb-1">
                  <strong>🚗 {e.brand} {e.model}</strong>
                  <span
                    style={{
                      fontSize: 12,
                      color: theme.muted,
                      textTransform: "uppercase",
                    }}
                  >
                    {e.status}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: theme.muted }}>
                  {e.createdAt?.seconds
                    ? new Date(e.createdAt.seconds * 1000).toLocaleString()
                    : ""}
                </div>

                <div
                  className="mt-2"
                  style={{
                    background: darkMode ? "#020617" : "#f1f5f9",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  {e.followUpMessage || e.message}
                </div>

                {e.adminReply && (
                  <div
                    className="mt-3"
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <strong>Admin Reply:</strong>
                    <div>{e.adminReply}</div>
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
                  {e.status === "open" && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => resolveTicket(e)}
                    >
                      Mark as Resolved
                    </button>
                  )}

                  {e.status === "resolved" && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setActiveEnquiry(e);
                        setFollowUpText("");
                      }}
                    >
                      Raise Ticket Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {enquiries.length === 0 && (
          <p className="text-center text-muted mt-5">
            No enquiries yet
          </p>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {activeEnquiry && (
        <div className="modal-backdrop-custom">
          <div className="modal-box" style={{ background: theme.card }}>
            <h5 className="fw-bold mb-2">💬 Follow-up Message</h5>
            <p className="text-muted small mb-2">
              🚗 {activeEnquiry.brand} {activeEnquiry.model}
            </p>

            <textarea
              className="form-control mb-3"
              rows={4}
              placeholder="Type your message to admin..."
              value={followUpText}
              onChange={e => setFollowUpText(e.target.value)}
            />

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveEnquiry(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={submitFollowUp}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style>{`
        .timeline-wrapper {
          position: relative;
          padding-left: 40px;
        }

        .timeline-line {
          position: absolute;
          left: 16px;
          top: 0;
          bottom: 0;
          width: 2px;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 30px;
        }

        .timeline-dot {
          position: absolute;
          left: 10px;
          top: 20px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }

        .timeline-card {
          margin-left: 30px;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }

        .pulse {
          animation: pulse 1.6s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37,99,235,.6); }
          70% { box-shadow: 0 0 0 10px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }

        .modal-backdrop-custom {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }

        .modal-box {
          width: 100%;
          max-width: 420px;
          padding: 20px;
          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}
