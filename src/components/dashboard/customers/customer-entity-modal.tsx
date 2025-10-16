// src/components/dashboard/customers/customer-entity-modal.tsx

import CustomerModal from "./customers-modal";
import PatientModal from "./patient-modal";
import AddressModal from "./address-modal";

interface CustomerEntityModalProps {
  entityType: "customer" | "patient" | "address";
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialData?: any;
}

export function CustomerEntityModal({
  entityType,
  open,
  onClose,
  onSubmit,
  initialData,
}: CustomerEntityModalProps) {
  switch (entityType) {
    case "customer":
      return (
        <CustomerModal
          open={open}
          onClose={onClose}
          onSaved={() => onSubmit()}
          customer={initialData}
        />
      );
    case "patient":
      return (
        <PatientModal
          open={open}
          onClose={onClose}
          onSaved={() => onSubmit()}
          patient={initialData}
        />
      );
    case "address":
      return (
        <AddressModal
          open={open}
          onClose={onClose}
          onSaved={() => onSubmit()}
          address={initialData}
        />
      );
    default:
      return null;
  }
}
