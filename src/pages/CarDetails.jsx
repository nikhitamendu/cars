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
import Swal from "sweetalert2";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, loading } = useContext(AuthContext);

  const [car, setCar] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const isAdmin = role === "admin";

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  /* ================= FETCH CAR ================= */
  useEffect(() => {
    if (!id) return;

    const fetchCar = async () => {
      try {
        const snap = await getDoc(doc(db, "cars", id));
        if (snap.exists()) {
          const data = snap.data();
          setCar({
            ...data,
            stock: data.stock ?? 0,
          });
        } else {
          Swal.fire("Not Found", "Car does not exist", "error");
          navigate(-1);
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load car details", "error");
      }
    };

    fetchCar();
  }, [id, navigate]);

  /* ================= BOOK CAR (FIXED) ================= */
  const bookCar = async () => {
    if (!user || isAdmin || car.stock <= 0) return;

    try {
      setBookingLoading(true);

      const q = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        where("carId", "==", id)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        Swal.fire({
          icon: "warning",
          title: "Already Booked",
          text: "You have already booked this car. Check My Bookings.",
        });
        return;
      }

      // ✅ USER NAME STORED HERE
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userName: user.displayName || "Customer",
        userEmail: user.email,
        carId: id,
        brand: car.brand,
        model: car.model,
        status: "pending",
        bookingDate: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Booking Successful",
        text: "Your booking request has been sent!",
        confirmButtonColor: "#2563eb",
      }).then(() => navigate("/my-bookings"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  /* ================= ENQUIRY ================= */
  const sendEnquiry = async () => {
    if (!user || isAdmin) return;

    const { value: message } = await Swal.fire({
      title: "Send Enquiry",
      input: "textarea",
      inputPlaceholder: "Enter your enquiry message...",
      showCancelButton: true,
      confirmButtonText: "Send",
      confirmButtonColor: "#2563eb",
    });

    if (!message) return;

    try {
      setEnquiryLoading(true);

      await addDoc(collection(db, "enquiries"), {
        userId: user.uid,
        userName: user.displayName || "Customer",
        userEmail: user.email,
        carId: id,
        brand: car.brand,
        model: car.model,
        message,
        status: "new",
        adminReply: "",
        createdAt: serverTimestamp(),
      });

      Swal.fire({
        icon: "success",
        title: "Enquiry Sent",
        text: "We will get back to you shortly.",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not send enquiry.",
      });
    } finally {
      setEnquiryLoading(false);
    }
  };

  /* ================= IMAGE NAV ================= */
  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) =>
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) =>
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  /* ================= LOADING ================= */
  if (loading) return <p className="text-center mt-5">Checking access...</p>;
  if (!car) return <p className="text-center mt-5">Loading car details...</p>;

  const images = car.images || [];

  return (
    <div className="container py-4">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="row g-4">
        {/* IMAGE */}
        <div className="col-12 col-md-6">
          <div className="bg-light rounded p-2 text-center">
            <img
              src={images[activeImage]}
              alt="car"
              onClick={() => setShowImage(true)}
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                cursor: "zoom-in",
              }}
            />
          </div>

          <div className="d-flex gap-2 mt-3 overflow-auto">
            {images.map((img, i) => (
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

          <h4 className="text-primary mb-2">
            ₹{car.price?.toLocaleString()}
          </h4>

          <p
            className="fw-semibold mb-3"
            style={{ color: car.stock > 0 ? "#16a34a" : "#dc2626" }}
          >
            {car.stock > 0
              ? `Available Stock: ${car.stock}`
              : "Out of Stock"}
          </p>

          <p className="text-muted">
            {car.description || "No description available."}
          </p>

          {!isAdmin && car.stock > 0 && (
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
          )}

          {!isAdmin && car.stock <= 0 && (
            <div className="alert alert-danger mt-3">
              This car is currently unavailable.
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN IMAGE */}
      {showImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1050 }}
          onClick={() => setShowImage(false)}
        >
          <button
            onClick={prevImage}
            className="btn btn-light position-absolute start-0 ms-3"
            style={{ fontSize: 30 }}
          >
            ‹
          </button>

          <img
            src={images[activeImage]}
            alt="full"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
            }}
          />

          <button
            onClick={nextImage}
            className="btn btn-light position-absolute end-0 me-3"
            style={{ fontSize: 30 }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
