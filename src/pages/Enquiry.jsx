import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

export default function Enquiry() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [car, setCar] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getDoc(doc(db, "cars", id)).then(snap => {
      if (snap.exists()) setCar(snap.data());
    });
  }, [id]);

  const submitEnquiry = async () => {
    if (!message.trim()) {
      alert("Please enter your enquiry");
      return;
    }

    try {
      setSubmitting(true);

      await addDoc(collection(db, "enquiries"), {
        userId: user.uid,
        carId: id,
        brand: car.brand,
        model: car.model,
        message,
        status: "new",
        createdAt: new Date(),
      });

      alert("Enquiry submitted successfully");
      navigate("/");
    } finally {
      setSubmitting(false);
    }
  };

  if (!car) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f6fb", minHeight: "100vh" }}>
      <div className="container py-4">

        {/* HEADER */}
        <div
          className="card mb-4 border-0 shadow-sm"
          style={{
            background: "linear-gradient(90deg, #2563eb, #1e40af)",
            color: "#fff",
          }}
        >
          <div className="card-body">
            <h3 className="fw-bold mb-1">💬 Car Enquiry</h3>
            <small>
              Ask us anything about this car — we’ll get back to you
            </small>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-md-8">

            {/* CAR INFO */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-bold mb-2">
                  🚗 {car.brand} {car.model}
                </h5>
                <p className="text-muted mb-0">
                  {car.description || "No description available."}
                </p>
              </div>
            </div>

            {/* ENQUIRY FORM */}
            <div className="card shadow-sm">
              <div className="card-body">
                <label className="form-label fw-semibold">
                  Your Enquiry
                </label>

                <textarea
                  className="form-control mb-3"
                  rows={5}
                  placeholder="Write your question here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />

                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    ← Back
                  </button>

                  <button
                    className="btn btn-primary px-4"
                    onClick={submitEnquiry}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Enquiry"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
