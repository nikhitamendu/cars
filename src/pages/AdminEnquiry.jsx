import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function AdminEnquiry() {
  const [enquiries, setEnquiries] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("adminEnquiryDark") === "true"
  );
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  /* ================= THEME ================= */
  useEffect(() => {
    localStorage.setItem("adminEnquiryDark", darkMode);
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
    const snap = await getDocs(collection(db, "enquiries"));
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
  }, []);

  /* ================= ADMIN REPLY ================= */
  const sendReply = async (enquiryId) => {
    if (!replyText.trim()) return;

    await updateDoc(doc(db, "enquiries", enquiryId), {
      adminReply: replyText,
      repliedAt: serverTimestamp(),
    });

    setReplyText("");
    setReplyingTo(null);
    fetchEnquiries();
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text }}>
      <div className="container py-4" style={{ maxWidth: 900 }}>

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">💬 Enquiries Inbox</h3>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* TIMELINE */}
        <div style={{ position: "relative", paddingLeft: 20 }}>
          <div
            style={{
              position: "absolute",
              left: 6,
              top: 0,
              bottom: 0,
              width: 2,
              background: theme.line,
            }}
          />

          {enquiries.map(e => (
            <div
              key={e.id}
              style={{
                position: "relative",
                marginBottom: 28,
                paddingLeft: 30,
              }}
            >
              {/* DOT */}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 18,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background:
                    e.status === "resolved" ? "#16a34a" : "#2563eb",
                }}
              />

              {/* CARD */}
              <div
                style={{
                  background: theme.card,
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                }}
              >
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong>{e.userEmail || e.userId}</strong>
                  <span
                    className="badge"
                    style={{
                      background:
                        e.status === "resolved" ? "#16a34a" : "#f59e0b",
                      color: "#fff",
                    }}
                  >
                    {e.status}
                  </span>
                </div>

                {/* CAR */}
                <div
                  className="mb-2"
                  style={{ color: theme.muted, fontSize: 14 }}
                >
                  🚗 {e.brand} {e.model}
                </div>

                {/* CUSTOMER MESSAGE */}
                <div
                  style={{
                    background: darkMode ? "#020617" : "#f1f5f9",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Customer:</strong>
                  <div>{e.message}</div>
                </div>

                {/* ADMIN REPLY */}
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

                {/* CUSTOMER FOLLOW-UP */}
                {e.followUpMessage && (
                  <div
                    className="mt-3"
                    style={{
                      background: "#0ea5e9",
                      color: "#fff",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <strong>Customer Follow-up:</strong>
                    <div>{e.followUpMessage}</div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      setReplyingTo(replyingTo === e.id ? null : e.id)
                    }
                  >
                    Reply
                  </button>
                </div>

                {/* REPLY BOX */}
                {replyingTo === e.id && (
                  <div className="mt-3">
                    <textarea
                      className="form-control mb-2"
                      rows={3}
                      placeholder="Type admin reply..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => sendReply(e.id)}
                    >
                      Send Reply
                    </button>
                  </div>
                )}
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
    </div>
  );
}
