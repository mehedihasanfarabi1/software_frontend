import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UnitAPI, UnitSizeAPI } from "../../../api/products";
import Swal from "sweetalert2";

export default function UnitSizeForm() {
  const [form, setForm] = useState({ unit_id: "", size_name: "", uom_weight: "" });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    UnitAPI.list().then(setUnits);
    if (id) {
      UnitSizeAPI.retrieve(id).then((data) => {
        setForm({
          unit_id: data.unit?.id || "",
          size_name: data.size_name,
          uom_weight: data.uom_weight,
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        unit_id: parseInt(form.unit_id),
        size_name: form.size_name,
        uom_weight: parseFloat(form.uom_weight),
      };

      if (id) {
        await UnitSizeAPI.update(id, payload);
        Swal.fire("Updated!", "Unit size updated successfully", "success");
      } else {
        await UnitSizeAPI.create(payload);
        Swal.fire("Created!", "Unit size created successfully", "success");
      }

      nav("/admin/unit-sizes");
    } catch (err) {
      console.error("Error saving unit size:", err.response?.data || err);
      Swal.fire("Error", "Failed to save unit size", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">{id ? "Edit Unit Size" : "Create Unit Size"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Unit</label>
              <select
                className="form-select"
                value={form.unit_id}
                onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                required
              >
                <option value="">-- Select Unit --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.short_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Size Name</label>
              <input
                type="text"
                className="form-control"
                value={form.size_name}
                onChange={(e) => setForm({ ...form, size_name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Weight (UOM)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.uom_weight}
                onChange={(e) =>
                  setForm({ ...form, uom_weight: e.target.value })
                }
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => nav("/admin/unit-sizes")}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
