import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { PermissionAPI, UserPermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "./Components/UserCompanySelector";
import PermissionAccordion from "./Components/PermissionAccordion";
import api from "../../../api/axios";

export default function PermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [grouped, setGrouped] = useState({});
  // const [selectedUser, setSelectedUser] = useState(null);
  const [selected, setSelected] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]); // multiple
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState({}); // { companyId: [btId] }
  const [selectedFactories, setSelectedFactories] = useState({}); // { companyId: [{btId, id}] }

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [factories, setFactories] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [currentPermissionSet, setCurrentPermissionSet] = useState(null);

  // Load all permissions
  useEffect(() => {
    const loadPermissions = async () => {
      const data = await PermissionAPI.list();
      setPermissions(data);

      const groupedData = {};
      data.forEach((p) => {
        const mainGroup = ["product", "unit", "category"].some((x) =>
          p.module.includes(x)
        )
          ? "products"
          : "company";

        if (!groupedData[mainGroup]) groupedData[mainGroup] = {};
        if (!groupedData[mainGroup][p.module]) groupedData[mainGroup][p.module] = [];
        groupedData[mainGroup][p.module].push(p);
      });
      setGrouped(groupedData);
    };
    loadPermissions();
  }, []);

  // Load permissions when user/company/business/factory changes
  useEffect(() => {
    const loadHybridPermissions = async () => {
      if (!selectedUser) {
        setSelected([]);
        setCurrentPermissionSet(null);
        return;
      }
      const sets = await UserPermissionAPI.getByUser(selectedUser);
      if (sets.length > 0) {
        // filter by company/business/factory
        const filteredSet = sets.find(
          (s) =>
            (!selectedCompany || s.companies.includes(selectedCompany)) &&
            (!selectedBusiness ||
              (s.business_types[selectedCompany] || []).includes(selectedBusiness)) &&
            (!selectedFactory ||
              (s.factories[selectedCompany] || []).includes(selectedFactory))
        );
        setCurrentPermissionSet(filteredSet || sets[0]);

        const moduleCodes = [];
        if (filteredSet?.modules) {
          Object.entries(filteredSet.modules).forEach(([modName, actions]) => {
            Object.entries(actions).forEach(([action, value]) => {
              if (value) moduleCodes.push(`${modName}_${action}`);
            });
          });
        }
        setSelected(moduleCodes);
      } else {
        setSelected([]);
        setCurrentPermissionSet(null);
      }
    };
    loadHybridPermissions();
  }, [selectedUser, selectedCompany, selectedBusiness, selectedFactory]);

const save = async () => {
  if (!selectedUser) {
    return Swal.fire("⚠️ Error", "Select a user first", "warning");
  }

  try {
    // Prepare payload
    const payload = {
      user: selectedUser,
      role: null,
      companies: selectedCompanies,
      business_types: selectedBusinessTypes,
      factories: {},
      modules: {},
    };

    // Factories format
    Object.keys(selectedFactories).forEach((cid) => {
      payload.factories[cid] = selectedFactories[cid].map((f) => f.id);
    });

    // Modules format
    selected.forEach((modAction) => {
      const [modName, action] = modAction.split("_");
      if (!modName || !isNaN(modName)) return;

      if (!payload.modules[modName]) {
        payload.modules[modName] = { create: false, edit: false, delete: false, view: false };
      }

      if (payload.modules[modName][action] !== undefined) {
        payload.modules[modName][action] = true;
      }
    });

    // 1️⃣ Create/Update UserPermissionSet
    const setRes = await api.post("/permission-sets/update-or-create/", {
      user: payload.user,
      role: payload.role,
      companies: payload.companies,
      business_types: payload.business_types,
      factories: payload.factories,
    });

    const setId = setRes.data.id; // ✅ setId capture করা

    // 2️⃣ Update/Create each module
    for (let moduleName of Object.keys(payload.modules)) {
      console.log("Posting module:", moduleName, payload.modules[moduleName]);
      await api.post("/module-permissions/update-or-create/", {
        permission_set: setId,
        module_name: moduleName,
        permissions: payload.modules[moduleName],
      });
    }

    // 3️⃣ Reload permissions for the user
    await UserPermissionAPI.getByUser(selectedUser);

    Swal.fire("✅ Saved", "Permissions updated successfully!", "success");
  } catch (err) {
    console.error("Save Error:", err);
    Swal.fire("❌ Error", "Failed to save permissions", "error");
  }
};



  return (
    <div className="container py-3">
      <div className="text-center bg-primary text-white py-3 rounded mb-4 shadow">
        <h2 className="mb-1">Permission Management</h2>
        <p className="mb-0">Assign module-wise permissions to users</p>
      </div>

      <UserCompanySelector
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCompanies={selectedCompanies}
        setSelectedCompanies={setSelectedCompanies}
        selectedBusinessTypes={selectedBusinessTypes}
        setSelectedBusinessTypes={setSelectedBusinessTypes}
        selectedFactories={selectedFactories}
        setSelectedFactories={setSelectedFactories}
      />


      <PermissionAccordion grouped={grouped} selected={selected} setSelected={setSelected} />

      <div className="text-center mt-4">
        <button className="btn btn-primary px-5 py-2 shadow-lg" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
