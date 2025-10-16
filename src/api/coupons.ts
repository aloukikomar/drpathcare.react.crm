// src/api/coupons.ts
import api from "./axios";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

export const getCoupons = async ({
  page = DEFAULT_PAGE,
  page_size = DEFAULT_PAGE_SIZE,
  search = "",
  ordering,
}: {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
} = {}) => {
  const params: any = { page, page_size };
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;

  const res = await api.get(`/coupons/`, { params }); // or /api/coupons/ if that’s your route
  return res.data;
};

export const validateCoupon = async (coupon_code: string, base_total: number) => {
  const res = await api.post(`/coupons/validate/`, {
    coupon_code,
    base_total,
  });
  return res.data;
};
