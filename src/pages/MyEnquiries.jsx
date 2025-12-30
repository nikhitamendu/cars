import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function MyEnquiries() {
  const { user } = useContext(AuthContext);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEnquiries = async () => {
      try {
        const q = query(
          collection(db, "enquiries"),
          where("userId", "==", user.uid)
        );

        const snap = await getDocs(q);

        setEnquiries(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("Error fetching enquiries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [user]);

  return (
    <>
      {/* 🔹 Inline CSS */}
      <style>
        {`
          .enquiries-card {
            border-radius: 12px;
            overflow: hidden;
          }

          .enquiries-header {
            background-color: #212529;
            color: #fff;
            padding: 16px 20px;
          }

          .enquiries-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
          }

          .enquiries-table td,
          .enquiries-table th {
            padding: 14px 16px;
            vertical-align: middle;
          }

          .enquiries-table tr:hover {
            background-color: #f8f9fa;
          }

          .status-badge {
            text-transform: capitalize;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85rem;
          }
        `}
      </style>

      <div className="container my-5">
        <div className="card enquiries-card shadow-sm">
          <div className="card-header enquiries-header">
            <h4 className="mb-0">My Enquiries</h4>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 enquiries-table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>My Message</th>
                    <th>Status</th>
                    <th>Admin Reply</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Loading enquiries...
                      </td>
                    </tr>
                  ) : enquiries.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        You haven’t made any enquiries yet.
                      </td>
                    </tr>
                  ) : (
                    enquiries.map(e => (
                      <tr key={e.id}>
                        <td className="fw-semibold">
                          {e.brand} {e.model}
                        </td>

                        <td className="text-muted">
                          {e.message}
                        </td>

                        <td>
                          <span
                            className={`badge status-badge ${
                              e.status === "new"
                                ? "bg-warning text-dark"
                                : e.status === "replied"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>

                        <td>
                          {e.adminReply ? (
                            <span className="text-success fw-semibold">
                              {e.adminReply}
                            </span>
                          ) : (
                            <span className="text-muted fst-italic">
                              Waiting for admin reply
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
