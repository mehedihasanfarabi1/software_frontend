import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductAPI, ProductTypeAPI, CategoryAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import { PermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function ItemList() {
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ company: "", product_type: "", category: "" });
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  // Load products and permissions
  const load = async () => {
    setLoading(true);
    try {
      const data = await ProductAPI.list({
        company: filters.company || undefined,
        product_type: filters.product_type || undefined,
        category: filters.category || undefined,
      });
      setRows(data);

      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    } catch (err) {
      console.error("Error loading products:", err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters]);

  // Load company/type/category options
  useEffect(() => {
    CompanyAPI.list().then(setCompanies);
  }, []);

  useEffect(() => {
    if (filters.company) {
      ProductTypeAPI.list({ company: filters.company }).then(setTypes);
    } else {
      setTypes([]);
    }
    setFilters((prev) => ({ ...prev, product_type: "", category: "" }));
    setCats([]);
  }, [filters.company]);

  useEffect(() => {
    if (filters.product_type) {
      CategoryAPI.list({ product_type: filters.product_type }).then(setCats);
    } else {
      setCats([]);
    }
    setFilters((prev) => ({ ...prev, category: "" }));
  }, [filters.product_type]);

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onDelete = async () => {
    if (!selected.length) return;

    if (!userPermissions.includes("product_delete")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} product(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await ProductAPI.remove(id);
        }
        setSelected([]);
        load();
        Swal.fire("Deleted!", "Selected product(s) removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  const onImport = async (parsedData) => {
    if (!userPermissions.includes("product_create")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }
    try {
      for (let row of parsedData) {
        await ProductAPI.create({
          name: row.name,
          short_name: row.short_name || "",
          company_id: row.company_id || null,
          product_type_id: row.product_type_id || null,
          category_id: row.category_id || null,
        });
      }
      Swal.fire("Imported successfully!", "", "success");
      load();
    } catch (err) {
      Swal.fire("Import failed", err.message, "error");
    }
  };

  const filtered = rows.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      (r.short_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.category?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.product_type?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.company?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading data...</div>
      </div>
    );
  }

  // View permission check
  if (!userPermissions.includes("product_view")) {
    return <div className="alert alert-danger mt-3 text-center">Access Denied</div>;
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Products"
        onCreate={userPermissions.includes("product_create") ? () => nav("/admin/products/new") : undefined}
        showCreate={userPermissions.includes("product_create")}
        onDelete={onDelete}
        showDelete={userPermissions.includes("product_delete")}
        selectedCount={selected.length}
        data={filtered}
        onImport={onImport}
        exportFileName="products"
        showExport={userPermissions.includes("product_view")}
        showPrint={userPermissions.includes("product_view")}
      />

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label>Company</label>
          <select
            className="form-select"
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
          >
            <option value="">All</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label>Product Type</label>
          <select
            className="form-select"
            value={filters.product_type}
            onChange={(e) => setFilters({ ...filters, product_type: e.target.value })}
            disabled={!filters.company}
          >
            <option value="">All</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label>Category</label>
          <select
            className="form-select"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            disabled={!filters.product_type}
          >
            <option value="">All</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label>Search</label>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-danger" onClick={() => setSearch("")}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="custom-table-wrapper">
        <table className="custom-table table table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th style={{ width: 50 }}>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) => setSelected(e.target.checked ? filtered.map((r) => r.id) : [])}
                />
              </th>
              <th style={{ width: 60 }}>#</th>
              <th>Name</th>
              <th>Company</th>
              <th>Category</th>
              <th>Type</th>
              <th>Short Name</th>
              <th style={{ width: 180 }}>Actions</th>
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
                  <td>{r.name}</td>
                  <td>{r.company?.name || "-"}</td>
                  <td>{r.category?.name || "-"}</td>
                  <td>{r.product_type?.name || "-"}</td>
                  <td>{r.short_name}</td>
                  <td className="custom-actions d-flex flex-wrap gap-1">
                    {userPermissions.includes("product_edit") ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => nav(`/admin/products/${r.id}`)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          Swal.fire("❌ You do not have access for this feature", "", "error")
                        }
                      >
                        Edit
                      </button>
                    )}
                    {userPermissions.includes("product_delete") ? (
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
                          Swal.fire("❌ You do not have access for this feature", "", "error")
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
                <td colSpan={8} className="text-center">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
