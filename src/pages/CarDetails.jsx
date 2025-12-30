import { useEffect, useState, useContext } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [car, setCar] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!user) {
      alert("Please login to view and book cars");
      navigate("/login");
    }
  }, [user, navigate]);

  /* ================= FETCH CAR ================= */
  useEffect(() => {
    if (!user) return;

    const fetchCar = async () => {
      const snap = await getDoc(doc(db, "cars", id));
      if (snap.exists()) setCar(snap.data());
    };
    fetchCar();
  }, [id, user]);

  /* ================= BOOK CAR ================= */
  const bookCar = async () => {
    if (!user) return;

    try {
      setBookingLoading(true);

      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        where("carId", "==", id)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        alert("You have already booked this car");
        return;
      }

      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userEmail: user.email,
        carId: id,
        brand: car.brand,
        model: car.model,
        status: "pending",
        bookingDate: serverTimestamp(),
      });

      alert("Booking request sent successfully");
      navigate("/my-bookings");
    } catch (err) {
      console.error(err);
      alert("Failed to book car");
    } finally {
      setBookingLoading(false);
    }
  };

  /* ================= ENQUIRY ================= */
  const sendEnquiry = async () => {
    if (!user) return;

    const message = prompt("Enter your enquiry message:");
    if (!message) return;

    try {
      setEnquiryLoading(true);

      await addDoc(collection(db, "enquiries"), {
        userId: user.uid,
        userEmail: user.email,
        carId: id,
        brand: car.brand,
        model: car.model,
        message,
        status: "new",
        adminReply: "",
        createdAt: serverTimestamp(),
      });

      alert("Enquiry sent successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to send enquiry");
    } finally {
      setEnquiryLoading(false);
    }
  };

  if (!car) {
    return <p className="text-center mt-5">Loading car details...</p>;
  }

  return (
    <div className="container py-4">

      {/* BACK */}
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="row g-4">

        {/* IMAGE GALLERY */}
        <div className="col-12 col-md-6">
          <div className="bg-light rounded p-3 text-center">
            <img
              src={car.images?.[activeImage]}
              alt="car"
              style={{ width: "100%", height: 320, objectFit: "contain" }}
            />
          </div>

          <div className="d-flex gap-2 mt-3 overflow-auto">
            {car.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                onClick={() => setActiveImage(i)}
                style={{
                  width: 80,
                  height: 60,
                  objectFit: "cover",
                  cursor: "pointer",
                  border:
                    activeImage === i
                      ? "2px solid #0d6efd"
                      : "1px solid #ddd",
                  borderRadius: 6,
                }}
              />
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div className="col-12 col-md-6">
          <h2 className="fw-bold">
            {car.brand} {car.model}
          </h2>

          <h4 className="text-primary mb-3">
            ₹{car.price?.toLocaleString()}
          </h4>

          <p className="text-muted">
            {car.description || "No description available."}
          </p>

          <ul className="list-group mb-4">
            <li className="list-group-item">
              <strong>Fuel:</strong> {car.fuelType}
            </li>
            <li className="list-group-item">
              <strong>Transmission:</strong> {car.transmission}
            </li>
            <li className="list-group-item">
              <strong>Year:</strong> {car.year}
            </li>
          </ul>

          {/* ACTION BUTTONS */}
          <div className="d-grid gap-2">
            <button
              className="btn btn-primary"
              onClick={bookCar}
              disabled={bookingLoading}
            >
              {bookingLoading ? "Booking..." : "Book Now"}
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={sendEnquiry}
              disabled={enquiryLoading}
            >
              {enquiryLoading ? "Sending..." : "Enquire Now"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
