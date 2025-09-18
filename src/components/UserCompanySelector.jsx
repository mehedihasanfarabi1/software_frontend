import React, { useEffect, useState } from "react";
import Select from "react-select";
import {  UserPermissionAPI, UserAPI } from "../api/permissions";
import {  CompanyAPI, } from "../api/company";

export default function UserCompanySelector({
  selectedUser,
  setSelectedUser,
  selectedCompany,
  setSelectedCompany,
  selectedBusiness,
  setSelectedBusiness,
  selectedFactory,
  setSelectedFactory,
  setBusinessTypes,
  setFactories,
}) {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({ business_types: [], factories: [] });

  useEffect(() => {
    const loadUsers = async () => {
      const data = await UserAPI.list();
      setUsers(data);
    };
    loadUsers();

    const loadCompanies = async () => {
      const data = await CompanyAPI.list();
      setCompanies(data);
    };
    loadCompanies();
  }, []);

  const handleUserChange = async (opt) => {
    const userId = opt ? opt.value : null;
    setSelectedUser(userId);
    setSelectedCompany(null);
    setSelectedBusiness(null);
    setSelectedFactory(null);
    setBusinessTypes([]);
    setFactories([]);
    setCompanyDetails({ business_types: [], factories: [] });

    if (!userId) return;

    // Filter companies based on user permission
    const perms = await UserPermissionAPI.getByUser(userId);
    const allowedCompanies = perms.map(p => p.company).filter(Boolean);
    setCompanies(prev => prev.filter(c => allowedCompanies.includes(c.id)));
  };

  const handleCompanyChange = async (opt) => {
    const companyId = opt ? opt.value : null;
    setSelectedCompany(companyId);
    setSelectedBusiness(null);
    setSelectedFactory(null);
    setBusinessTypes([]);
    setFactories([]);
    setCompanyDetails({ business_types: [], factories: [] });

    if (!companyId) return;

    // Load company details for business types and factories
    const details = await CompanyAPI.details(companyId);
    setCompanyDetails(details);
    setBusinessTypes(details.business_types || []);
    setFactories(details.factories || []);
  };

  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {/* <div style={{ minWidth: 250 }}>
        <Select
          placeholder="Select User"
          options={users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
          value={selectedUser ? { value: selectedUser, label: users.find(u => u.id === selectedUser)?.name } : null}
          onChange={handleUserChange}
          isClearable
        />
      </div> */}

      <div style={{ minWidth: 200 }}>
        <Select
          placeholder="Select Company"
          options={companies.map(c => ({ value: c.id, label: c.name }))}
          value={selectedCompany ? { value: selectedCompany, label: companies.find(c => c.id === selectedCompany)?.name } : null}
          onChange={handleCompanyChange}
          isClearable
        />
      </div>

      <div style={{ minWidth: 180 }}>
        <Select
          placeholder="Select Business Type"
          options={companyDetails.business_types?.map(b => ({ value: b.id, label: b.name })) || []}
          value={selectedBusiness ? { value: selectedBusiness, label: companyDetails.business_types.find(b => b.id === selectedBusiness)?.name } : null}
          onChange={opt => setSelectedBusiness(opt ? opt.value : null)}
          isClearable
        />
      </div>

      <div style={{ minWidth: 180 }}>
        <Select
          placeholder="Select Factory"
          options={companyDetails.factories?.map(f => ({ value: f.id, label: f.name })) || []}
          value={selectedFactory ? { value: selectedFactory, label: companyDetails.factories.find(f => f.id === selectedFactory)?.name } : null}
          onChange={opt => setSelectedFactory(opt ? opt.value : null)}
          isClearable
        />
      </div>
    </div>
  );
}
