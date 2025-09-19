// PermissionPage.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PermissionAccordion from "./Components/PermissionAccordion";
import UserCompanySelector from "./Components/UserCompanySelector";
import { PermissionAPI, UserPermissionAPI } from "../../../api/permissions";

export default function PermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selectedModules, setSelectedModules] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState({});
  const [selectedFactories, setSelectedFactories] = useState({});

  const [currentPermissionSet, setCurrentPermissionSet] = useState(null);

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      const data = await PermissionAPI.list();
      setPermissions(data);

      const groupedData = {};
      data.forEach((p) => {
        const companyModules = ["company", "business_type", "factory"];
        const productModules = [
          "product",
          "product_type",
          "category",
          "unit",
          "unit_size",
          "unit_conversion",
          "product_size_setting",
        ];

        let mainGroup = "other";
        if (companyModules.includes(p.module)) mainGroup = "company";
        else if (productModules.includes(p.module)) mainGroup = "products";

        if (!groupedData[mainGroup]) groupedData[mainGroup] = {};
        if (!groupedData[mainGroup][p.module]) groupedData[mainGroup][p.module] = [];
        groupedData[mainGroup][p.module].push(p);
      });

      setGrouped(groupedData);
    };
    loadPermissions();
  }, []);

  // Load user permissions
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!selectedUser) {
        setSelectedModules([]);
        setSelectedCompanies([]);
        setSelectedBusinessTypes({});
        setSelectedFactories({});
        setCurrentPermissionSet(null);
        return;
      }

      const sets = await UserPermissionAPI.getByUser(selectedUser.value);
      if (sets.length === 0) {
        setSelectedModules([]);
        setSelectedCompanies([]);
        setSelectedBusinessTypes({});
        setSelectedFactories({});
        setCurrentPermissionSet(null);
        return;
      }

      const setData = sets[0];
      setCurrentPermissionSet(setData);

      // Module codes
      const moduleCodes = [];
      ["product_module", "company_module", "hr_module", "accounts_module", "inventory_module", "settings_module"].forEach(
        (mod) => {
          if (setData[mod]) {
            Object.entries(setData[mod]).forEach(([moduleKey, actions]) => {
              if (typeof actions === "object") {
                Object.entries(actions).forEach(([action, val]) => {
                  if (val) moduleCodes.push(`${moduleKey}_${action}`);
                });
              }
            });
          }
        }
      );
      setSelectedModules(moduleCodes);

      // Companies
      const selectedComps = (setData.companies || []).map((id) => ({ value: id, label: "" })); // label will populate in UserCompanySelector
      setSelectedCompanies(selectedComps);

      // Business Types & Factories
      setSelectedBusinessTypes(setData.business_types || {});
      setSelectedFactories(setData.factories || {});
    };
    loadUserPermissions();
  }, [selectedUser]);

  // Save
  const save = async () => {
    if (!selectedUser) {
      return Swal.fire("⚠️ Error", "Select a user first", "warning");
    }

    try {
      const payload = {
        user: selectedUser?.value || selectedUser,  // ✅ safe fallback
        role: null,
        companies: selectedCompanies.map((c) => c.value),
        business_types: selectedBusinessTypes,   // ✅ এখন সঠিক object যাবে
        factories: selectedFactories,
        product_module: {},
        company_module: {},
        hr_module: {},
        accounts_module: {},
        inventory_module: {},
        settings_module: {},
      };

      // ✅ Module mapping ঠিক করা হলো
      selectedModules.forEach((modAction) => {
        // শেষের "_" এর আগে পর্যন্ত হবে module, পরে হবে action
        const [module, action] = modAction.split(/_(?=[^_]+$)/);

        const productModules = [
          "product",
          "product_type",
          "category",
          "unit",
          "unit_size",
          "unit_conversion",
          "product_size_setting",
        ];
        const companyModules = ["company", "business_type", "factory"];

        if (productModules.includes(module)) {
          if (!payload.product_module[module]) {
            payload.product_module[module] = { create: false, edit: false, delete: false, view: false };
          }
          if (action in payload.product_module[module]) {
            payload.product_module[module][action] = true;
          }
        }

        if (companyModules.includes(module)) {
          if (!payload.company_module[module]) {
            payload.company_module[module] = { create: false, edit: false, delete: false, view: false };
          }
          if (action in payload.company_module[module]) {
            payload.company_module[module][action] = true;
          }
        }
      });

      console.log("🚀 Final Payload:", payload);

      await UserPermissionAPI.updateOrCreate(selectedUser.value, payload);
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

      {/* User + Company Selector */}
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

      {/* Permission Accordion */}
      <PermissionAccordion
        grouped={grouped}
        selected={selectedModules}
        setSelected={setSelectedModules}
        companies={selectedCompanies}
        businessTypes={selectedBusinessTypes}
        selectedBusinessTypes={selectedBusinessTypes}
        setSelectedBusinessTypes={setSelectedBusinessTypes}
        factories={selectedFactories}
        selectedFactories={selectedFactories}
        setSelectedFactories={setSelectedFactories}
      />

      <div className="text-center mt-4">
        <button className="btn btn-primary px-5 py-2 shadow-lg" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
