import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UnitConversionAPI, UnitAPI } from "../../../api/products";
import Swal from "sweetalert2";

export default function UnitConversionForm() {
  const { id } = useParams();
  const [form, setForm] = useState({ parent_unit_id: "", qty: "", child_unit_id: "" });
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    loadUnits();
    if (id) loadData();
  }, [id]);

  const loadUnits = async () => {
    try {
      const data = await UnitAPI.list();
      setUnits(data);
    } catch (err) {
      console.error("Error loading units:", err);
    }
  };

  const loadData = async () => {
    try {
      const data = await UnitConversionAPI.retrieve(id);
      setForm({
        parent_unit_id: data.parent_unit?.id || "",
        qty: data.qty || "",
        child_unit_id: data.child_unit?.id || "",
      });
    } catch (err) {
      console.error("Error loading conversion:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        parent_unit_id: parseInt(form.parent_unit_id),
        child_unit_id: parseInt(form.child_unit_id),
        qty: parseFloat(form.qty),
      };

      if (id) {
        await UnitConversionAPI.update(id, payload);
        Swal.fire("✅ Updated!", "Unit conversion updated successfully", "success");
      } else {
        await UnitConversionAPI.create(payload);
        Swal.fire("✅ Created!", "Unit conversion created successfully", "success");
      }

      nav("/admin/unit-conversions");
    } catch (err) {
      console.error("Error saving conversion:", err.response?.data || err.message);
      Swal.fire("❌ Error", JSON.stringify(err.response?.data || err.message), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">{id ? "Edit Unit Conversion" : "New Unit Conversion"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Parent Unit</label>
              <select
                className="form-select"
                value={form.parent_unit_id}
                onChange={(e) => setForm({ ...form, parent_unit_id: e.target.value })}
                required
              >
                <option value="">-- Select Unit --</option>
                {units
                  .filter((u) => u.id !== parseInt(form.child_unit_id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit_name} ({u.short_name})
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Child Unit</label>
              <select
                className="form-select"
                value={form.child_unit_id}
                onChange={(e) => setForm({ ...form, child_unit_id: e.target.value })}
                required
              >
                <option value="">-- Select Unit --</option>
                {units
                  .filter((u) => u.id !== parseInt(form.parent_unit_id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit_name} ({u.short_name})
                    </option>
                  ))}
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => nav("/admin/unit-conversions")}
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
