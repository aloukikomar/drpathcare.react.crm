"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { updateCustomer, createCustomer } from "@/api/customers";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (data?: any) => void; // callback after success
  customer?: any; // existing customer for edit
}

const genders = ["Male", "Female", "Other"];

export default function CustomerModal({
  open,
  onClose,
  onSaved,
  customer,
}: CustomerModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    first_name: "",
    last_name: "",
    gender: "Male",
    date_of_birth: "",
    role: "",
    age:"",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Reset form only when modal opens or customer changes
  useEffect(() => {
    if (!open) return;
    setFormData({
      email: customer?.email || "",
      mobile: customer?.mobile || "",
      first_name: customer?.first_name || "",
      last_name: customer?.last_name || "",
      gender: customer?.gender || "Male",
      date_of_birth: customer?.date_of_birth || "",
      role: customer?.role || "",
      age: customer?.age || ""
    });
  }, [open, customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- Validation ----------------
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    const nameRegex = /^[a-zA-Z ]*$/;

    // if (!formData.email.trim()) {
    //   setSnackbar({ open: true, message: "Email is required", severity: "error" });
    //   return false;
    // }
    if (formData.email && !emailRegex.test(formData.email)) {
      setSnackbar({ open: true, message: "Invalid email format", severity: "error" });
      return false;
    }
    if (!formData.mobile.trim()) {
      setSnackbar({ open: true, message: "Mobile is required", severity: "error" });
      return false;
    }
    if (!mobileRegex.test(formData.mobile)) {
      setSnackbar({ open: true, message: "Mobile must be 10 digits", severity: "error" });
      return false;
    }
    if (!formData.first_name.trim()) {
      setSnackbar({ open: true, message: "First name is required", severity: "error" });
      return false;
    }
    if (!nameRegex.test(formData.first_name)) {
      setSnackbar({ open: true, message: "First name must not contain special characters", severity: "error" });
      return false;
    }
    if (formData.last_name && !nameRegex.test(formData.last_name)) {
      setSnackbar({ open: true, message: "Last name must not contain special characters", severity: "error" });
      return false;
    }
    if (!formData.date_of_birth && !formData.age) {
      setSnackbar({ open: true, message: "Date of birth or Age is required", severity: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let savedData;
      if (!formData.date_of_birth){
        delete (formData as any).date_of_birth;
      }
      if (customer?.id) {
        savedData = await updateCustomer(customer.id, formData);
      } else {
        savedData = await createCustomer(formData);
      }

      setSnackbar({
        open: true,
        message: customer?.id ? "Customer updated successfully!" : "Customer created successfully!",
        severity: "success",
      });

      onClose();
      setTimeout(() => onSaved?.(savedData), 300);
    } catch (err) {
      console.error("Failed to save customer:", err);
      setSnackbar({
        open: true,
        message: "Failed to save customer. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {customer?.id ? "Update Customer" : "Create Customer"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            disabled={customer?.id}
            margin="dense"
            label="Mobile"
            name="mobile"
            fullWidth
            value={formData.mobile}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="First Name"
            name="first_name"
            fullWidth
            value={formData.first_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Last Name"
            name="last_name"
            fullWidth
            value={formData.last_name}
            onChange={handleChange}
          />
          <TextField
            select
            margin="dense"
            label="Gender"
            name="gender"
            fullWidth
            value={formData.gender}
            onChange={handleChange}
          >
            {genders.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={formData.date_of_birth}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Age"
            name="age"
            type="number"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={formData.age}
            onChange={handleChange}
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? "Saving..." : customer?.id ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
