// src/components/dashboard/lab-products/lab-product-columns.ts

export function getLabProductColumns(entityType: "test" | "package" | "profile" | "category") {
  switch (entityType) {
    case "test":
      return [
        { key: "name", label: "Test Name", sortable: true },
        { key: "test_code", label: "Test Code", sortable: true },
        { key: "category_name", label: "Category", sortable: true },
        { key: "special_instruction", label: "special_instruction", sortable: true },
        { key: "price", label: "Price", sortable: true },
        { key: "offer_price", label: "Offer Price", sortable: true },
        
      ];
    case "package":
      return [
        { key: "name", label: "Package Name", sortable: true },
        { key: "tests_count", label: "No. of Tests", sortable: true },
        { key: "price", label: "Price", sortable: true },
      ];
    case "profile":
      return [
        { key: "name", label: "Profile Name", sortable: true },
        { key: "description", label: "Description" },
        { key: "price", label: "Price", sortable: true },
      ];
    case "category":
      return [
        { key: "name", label: "Category Name", sortable: true },
        { key: "entity_type", label: "Entity Type" },
        { key: "description", label: "Description", sortable: true },
      ];
    default:
      return [];
  }
}
