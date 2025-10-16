// src/labtests.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------- GET ----------------
export const getLabTests = async ({
  page = 1,
  page_size = 5,
  search = "",
  ordering,
  category,
}: {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  category?: string;
} = {}) => {
  const params: any = { page, page_size };
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  if (category) params.category = category;

  const res = await api.get(`/crm/lab-tests/`, { params });
  return res.data;
};

export const getLabPackages = async ({
  page = 1,
  page_size = 5,
  search = "",
  ordering,
  category,
}: any = {}) => {
  const params: any = { page, page_size };
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  if (category) params.category = category;

  const res = await api.get(`/crm/lab-packages/`, { params });
  return res.data;
};

export const getLabProfiles = async ({
  page = 1,
  page_size = 5,
  search = "",
  ordering,
  category,
}: any = {}) => {
  const params: any = { page, page_size };
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  if (category) params.category = category;

  const res = await api.get(`/crm/lab-profiles/`, { params });
  return res.data;
};

export const getLabCategory = async ({
  page = 1,
  page_size = 5,
  search = "",
  ordering,
  category,
}: any = {}) => {
  const params: any = { page, page_size };
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  if (category) params.category = category;

  const res = await api.get(`/crm/lab-category/`, { params });
  return res.data;
};

// ---------------- CREATE ----------------
export const createLabTest = (data: any) => api.post(`/crm/lab-tests/`, data);
export const createLabPackage = (data: any) => api.post(`/crm/lab-packages/`, data);
export const createLabProfile = (data: any) => api.post(`/crm/lab-profiles/`, data);

// ---------------- UPDATE ----------------
export const updateLabTest = (id: number, data: any) => api.put(`/crm/lab-tests/${id}/`, data);
export const updateLabPackage = (id: number, data: any) => api.put(`/crm/lab-packages/${id}/`, data);
export const updateLabProfile = (id: number, data: any) => api.put(`/crm/lab-profiles/${id}/`, data);

// ---------------- Dynamic Wrapper ----------------
export const LabApi = {
  get: {
    test: getLabTests,
    package: getLabPackages,
    profile: getLabProfiles,
    category: getLabCategory,
  },
  create: {
    test: createLabTest,
    package: createLabPackage,
    profile: createLabProfile,
    category:()=>{}
  },
  update: {
    test: updateLabTest,
    package: updateLabPackage,
    profile: updateLabProfile,
    category:()=>{}
  },
};
