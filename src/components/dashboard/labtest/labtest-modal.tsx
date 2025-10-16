"use client";

import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from "@mui/material";

interface LabTestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function LabTestModal({ open, onClose, onSubmit, initialData }: LabTestModalProps) {
  const [form, setForm] = React.useState<any>(initialData || { name: "", test_code: "", category_name: "", price: "" });

  React.useEffect(() => {
    setForm(initialData || { name: "", test_code: "", category_name: "", price: "" });
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => onSubmit(form);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Edit Lab Test" : "Add Lab Test"}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField label="Test Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} fullWidth />
          <TextField label="Test Code" value={form.test_code} onChange={(e) => handleChange("test_code", e.target.value)} fullWidth />
          <TextField label="Category" value={form.category_name} onChange={(e) => handleChange("category_name", e.target.value)} fullWidth />
          <TextField label="Price" value={form.price} onChange={(e) => handleChange("price", e.target.value)} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
