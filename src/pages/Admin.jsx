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
import { ToastContainer, toast } from "react-toastify";
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
  const [showModal, setShowModal] = useState(false);
  const [newImages, setNewImages] = useState([]);

  /* ================= DARK MODE ================= */
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("adminDark") === "true"
  );

  useEffect(() => {
    localStorage.setItem("adminDark", darkMode);
  }, [darkMode]);

  const theme = {
    bg: darkMode ? "#020617" : "#f4f6fb",
    card: darkMode ? "#0f172a" : "#ffffff",
    text: darkMode ? "#e5e7eb" : "#020617",
    muted: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "#1e293b" : "#e5e7eb",
  };

  const emptyForm = {
    brand: "",
    model: "",
    year: "",
    price: "",
    stock: 1,
    description: "",
    images: [],
  };

  const [form, setForm] = useState(emptyForm);

  /* ================= FETCH ================= */
  const fetchCars = async () => {
    const snap = await getDocs(collection(db, "cars"));
    setCars(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchCars();
  }, []);

  /* ================= RESET ================= */
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setNewImages([]);
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

    const payload = {
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      price: Number(form.price),
      stock: Number(form.stock),
      description: form.description,
      images: [...form.images, ...uploaded],
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
    setShowModal(false);
    fetchCars();
  };

  /* ================= EDIT ================= */
  const editCar = (car) => {
    setEditingId(car.id);
    setForm({
      brand: car.brand || "",
      model: car.model || "",
      year: car.year || "",
      price: car.price || "",
      stock: car.stock ?? 1,
      description: car.description || "",
      images: car.images || [],
    });
    setNewImages([]);
    setShowModal(true);
  };

  /* ================= DELETE ================= */
  const deleteCar = async (car) => {
    if (!window.confirm("Delete car?")) return;
    await deleteDoc(doc(db, "cars", car.id));
    toast.error("Car deleted");
    fetchCars();
  };

  /* ================= STOCK ================= */
  const updateStock = async (carId, currentStock, delta) => {
    const newStock = currentStock + delta;
    if (newStock < 0) return;

    await updateDoc(doc(db, "cars", carId), { stock: newStock });
    toast.success(`Stock updated to ${newStock}`);
    fetchCars();
  };

  /* ================= IMAGE DRAG ================= */
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(form.images);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setForm(prev => ({ ...prev, images: items }));
  };

  const removeImage = (url) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url),
    }));
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text }}>
      <ToastContainer />

      <div className="container py-4">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">🚘 Admin – Cars</h3>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* HERO CARD */}
        <div className="card shadow-sm mb-4" style={{ background: theme.card }}>
          <div className="card-body row align-items-center">
            <div className="col-md-8">
              <h4 className="fw-bold">Manage Your Car Inventory</h4>
              <p style={{ color: theme.muted }}>
                Add new cars, edit details, and manage stock easily.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                + Add Car
              </button>
            </div>
          </div>
        </div>

        {/* CAR LIST */}
        <div className="card shadow-sm" style={{ background: theme.card }}>
          <div className="card-body">
            <h5>Cars</h5>

            <ul className="list-group">
              {cars.map(car => (
                <li
                  key={car.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  style={{
                    background: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                >
                  <div>
                    <strong>{car.brand} {car.model}</strong>
                    <div className="small" style={{ color: theme.muted }}>
                      {car.year} • ₹{car.price} • Stock: {car.stock ?? 0}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => updateStock(car.id, car.stock ?? 0, 1)}
                    >
                      + Stock
                    </button>

                    <button
                      className="btn btn-sm btn-warning"
                      disabled={(car.stock ?? 0) === 0}
                      onClick={() => updateStock(car.id, car.stock ?? 0, -1)}
                    >
                      − Stock
                    </button>

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

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.7)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ background: theme.card, color: theme.text }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Edit Car" : "Add Car"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  {["brand", "model", "year", "price"].map(f => (
                    <div key={f} className="col-md-3">
                      <input
                        className="form-control"
                        placeholder={f.toUpperCase()}
                        value={form[f]}
                        onChange={e =>
                          setForm({ ...form, [f]: e.target.value })
                        }
                      />
                    </div>
                  ))}

                  <div className="col-md-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="STOCK"
                      value={form.stock}
                      onChange={e =>
                        setForm({ ...form, stock: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="col-12">
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

                  {/* ✅ IMAGE ONLY FILE INPUT */}
                  <div className="col-12">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="form-control"
                      onChange={e => {
                        const files = Array.from(e.target.files);
                        const imagesOnly = files.filter(file =>
                          file.type.startsWith("image/")
                        );

                        if (imagesOnly.length !== files.length) {
                          toast.error("Only image files are allowed");
                        }

                        setNewImages(imagesOnly);
                      }}
                    />
                  </div>
                </div>

                {form.images.length > 0 && (
                  <div className="mt-3">
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="imgs" direction="horizontal">
                        {(p) => (
                          <div
                            ref={p.innerRef}
                            {...p.droppableProps}
                            className="d-flex gap-2 flex-wrap"
                          >
                            {form.images.map((img, i) => (
                              <Draggable key={img} draggableId={img} index={i}>
                                {(p) => (
                                  <div
                                    ref={p.innerRef}
                                    {...p.draggableProps}
                                    {...p.dragHandleProps}
                                  >
                                    <img
                                      src={img}
                                      width={90}
                                      height={60}
                                      style={{ borderRadius: 6 }}
                                    />
                                    <button
                                      className="btn btn-sm btn-danger w-100 mt-1"
                                      onClick={() => removeImage(img)}
                                    >
                                      Remove
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
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveCar}>
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
