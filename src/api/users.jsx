import api from "./axios";

export const UserAPI = {
  list: async () => {
    const res = await api.get("users/");
    return res.data;
  },
};

export const UserPermissionAPI = {
  getByUser: async (userId) => {
<<<<<<< HEAD
    const res = await api.get(`permissions/?user=${userId}`);
    return res.data[0]; // কারণ ১টা user এর ১টা permission object থাকে
  },
  update: async (id, payload) => {
    const res = await api.put(`permissions/${id}/`, payload);
=======
    const res = await api.get(`/permission-sets/user/${userId}/`);
    return res.data[0]; // কারণ ১টা user এর ১টা permission object থাকে
  },
  update: async (id, payload) => {
    const res = await api.put(`/permission-sets/user/${id}/`, payload);
>>>>>>> 6ff68ef (Permission Is Okay Designed Not)
    return res.data;
  },
};


// import api from "./axios";

// export const UserAPI = {
//   list: async () => {
//     const res = await api.get("users/");
//     return res.data;
//   },
// };

// export const UserPermissionAPI = {
//   getByUser: async (userId) => {
//     const res = await api.get(`permissions/?user=${userId}`);
//     return res.data[0]; // কারণ ১টা user এর ১টা permission object থাকে
//   },
//   update: async (id, payload) => {
//     const res = await api.put(`permissions/${id}/`, payload);
//     return res.data;
//   },
// };
