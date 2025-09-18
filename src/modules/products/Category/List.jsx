// src/pages/admin/category/CategoryList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryAPI, ProductTypeAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import { PermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function CategoryList() {
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [company, setCompany] = useState("");
  const [productType, setProductType] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // ✅ Load categories, companies & permissions
  const load = async () => {
    setLoading(true);
    try {
      const categories = await CategoryAPI.list();
      setRows(categories);

      const cs = await CompanyAPI.list();
      setCompanies(cs);

      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Load product types when company changes
  useEffect(() => {
    if (company) {
      ProductTypeAPI.list({ company })
        .then(setProductTypes)
        .catch((err) => console.error("Error loading product types:", err));
    } else {
      setProductTypes([]);
      setProductType("");
    }
  }, [company]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = rows.filter(
    (r) =>
      (!company || r.company?.id === Number(company)) &&
      (!productType || r.product_type?.id === Number(productType)) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase()))
  );

  const onDelete = async () => {
    if (!selected.length) return;

    if (!userPermissions.includes("category_delete")) {
      return Swal.fire(
        "❌ You do not have access for this feature",
        "",
        "error"
      );
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} category(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await CategoryAPI.remove(id);
        }
        setSelected([]);
        load();
        Swal.fire("Deleted!", "Selected category(s) removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  const onImport = async (parsedData) => {
    if (!userPermissions.includes("category_create")) {
      return Swal.fire(
        "❌ You do not have access for this feature",
        "",
        "error"
      );
    }

    try {
      for (let row of parsedData) {
        await CategoryAPI.create({
          name: row.name,
          description: row.description || "",
          product_type_id: productType || null,
          company_id: company || null,
        });
      }
      Swal.fire("Imported successfully!", "", "success");
      load();
    } catch (err) {
      Swal.fire("Import failed", err.message, "error");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading data...</div>
      </div>
    );
  }

  // View permission check
  if (!userPermissions.includes("category_view")) {
    return (
      <div className="alert alert-danger mt-3 text-center">
        Access Denied
      </div>
    );
  }

  return (
    <div className="container mt-3">
      {/* ActionBar with permissions */}
      <ActionBar
        title="Category List"
        onCreate={
          userPermissions.includes("category_create")
            ? () => nav("/admin/categories/new")
            : undefined
        }
        showCreate={userPermissions.includes("category_create")}
        onDelete={onDelete}
        showDelete={userPermissions.includes("category_delete")}
        selectedCount={selected.length}
        data={filtered}
        onImport={onImport}
        exportFileName="categories"
        showExport={userPermissions.includes("category_view")}
        showPrint={userPermissions.includes("category_view")}
      />

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <select
          className="form-select"
          style={{ maxWidth: 250 }}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        >
          <option value="">-- All Companies --</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ maxWidth: 250 }}
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          disabled={!company}
        >
          <option value="">-- All Product Types --</option>
          {productTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-danger" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="custom-table-wrapper table-responsive">
        <table className="custom-table table table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th style={{ width: 50 }}>
                <input
                  type="checkbox"
                  checked={
                    selected.length === filtered.length && filtered.length > 0
                  }
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? filtered.map((r) => r.id) : []
                    )
                  }
                />
              </th>
              <th style={{ width: 60 }}>SN</th>
              <th>Company</th>
              <th>Product Type</th>
              <th>Category Name</th>
              <th>Description</th>
              <th style={{ width: 150 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td>{i + 1}</td>
                  <td>{r.company?.name || "-"}</td>
                  <td>{r.product_type?.name || "-"}</td>
                  <td>{r.name}</td>
                  <td>{r.description}</td>
                  <td className="custom-actions d-flex flex-wrap gap-1">
                    {/* Edit */}
                    {userPermissions.includes("category_edit") ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => nav(`/admin/categories/${r.id}`)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          Swal.fire(
                            "❌ You do not have access for this feature",
                            "",
                            "error"
                          )
                        }
                      >
                        Edit
                      </button>
                    )}

                    {/* Delete */}
                    {userPermissions.includes("category_delete") ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelected([r.id]);
                          onDelete();
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          Swal.fire(
                            "❌ You do not have access for this feature",
                            "",
                            "error"
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
