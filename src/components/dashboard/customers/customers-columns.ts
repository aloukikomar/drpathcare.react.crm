// src/components/dashboard/lab-products/lab-product-columns.ts

export function getCustomersColumns(entityType: "customer" | "patient" | "address") {
  switch (entityType) {
    case "customer":
      return [
        { key: "first_name", label: "First Name", sortable: true },
        { key: "last_name", label: "Last Name", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "mobile", label: "Mobile", sortable: true },
        { key: "role_name", label: "Role", sortable: true },
        { key: "date_of_birth", label: "DOB", sortable: true },
        { key: "gender", label: "Gender", sortable: true },
        
      ];
    case "patient":
      return [
        { key: "first_name", label: "First Name", sortable: true },
        { key: "last_name", label: "Last Name", sortable: true },
        { key: "user_name", label: "User Name", sortable: true },
        { key: "user_email", label: "User Email", sortable: true },
        { key: "user_mobile", label: "User Mobile", sortable: true },
        { key: "date_of_birth", label: "DOB", sortable: true },
        { key: "gender", label: "Gender", sortable: true },
      ];
    case "address":
      return [
        { key: "line1", label: "Line1", sortable: true },
        { key: "line2", label: "Line2" },
        { key: "city", label: "City", sortable: true },
        { key: "state", label: "State", sortable: true },
        { key: "pincode", label: "Pincode" },
        { key: "user_name", label: "User Name", sortable: true },
        { key: "user_mobile", label: "user_mobile", sortable: true },
        
      ];
    default:
      return [];
  }
}
