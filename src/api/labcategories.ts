// src/api/labcategories.ts
import axios from "axios";

export const getLabCategories = async (entityType:string) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/crm/lab-category/?entity_type=${entityType}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  return res.data;
};
