// src/api/labtests.ts
import axios from "axios";

export const getLabTests = ({
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

  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/crm/lab-tests/`, {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
};
