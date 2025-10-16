// src/components/dashboard/lab-products/lab-product-filters.tsx

import { LabTestFilters } from "../labtest/labtest-filter";
// import { LabProfileFilters } from "./labprofile-filters";
// import { LabPackagesFilters } from "./labpackages-filters";

interface LabProductFiltersProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  entityType: "test" | "profile" | "package" | "category";
}

export function LabProductFilters({
  open,
  onClose,
  onApply,
  initialValues,
  entityType,
}: LabProductFiltersProps) {
  switch (entityType) {
    case "test":
      return (
        <LabTestFilters
          open={open}
          onClose={onClose}
          onApply={onApply}
          initialValues={initialValues}
          entityType={entityType}
        />
      );

    // case "profile":
    //   return (
    //     <LabProfileFilters
    //       open={open}
    //       onClose={onClose}
    //       onApply={onApply}
    //       initialValues={initialValues}
    //       entityType={entityType}
    //     />
    //   );

    // case "package":
    //   return (
    //     <LabPackagesFilters
    //       open={open}
    //       onClose={onClose}
    //       onApply={onApply}
    //       initialValues={initialValues}
    //       entityType={entityType}
    //     />
    //   );

    default:
      return null;
  }
}
