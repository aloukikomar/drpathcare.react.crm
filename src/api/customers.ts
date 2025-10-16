// src/api/customers.ts
import api from "./axios"; // reuse shared axios instance

// ---------------- Default Pagination ----------------
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

// ---------------- GET ----------------
export const getCustomers = async ({
  page = DEFAULT_PAGE,
  page_size = DEFAULT_PAGE_SIZE,
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

  const res = await api.get(`/crm/users/`, { params });
  return res.data; // expects { results: [], count: number }
};

export const getPatient = async ({
  page = DEFAULT_PAGE,
  page_size = DEFAULT_PAGE_SIZE,
  search = "",
  ordering,
  category,
  customer, // 👈 add customer filter
}: any = {}) => {
  const params: any = { page, page_size };
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  if (category) params.category = category;
  if (customer) params.customer = customer; // 👈 attach customer id
  
  const res = await api.get(`/crm/patients/`, { params });
  return res.data;
};

export const getAddress = async ({
  page = DEFAULT_PAGE,
  page_size = DEFAULT_PAGE_SIZE,
  search = "",
  ordering,
  category,
  customer, // 👈 add customer filter
}: any = {}) => {
  const params: any = { page, page_size };

  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  if (category) params.category = category;
  if (customer) params.customer = customer; // 👈 attach customer id

  const res = await api.get(`/crm/addresses/`, { params });
  return res.data;
};

export const getLocation = async ({
  page = DEFAULT_PAGE,
  page_size = DEFAULT_PAGE_SIZE,
  search = "",
  ordering,
  category,
}: any = {}) => {
  const params: any = { page, page_size };
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  if (category) params.category = category;

  const res = await api.get(`/client/location/`, { params });
  return res.data;
};

// ---------------- CREATE ----------------
export const createCustomer = async (data: any) => {
  const res = await api.post(`/crm/users/`, data);
  if (res.status !== 201 && res.status !== 200) throw new Error("Failed to create customer");
  return res.data;
};
export const createPatient = async (data: any) => {
  const res = await api.post(`/crm/patients/`, data);
  if (res.status !== 201 && res.status !== 200) throw new Error("Failed to create patient");
  return res.data;
};
export const createAddress = async (data: any) => {
  const res = await api.post(`/crm/addresses/`, data);
  if (res.status !== 201 && res.status !== 200) throw new Error("Failed to create address");
  return res.data;
};

// ---------------- UPDATE ----------------
export const updateCustomer = async (id: number, data: any) => {
  const res = await api.put(`/crm/users/${id}/`, data);
  if (res.status !== 200) throw new Error("Failed to update customer");
  return res.data;
};

export const updatePatient = async (id: number, data: any) => {
  const res = await api.put(`/crm/patients/${id}/`, data);
  if (res.status !== 200) throw new Error("Failed to update patient");
  return res.data;
};

export const updateAddress = async (id: number, data: any) => {
  const res = await api.put(`/crm/addresses/${id}/`, data);
  if (res.status !== 200) throw new Error("Failed to update address");
  return res.data;
};

// ---------------- Dynamic Wrapper ----------------
export const CustomerApi = {
  get: {
    customer: getCustomers,
    patient: getPatient,
    address: getAddress,
    location: getLocation,
  },
  create: {
    customer: createCustomer,
    patient: createPatient,
    address: createAddress,
  },
  update: {
    customer: updateCustomer,
    patient: updatePatient,
    address: updateAddress,
  },
};
