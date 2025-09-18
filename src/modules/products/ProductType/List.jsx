import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductTypeAPI } from "../../../api/products";
import {  UserAPI, UserPermissionAPI, PermissionAPI } from "../../../api/permissions";
import { CompanyAPI,} from "../../../api/company";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function PTList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [permissions, setPermissions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Filters
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  // Load current user
  const loadCurrentUser = async () => {
    try {
      const me = await UserAPI.me();
      setCurrentUserId(me.id);
      return me.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Load all data with permission filtering
  const loadData = async () => {
    setLoading(true);
    try {
      const [allRows, perms] = await Promise.all([
        ProductTypeAPI.list(),
        PermissionAPI.list()
      ]);

      setPermissions(perms.map(p => p.code));

      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return;

      const userPerms = await UserPermissionAPI.getByUser(userId);
      const allowedCompanyIds = [...new Set(userPerms.map(up => up.company).filter(Boolean))];

      const filteredRows = allRows.filter(r => r.company && allowedCompanyIds.includes(r.company.id));
      setRows(filteredRows);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load product types", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  // Toggle select row
  const toggleSelectRow = id => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Delete selected rows
  const handleDelete = async () => {
    if (!selectedRows.length) return;
    if (!permissions.includes("product_type_delete")) return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await ProductTypeAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  // Filtered rows based on dropdowns and search
  const filteredRows = rows.filter(r =>
    (!selectedCompany || r.company?.id === selectedCompany) &&
    (!selectedBusiness || r.business_type?.id === selectedBusiness) &&
    (!selectedFactory || r.factory?.id === selectedFactory) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.desc || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("product_type_view")) return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  return (
    <div className="container mt-3">
      {/* ActionBar */}
      <ActionBar
        title="Product Types"
        onCreate={() => nav("/admin/product-types/new")}
        showCreate={permissions.includes("product_type_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("product_type_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="product_types"
        showExport={permissions.includes("product_type_view")}
      />

      {/* Filters */}
      <UserCompanySelector
        selectedUser={selectedUser} setSelectedUser={setSelectedUser}
        selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
        selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
        selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
        setBusinessTypes={setBusinessTypes}
        setFactories={setFactories}
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input
          className="form-control"
          placeholder="Search..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={() => setSearch("")}>Clear</button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th><input type="checkbox" checked={selectedRows.length === filteredRows.length && filteredRows.length > 0} onChange={e => setSelectedRows(e.target.checked ? filteredRows.map(r => r.id) : [])} /></th>
              <th>SN</th>
              <th>Company</th>
              <th>Business Type</th>
              <th>Factory</th>
              <th>Product Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length ? filteredRows.map((r, i) => (
              <tr key={r.id}>
                <td><input type="checkbox" checked={selectedRows.includes(r.id)} onChange={() => toggleSelectRow(r.id)} /></td>
                <td>{i + 1}</td>
                <td>{r.company?.name}</td>
                <td>{r.business_type?.name || "-"}</td>
                <td>{r.factory?.name || "-"}</td>
                <td>{r.name}</td>
                <td>{r.desc}</td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => nav(`/admin/product-types/${r.id}`)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => { setSelectedRows([r.id]); handleDelete(); }}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="text-center">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
