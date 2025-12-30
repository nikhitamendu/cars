import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

/* ================= CLOUDINARY ================= */
const uploadImagesToCloudinary = async (files) => {
  return Promise.all(
    Array.from(files).map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "car_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dbfkou8ot/image/upload",
        { method: "POST", body: fd }
      );

      const data = await res.json();
      return data.secure_url;
    })
  );
};

export default function Admin() {
  const [cars, setCars] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [cloneMode, setCloneMode] = useState(false);
  const [similarCar, setSimilarCar] = useState(null);
  const [newImages, setNewImages] = useState([]);

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    price: "",
    description: "",
    images: [],
  });

  /* ================= FETCH ================= */
  const fetchCars = async () => {
    const snap = await getDocs(collection(db, "cars"));
    setCars(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchCars();
  }, []);

  /* ================= FIND SIMILAR ================= */
  useEffect(() => {
    if (!form.brand || !form.model || !form.year || editingId) {
      setSimilarCar(null);
      return;
    }

    const found = cars.find(
      c =>
        c.brand.toLowerCase() === form.brand.toLowerCase() &&
        c.model.toLowerCase() === form.model.toLowerCase() &&
        Number(c.year) === Number(form.year)
    );

    setSimilarCar(found || null);
  }, [form.brand, form.model, form.year, cars, editingId]);

  /* ================= DRAG REORDER ================= */
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(form.images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setForm(prev => ({ ...prev, images: reordered }));
  };

  /* ================= REMOVE IMAGE ================= */
  const removeImage = (url) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url),
    }));
    toast.info("Image removed");
  };

  /* ================= SAVE ================= */
  const saveCar = async () => {
    if (!form.brand || !form.model || !form.year) {
      toast.error("Brand, Model & Year required");
      return;
    }

    let uploaded = [];
    if (newImages.length) {
      uploaded = await uploadImagesToCloudinary(newImages);
    }

    const finalImages = [...form.images, ...uploaded];

    const payload = {
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      price: Number(form.price),
      description: form.description,
      images: finalImages,
      createdAt: new Date(),
    };

    if (editingId) {
      await updateDoc(doc(db, "cars", editingId), payload);
      toast.success("Car updated");
    } else {
      await addDoc(collection(db, "cars"), payload);
      toast.success("Car added");
    }

    resetForm();
    fetchCars();
  };

  /* ================= EXISTING (CLONE) ================= */
  const useExistingCar = () => {
    setForm({
      brand: similarCar.brand,
      model: similarCar.model,
      year: similarCar.year,
      price: similarCar.price,
      description: similarCar.description || "",
      images: similarCar.images || [],
    });
    setCloneMode(true);
    setNewImages([]);
    toast.info("Existing car loaded. Update images if needed.");
  };

  /* ================= EDIT ================= */
  const editCar = (car) => {
    setEditingId(car.id);
    setCloneMode(false);
    setForm({
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      description: car.description || "",
      images: car.images || [],
    });
    setNewImages([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const deleteCar = async (car) => {
    if (!window.confirm("Delete car?")) return;
    await deleteDoc(doc(db, "cars", car.id));
    toast.error("Car deleted");
    fetchCars();
  };

  const resetForm = () => {
    setForm({
      brand: "",
      model: "",
      year: "",
      price: "",
      description: "",
      images: [],
    });
    setEditingId(null);
    setCloneMode(false);
    setSimilarCar(null);
    setNewImages([]);
  };

  return (
    <div className="container py-4">
      <ToastContainer />

      <h3 className="fw-bold mb-4">🚘 Admin – Cars</h3>

      {/* FORM */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">
            {editingId ? "Edit Car" : cloneMode ? "Existing Car" : "Add Car"}
          </h5>

          <div className="row g-3">
            {["brand", "model", "year", "price"].map(f => (
              <div key={f} className="col-md-3">
                <input
                  className="form-control"
                  placeholder={f.toUpperCase()}
                  disabled={cloneMode}
                  value={form[f]}
                  type={["year", "price"].includes(f) ? "number" : "text"}
                  onChange={e => setForm({ ...form, [f]: e.target.value })}
                />
              </div>
            ))}

            <div className="col-md-12">
              <textarea
                className="form-control"
                rows={3}
                placeholder="Description"
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="col-md-6">
              <input
                type="file"
                multiple
                className="form-control"
                onChange={e => setNewImages(e.target.files)}
              />
            </div>
          </div>

          {/* IMAGE PREVIEW & DRAG */}
          {form.images.length > 0 && (
            <div className="mt-3">
              <small className="text-muted">
                Drag to reorder images (first = cover)
              </small>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="imgs" direction="horizontal">
                  {(p) => (
                    <div
                      ref={p.innerRef}
                      {...p.droppableProps}
                      className="d-flex gap-2 mt-2 flex-wrap"
                    >
                      {form.images.map((img, i) => (
                        <Draggable draggableId={img} index={i} key={img}>
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              style={{
                                position: "relative",
                                ...p.draggableProps.style,
                              }}
                            >
                              <img
                                src={img}
                                alt=""
                                width={90}
                                height={65}
                                style={{
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border:
                                    i === 0
                                      ? "2px solid #0d6efd"
                                      : "1px solid #ccc",
                                }}
                              />
                              <button
                                onClick={() => removeImage(img)}
                                style={{
                                  position: "absolute",
                                  top: -6,
                                  right: -6,
                                  background: "#dc3545",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: 18,
                                  height: 18,
                                  fontSize: 10,
                                  cursor: "pointer",
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {p.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          {/* EXISTING CAR BUTTON */}
          {similarCar && !editingId && !cloneMode && (
            <div className="alert alert-warning mt-3 d-flex justify-content-between">
              <span>
                Similar car exists:{" "}
                <strong>{similarCar.brand} {similarCar.model}</strong>
              </span>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={useExistingCar}
              >
                Existing Car
              </button>
            </div>
          )}

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" onClick={saveCar}>
              {editingId ? "Update Car" : "Add Car"}
            </button>

            {(editingId || cloneMode) && (
              <button className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CAR LIST */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5>Cars</h5>

          <ul className="list-group">
            {cars.map(car => (
              <li
                key={car.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex gap-3 align-items-center">
                  <img
                    src={car.images?.[0] || "https://via.placeholder.com/90x60"}
                    alt="car"
                    width={90}
                    height={60}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />

                  <div>
                    <strong>{car.brand} {car.model}</strong>
                    <div className="small text-muted">
                      {car.year} • ₹{car.price}
                    </div>
                    {car.description && (
                      <div className="small text-muted">
                        {car.description.slice(0, 80)}...
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => editCar(car)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteCar(car)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {cars.length === 0 && (
            <p className="text-muted mt-3">No cars found</p>
          )}
        </div>
      </div>
    </div>
  );
}
