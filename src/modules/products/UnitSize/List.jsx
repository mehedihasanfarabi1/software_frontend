import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnitSizeAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function UnitSizeList() {
  const [sizes, setSizes] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await UnitSizeAPI.list();
      setSizes(data);

      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    } catch (err) {
      console.error("Error loading unit sizes:", err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onDelete = async () => {
    if (!selected.length) return;

    if (!userPermissions.includes("unit_size_delete")) {
      return Swal.fire(
        "❌ You do not have access for this feature",
        "",
        "error"
      );
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} unit size(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await UnitSizeAPI.remove(id);
        }
        setSelected([]);
        load();
        Swal.fire("Deleted!", "Selected unit size(s) removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  const onImport = async (parsedData) => {
    if (!userPermissions.includes("unit_size_create")) {
      return Swal.fire(
        "❌ You do not have access for this feature",
        "",
        "error"
      );
    }

    try {
      for (let row of parsedData) {
        await UnitSizeAPI.create({
          unit_id: row.unit_id,
          size_name: row.size_name,
          uom_weight: row.uom_weight,
        });
      }
      Swal.fire("Imported successfully!", "", "success");
      load();
    } catch (err) {
      Swal.fire("Import failed", err.message, "error");
    }
  };

  const filtered = sizes.filter(
    (s) =>
      s.size_name?.toLowerCase().includes(search.toLowerCase()) ||
      (s.unit?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.unit?.short_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading data...</div>
      </div>
    );
  }

  if (!userPermissions.includes("unit_size_view")) {
    return (
      <div className="alert alert-danger mt-3 text-center">
        Access Denied
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Unit Sizes"
        onCreate={
          userPermissions.includes("unit_size_create")
            ? () => nav("/admin/unit-sizes/new")
            : undefined
        }
        showCreate={userPermissions.includes("unit_size_create")}
        onDelete={onDelete}
        showDelete={userPermissions.includes("unit_size_delete")}
        selectedCount={selected.length}
        data={filtered}
        onImport={onImport}
        exportFileName="unit_sizes"
        showExport={userPermissions.includes("unit_size_view")}
        showPrint={userPermissions.includes("unit_size_view")}
      />

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search sizes..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-danger" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      <div className="custom-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? filtered.map((s) => s.id) : []
                    )
                  }
                />
              </th>
              <th style={{ width: 60 }}>#</th>
              <th>Unit</th>
              <th>Size Name</th>
              <th>Short Name</th>
              <th>Weight (UOM)</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleSelect(s.id)}
                    />
                  </td>
                  <td>{i + 1}</td>
                  <td>{s.unit?.name || "-"}</td>
                  <td>{s.size_name}</td>
                  <td>{s.unit?.short_name || "-"}</td>
                  <td>{s.uom_weight}</td>
                  <td className="custom-actions">
                    {userPermissions.includes("unit_size_edit") ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => nav(`/admin/unit-sizes/${s.id}`)}
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

                    {userPermissions.includes("unit_size_delete") ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelected([s.id]);
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
                  No unit sizes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
