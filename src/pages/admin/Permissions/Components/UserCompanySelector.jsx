import React, { useEffect, useState } from "react";
import { UserAPI } from "../../../../api/users";
import { CompanyAPI, BusinessTypeAPI, FactoryAPI } from "../../../../api/company";

export default function UserCompanySelector({
  selectedUser,
  setSelectedUser,
  selectedCompanies = [],
  setSelectedCompanies,
  selectedBusinessTypes = {},
  setSelectedBusinessTypes,
  selectedFactories = {},
  setSelectedFactories,
}) {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({});

  // Load Users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await UserAPI.list();
        setUsers(data || []);
      } catch (err) {
        console.error("Error loading users:", err);
      }
    };
    loadUsers();
  }, []);

  // Load Companies + BusinessTypes + Factories
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await CompanyAPI.list();
        setCompanies(data || []);

        const details = {};
        for (const c of data || []) {
          const bts = await BusinessTypeAPI.list(c.id);
          const fts = await FactoryAPI.list(c.id);
          details[c.id] = { businessTypes: bts || [], factories: fts || [] };
        }
        setCompanyDetails(details);
      } catch (err) {
        console.error("Error loading companies:", err);
      }
    };
    loadCompanies();
  }, []);

  // User change (FIXED)
  const handleUserChange = (e) => {
    const userId = e.target.value;

    if (!userId) {
      setSelectedUser(null);
      return;
    }

    const userObj = users.find((u) => String(u.id) === String(userId));
    if (userObj) {
      setSelectedUser({ value: userObj.id, label: `${userObj.name} (${userObj.email})` });
    }

    // console.log(userObj)

    setSelectedCompanies([]);
    setSelectedBusinessTypes({});
    setSelectedFactories({});
  };

  // Company toggle
  const toggleCompany = (companyId) => {
    const updated = selectedCompanies.includes(companyId)
      ? selectedCompanies.filter((id) => id !== companyId)
      : [...selectedCompanies, companyId];

    setSelectedCompanies(updated);

    if (!updated.includes(companyId)) {
      const newBT = { ...selectedBusinessTypes };
      const newF = { ...selectedFactories };
      delete newBT[companyId];
      delete newF[companyId];
      setSelectedBusinessTypes(newBT);
      setSelectedFactories(newF);
    }
  };

  // BusinessType toggle
  const toggleBusinessType = (companyId, btId) => {
    const currentBTs = Array.isArray(selectedBusinessTypes[companyId])
      ? selectedBusinessTypes[companyId]
      : [];

    const updatedBTs = currentBTs.includes(btId)
      ? currentBTs.filter((id) => id !== btId)
      : [...currentBTs, btId];

    setSelectedBusinessTypes({ ...selectedBusinessTypes, [companyId]: updatedBTs });

    if (!updatedBTs.includes(btId)) {
      const newF = { ...selectedFactories };
      newF[companyId] = (newF[companyId] || []).filter((f) => f.btId !== btId);
      setSelectedFactories(newF);
    }
  };

  // Factory toggle
  const toggleFactory = (companyId, btId, fId) => {
    const currentF = Array.isArray(selectedFactories[companyId])
      ? selectedFactories[companyId]
      : [];
    const exists = currentF.find((f) => f.btId === btId && f.id === fId);
    const updatedF = exists
      ? currentF.filter((f) => !(f.btId === btId && f.id === fId))
      : [...currentF, { btId, id: fId }];

    setSelectedFactories({ ...selectedFactories, [companyId]: updatedF });
  };

  return (
    <div className="mb-4">
      {/* User */}
      <div className="mb-3" style={{ maxWidth: 300 }}>
        <label className="form-label fw-bold">Select User</label>
        <select
          className="form-select form-select-sm"
          value={selectedUser ? selectedUser.value : ""}
          onChange={handleUserChange}
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {/* Companies */}
      <div className="mb-3">
        <label className="form-label fw-bold">Companies</label>
        <div className="d-flex flex-column gap-2">
          {companies.map((c) => {
            const companyBTs = companyDetails[c.id]?.businessTypes || [];
            const companyFactories = companyDetails[c.id]?.factories || [];

            const selectedBTs = Array.isArray(selectedBusinessTypes[c.id])
              ? selectedBusinessTypes[c.id]
              : [];
            const selectedF = Array.isArray(selectedFactories[c.id])
              ? selectedFactories[c.id]
              : [];

            return (
              <div key={c.id} className="card p-3 shadow-sm rounded">
                {/* Company Checkbox */}
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedCompanies.includes(c.id)}
                    onChange={() => toggleCompany(c.id)}
                    id={`company-${c.id}`}
                  />
                  <label className="form-check-label fw-semibold" htmlFor={`company-${c.id}`}>
                    {c.name}
                  </label>
                </div>

                {/* Business Types */}
                {selectedCompanies.includes(c.id) && companyBTs.length > 0 && (
                  <div className="ms-4 mt-2">
                    {companyBTs.map((b) => {
                      const selectedFactoriesForBT = selectedF.filter((f) => f.btId === b.id);
                      return (
                        <div className="form-check" key={b.id}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedBTs.includes(b.id)}
                            onChange={() => toggleBusinessType(c.id, b.id)}
                            id={`bt-${c.id}-${b.id}`}
                          />
                          <label className="form-check-label">{b.name}</label>

                          {/* Factories */}
                          {selectedBTs.includes(b.id) && companyFactories.length > 0 && (
                            <div className="ms-4 mt-1">
                              {companyFactories.map((f) => (
                                <div className="form-check" key={f.id}>
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedFactoriesForBT.some((sf) => sf.id === f.id)}
                                    onChange={() => toggleFactory(c.id, b.id, f.id)}
                                    id={`ft-${c.id}-${b.id}-${f.id}`}
                                  />
                                  <label className="form-check-label">{f.name}</label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
