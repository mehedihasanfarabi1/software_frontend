// src/api/permissions.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:8001/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 👉 প্রতিটা module এর জন্য আলাদা function
export const PermissionAPI = {
  async company() {
    return axios
      .get(`${API_BASE}/company/permissions/`, { headers: authHeaders() })
      .then((res) => res.data)
      .catch((err) => {
        console.error("Company permission load error:", err);
        return [];
      });
  },

  async products() {
    return axios
      .get(`${API_BASE}/products/permissions/`, { headers: authHeaders() })
      .then((res) => res.data)
      .catch((err) => {
        console.error("Products permission load error:", err);
        return [];
      });
  },

  // 👉 future modules (accounts, hr, inventory ইত্যাদি) এখানে add করবে
  async accounts() {
    return axios
      .get(`${API_BASE}/accounts/permissions/`, { headers: authHeaders() })
      .then((res) => res.data)
      .catch((err) => {
        console.error("Accounts permission load error:", err);
        return [];
      });
  },

  async hr() {
    return axios
      .get(`${API_BASE}/hr/permissions/`, { headers: authHeaders() })
      .then((res) => res.data)
      .catch((err) => {
        console.error("HR permission load error:", err);
        return [];
      });
  },

  // 👉 একসাথে সব load করার জন্য
  async list() {
    try {
      const [comp, prod /*, acc, hr */] = await Promise.all([
        this.company(),
        this.products(),
        // this.accounts(),
        // this.hr(),
      ]);

      return {
        company: comp,
        products: prod,
        // accounts: acc,
        // hr: hr,
      };
    } catch (err) {
      console.error("PermissionAPI.list error:", err);
      return {
        company: [],
        products: [],
        // accounts: [],
        // hr: [],
      };
    }
  },
};

// 🔑 user permission APIs
export const UserPermissionAPI = {
  async getByUser(userId) {
    const res = await axios.get(`${API_BASE}/permissions/user/${userId}/`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async updateOrCreate(userId, payload) {
    const res = await axios.post(
      `${API_BASE}/permissions/update-or-create/`,
      { user: userId, ...payload },
      { headers: authHeaders() }
    );
    return res.data;
  },
};

// ****************** //

// import axios from "axios";

// const API_BASE = "http://127.0.0.1:8001/api";

// function authHeaders() {
//   const token = localStorage.getItem("token");
//   // console.log("Token:", localStorage.getItem("token"));

//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// export const CompanyAPI = {
//   async details(companyId) {
//     if (!companyId) return { business_types: [], factories: [] };
//     console.log("Fetching company details for ID:", companyId);
//     const res = await axios.get(`${API_BASE}/company/details/${companyId}/`, {
//       headers: authHeaders(),
//     });
//     return res.data;
//   },

//   async list() {
//     // ✅ URL updated to match Django route
//     const res = await axios.get(`${API_BASE}/company/companies/`, {
//       headers: authHeaders(),
//     });
//     return res.data;
//   },
// };




// export const PermissionAPI = {
//   async list() {
//     try {
//       const [prod, comp, hr, accounts] = await Promise.all([
//         axios.get(`${API_BASE}/company/permissions/`, { headers: authHeaders() }),
//         axios.get(`${API_BASE}/products/permissions/`, { headers: authHeaders() }),

//         // 🔹 HR permissions (এখনো backend এ বানানো হয়নি, future use এর জন্য রাখা হলো)
//         // axios.get(`${API_BASE}/hr/permissions/`, { headers: authHeaders() }),

//         // 🔹 Accounts permissions (এখনো backend এ বানানো হয়নি, future use এর জন্য রাখা হলো)
//         // axios.get(`${API_BASE}/accounts/permissions/`, { headers: authHeaders() }),
//       ]);

//       // prod, comp কাজ করবে, hr/accounts future এ add করলে uncomment করতে হবে
//       return [
//         ...prod.data,
//         ...comp.data,
//         // ...(hr?.data || []),
//         // ...(accounts?.data || []),
//       ];
//     } catch (err) {
//       console.error("PermissionAPI.list error", err);
//       return [];
//     }
//   },
// };

// export const UserPermissionAPI = {
//   async getByUser(userId) {
//     const res = await axios.get(`${API_BASE}/permissions/user/${userId}/`, {
//       headers: authHeaders(),
//     });
//     return res.data;
//   },

//   async updateOrCreate(userId, payload) {
//     const res = await axios.post(
//       `${API_BASE}/permissions/update-or-create/`,
//       { user: userId, ...payload },
//       { headers: authHeaders() }
//     );
//     return res.data;
//   },
// };

// ****************** //




// import axios from "axios";

// const API_BASE = "http://127.0.0.1:8001/api";

// function authHeaders() {
//   const token = localStorage.getItem("token");
//   // console.log("Token:", localStorage.getItem("token"));

//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// export const PermissionAPI = {
//   async list() {
//     try {
//       const [prod, comp] = await Promise.all([
//         axios.get(`${API_BASE}/company/permissions/`, { headers: authHeaders() }),
//         axios.get(`${API_BASE}/products/permissions/`, { headers: authHeaders() }),

//       ]);
//       return [...prod.data, ...comp.data];
//     } catch (err) {
//       console.error("PermissionAPI.list error", err);
//       return [];
//     }
//   },
// };

// export const UserPermissionAPI = {
//   async getByUser(userId) {
//     const res = await axios.get(`${API_BASE}/permissions/user/${userId}/`, {
//       headers: authHeaders(),
//     });
//     return res.data;
//   },

//   async updateOrCreate(userId, payload) {
//     const res = await axios.post(
//       `${API_BASE}/permissions/update-or-create/`,
//       { user: userId, ...payload },
//       { headers: authHeaders() }
//     );
//     return res.data;
//   },
// };


// 17-09

// import api from "./axios";

// export const PermissionAPI = {
//   list: async () => {
//     try {
//       const [prod, comp] = await Promise.all([
//         api.get("/products/permissions/"),
//         api.get("/company/permissions/"),
//       ]);
//       return [...prod.data, ...comp.data];
//     } catch (err) {
//       console.error("PermissionAPI.list error", err);
//       return [];
//     }
//   }
// };




// export const UserAPI = {
//   list: async () => {
//     const res = await axios.get(`${API_BASE}/users/`, { headers: authHeaders() });
//     return res.data;
//   },
//   me: async () => {
//     const res = await axios.get(`${API_BASE}/me/`, { headers: authHeaders() });
//     return res.data;
//   }
// };

// export const UserPermissionAPI = {
//   getByUser: (userId) => api.get(`/permissions/user/${userId}/`).then(res => res.data),
//   getByUserCompany: (params) => {
//     const query = new URLSearchParams(params).toString();
//     return api.get(`/permissions/by-user-company/?${query}`).then(res => res.data);
//   },
//   updateOrCreate: (userId, payload) => 
//     api.post("/permissions/update-or-create/", { user: userId, ...payload }).then(res => res.data)
// };

