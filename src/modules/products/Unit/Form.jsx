import React, { useState, useEffect } from "react";
import { UnitAPI } from "../../../api/products";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function UnitForm() {
  const [form, setForm] = useState({ name: "", short_name: "" });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      UnitAPI.get(id).then((data) => setForm(data));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await UnitAPI.update(id, form);
        Swal.fire("Updated!", "Unit updated successfully", "success");
      } else {
        await UnitAPI.create(form);
        Swal.fire("Created!", "Unit created successfully", "success");
      }
      navigate("/admin/units");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">{id ? "Edit Unit" : "Create Unit"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Unit Name</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Short Name</label>
              <input
                type="text"
                className="form-control"
                value={form.short_name}
                onChange={(e) =>
                  setForm({ ...form, short_name: e.target.value })
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/units")}
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
