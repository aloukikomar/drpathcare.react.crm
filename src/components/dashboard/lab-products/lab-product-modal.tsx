// src/components/dashboard/lab-products/lab-product-modal.tsx
import { LabTestModal } from "../labtest/labtest-modal";
// import { LabPackageModal } from "./labpackage-modal";
// import { LabProfileModal } from "./labprofile-modal";

interface LabProductModalProps {
  entityType: "test" | "package" | "profile" | "category";
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function LabProductModal({
  entityType,
  open,
  onClose,
  onSubmit,
  initialData,
}: LabProductModalProps) {
  switch (entityType) {
    case "test":
      return (
        <LabTestModal
          open={open}
          onClose={onClose}
          onSubmit={onSubmit}
          initialData={initialData}
        />
      );
    // case "package":
    //   return (
    //     <LabPackageModal
    //       open={open}
    //       onClose={onClose}
    //       onSubmit={onSubmit}
    //       initialData={initialData}
    //     />
    //   );
    // case "profile":
    //   return (
    //     <LabProfileModal
    //       open={open}
    //       onClose={onClose}
    //       onSubmit={onSubmit}
    //       initialData={initialData}
    //     />
    //   );
    default:
      return null;
  }
}
