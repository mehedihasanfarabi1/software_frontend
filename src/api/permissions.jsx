import api from "./axios";

// ====================
// Master Permissions (product, company, etc.)
// ====================
export const PermissionAPI = {
  list: async () => {
    try {
      const [prod, comp] = await Promise.all([
        api.get("/products/permissions/"),
        api.get("/company/permissions/"),
      ]);
      return [...prod.data, ...comp.data];
    } catch (err) {
      console.error("PermissionAPI.list error", err);
      return [];
    }
  }
};

// ====================
// User APIs
// ====================
export const UserAPI = {
  list: async () => {
    const res = await api.get("/users/");
    return res.data;
  },
  me: async () => {
    const res = await api.get("/me/");
    return res.data;
  }
};

// ====================
// User Permission APIs (Hybrid Model)
// ====================
export const UserPermissionAPI = {
  // ১টা user এর সব PermissionSets / ModulePermissions নিয়ে আসে
  getByUser: async (userId) => {
    const setsRes = await api.get(`/permission-sets/user/${userId}/`);
    const sets = setsRes.data;

    // প্রতিটি PermissionSet এর module permissions
    for (let s of sets) {
      const modulesRes = await api.get(`/module-permissions/set/${s.id}/`);
      s.modules = modulesRes.data; // modules attach
    }
    return sets;
  },

  // Update / Create permission set + module permissions একসাথে
  updateOrCreate: async (userId, payload) => {
  // PermissionSet create/update
  const setRes = await api.post("/permission-sets/update-or-create/", {
    user: userId,
    role: payload.role,
    companies: payload.companies,
    business_types: payload.business_types,
    factories: payload.factories,
  });

  const setId = setRes.data.id;

  // ✅ প্রতিটি module আলাদা করে save করা
  for (let moduleName of Object.keys(payload.modules)) {
    await api.post("/module-permissions/update-or-create/", {
      permission_set: setId,
      module_name: moduleName,              // আর numeric key যাবে না
      permissions: payload.modules[moduleName], // শুধু {create, edit, delete, view}
    });
  }

    return await UserPermissionAPI.getByUser(userId);
  }
};
