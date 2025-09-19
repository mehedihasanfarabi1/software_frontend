import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductAPI, ProductTypeAPI, CategoryAPI } from "../../../api/products";
import {CompanyAPI} from '../../../api/company'
import "../../../styles/Table.css";

export default function ItemForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);
  const [cats, setCats] = useState([]);

  const [form, setForm] = useState({
    company: "",
    product_type: "",
    category: "",
    name: "",
    short_name: "",
    description: "",
  });

  // 🔹 Load companies on mount
  useEffect(() => {
    CompanyAPI.list().then(setCompanies);
  }, []);

  // 🔹 Load product types based on selected company
  useEffect(() => {
    if (form.company) {
      ProductTypeAPI.list({ company: form.company }).then(setTypes);
    } else {
      setTypes([]);
    }
    // Reset dependent fields when company changes
    setForm((prev) => ({ ...prev, product_type: "", category: "" }));
    setCats([]);
  }, [form.company]);

  // 🔹 Load categories based on selected product type
  useEffect(() => {
    if (form.product_type) {
      CategoryAPI.list({ product_type: form.product_type }).then(setCats);
    } else {
      setCats([]);
    }
    // Reset category when product type changes
    setForm((prev) => ({ ...prev, category: "" }));
  }, [form.product_type]);

  // 🔹 Load existing product if editing
  useEffect(() => {
    if (id) {
      ProductAPI.retrieve(id).then((d) => {
        setForm({
          company: d.company?.id || "",
          product_type: d.product_type?.id || "",
          category: d.category?.id || "",
          name: d.name || "",
          short_name: d.short_name || "",
          description: d.description || "",
        });
      });
    }
  }, [id]);

  // 🔹 Submit handler
  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      short_name: form.short_name,
      description: form.description,
      company_id: form.company || null,
      product_type_id: form.product_type || null,
      category_id: form.category || null,
    };

    try {
      if (id) {
        await ProductAPI.update(id, payload);
      } else {
        await ProductAPI.create(payload);
      }
      nav("/admin/products/");
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err);
      alert("Failed to save product");
    }
  };

  return (
    <div className="container mt-3">
      <div className="custom-form">
        <h4>{id ? "Edit" : "Create"} Product</h4>
        <form onSubmit={onSubmit} noValidate>
          <div className="row g-3">
            {/* Company Select */}
            <div className="col-md-6">
              <label>Company</label>
              <select
                className="form-control"
                required
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
              >
                <option value="">-- select --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Type Select */}
            <div className="col-md-6">
              <label>Product Type</label>
              <select
                className="form-control"
                required
                value={form.product_type}
                onChange={(e) =>
                  setForm({ ...form, product_type: e.target.value })
                }
                disabled={!form.company}
              >
                <option value="">-- select --</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div className="col-md-6">
              <label>Category</label>
              <select
                className="form-control"
                required
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                disabled={!form.product_type}
              >
                <option value="">-- select --</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div className="col-md-6">
              <label>Product Name</label>
              <input
                className="form-control"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Short Name */}
            <div className="col-md-6">
              <label>Short Name</label>
              <input
                className="form-control"
                type="text"
                value={form.short_name || ""}
                onChange={(e) =>
                  setForm({ ...form, short_name: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="col-12">
              <label>Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="actions mt-3">
            <button className="btn btn-primary">Save</button>
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
