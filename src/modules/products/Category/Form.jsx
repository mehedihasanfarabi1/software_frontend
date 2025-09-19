import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryAPI, ProductTypeAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company"; // ✅ Import company API
import "../../../styles/Table.css";

export default function CategoryForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);

  const [form, setForm] = useState({
    company_id: "",
    product_type_id: "",
    name: "",
    description: "",
  });

  // ✅ Load companies initially
  useEffect(() => {
    CompanyAPI.list()
      .then(setCompanies)
      .catch((err) => console.error("Error loading companies:", err));
  }, []);

  // ✅ Load product types when company changes
  useEffect(() => {
    if (form.company_id) {
      ProductTypeAPI.list({ company: form.company_id })
        .then(setTypes)
        .catch((err) => console.error("Error loading product types:", err));
    } else {
      setTypes([]);
      setForm((prev) => ({ ...prev, product_type_id: "" }));
    }
  }, [form.company_id]);

  // ✅ Load category if editing
  useEffect(() => {
    if (id) {
      CategoryAPI.retrieve(id).then((data) => {
        setForm({
          company_id: data.company?.id || "",
          product_type_id: data.product_type?.id || "",
          name: data.name,
          description: data.description || "",
        });
      });
    }
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) {
      alert("Please select a Company.");
      return;
    }
    if (!form.product_type_id) {
      alert("Please select a Product Type.");
      return;
    }

    try {
      if (id) {
        await CategoryAPI.update(id, form);
      } else {
        await CategoryAPI.create(form);
      }
      nav("/admin/categories");
    } catch (err) {
      console.error("Error saving category:", err.response?.data || err);
      alert("Failed to save category");
    }
  };

  return (
    <div className="container mt-3">
      <div className="custom-form">
        <h4>{id ? "Edit" : "Create"} Category</h4>
        <form onSubmit={onSubmit} noValidate>
          <div className="row g-3">
            {/* ✅ Company Dropdown */}
            <div className="col-md-6">
              <label>Company</label>
              <select
                required
                value={form.company_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company_id: e.target.value ? parseInt(e.target.value) : "",
                    product_type_id: "", // reset product type
                  })
                }
              >
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Product Type Dropdown (filtered by company) */}
            <div className="col-md-6">
              <label>Product Type</label>
              <select
                required
                value={form.product_type_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    product_type_id: e.target.value
                      ? parseInt(e.target.value)
                      : "",
                  })
                }
                disabled={!form.company_id} // disabled until company selected
              >
                <option value="">-- Select Product Type --</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label>Category Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-primary" type="submit">
              Save
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => nav(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
