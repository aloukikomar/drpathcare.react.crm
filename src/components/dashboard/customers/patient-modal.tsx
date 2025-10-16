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
  Autocomplete,
} from "@mui/material";
import { updatePatient, createPatient } from "@/api/customers";
import { getCustomers } from "@/api/customers"; // fetch users for dropdown

interface PatientModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (data?: any) => void;
  patient?: any; // existing patient for edit
  customer?: any; // ✅ new prop
}

const genders = ["Male", "Female", "Other"];

export default function PatientModal({
  open,
  onClose,
  onSaved,
  patient,
  customer
}: PatientModalProps) {
  const [formData, setFormData] = useState({
    user: null as any,
    first_name: "",
    last_name: "",
    gender: "Male",
    date_of_birth: "",
  });

  const [loading, setLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Reset form when modal opens or patient changes
  useEffect(() => {
    if (!open) return;
    setFormData({
      user: patient?.user || null,
      first_name: patient?.first_name || "",
      last_name: patient?.last_name || "",
      gender: patient?.gender || "Male",
      date_of_birth: patient?.date_of_birth || "",
    });
  }, [open, patient]);

  // Fetch users for autocomplete
  const fetchUsers = async (search: string) => {
    setUserLoading(true);
    try {
      const res = await getCustomers({ search, page_size: 20 });
      setUserOptions(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUserLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (value: any) => {
    setFormData((prev) => ({ ...prev, user: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let savedData;

      if (patient?.id) {
        const payload = {
          ...formData,
          user_id: formData.user?.id, // send only user id
        };
        savedData = await updatePatient(patient.id, payload);
      } else {
        const payload = {
          ...formData,
          user: customer?.id||formData.user?.id, // send only user id
        };
        savedData = await createPatient(payload);
      }

      setSnackbar({
        open: true,
        message: patient?.id
          ? "Patient updated successfully!"
          : "Patient created successfully!",
        severity: "success",
      });

      onClose();
      setTimeout(() => onSaved?.(savedData), 300);
    } catch (err) {
      console.error("Failed to save patient:", err);
      setSnackbar({
        open: true,
        message: "Failed to save patient. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{patient?.id ? "Update Patient" : "Create Patient"}</DialogTitle>
        <DialogContent dividers>
          {/* User selector for create */}
          {!patient?.id && (
            <Autocomplete
              options={userOptions}
              getOptionLabel={(option) =>
                `${option.first_name} ${option.last_name} - ${option.mobile}`
              }
              disabled={customer}
              value={customer?customer:formData.user}
              onChange={(_, newValue) => handleUserChange(newValue)}
              onInputChange={(_, value) => fetchUsers(value)}
              loading={userLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  margin="dense"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {userLoading ? <CircularProgress size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}

          {/* Patient fields */}
          {console.log(formData)}
          {patient?.id && (<TextField
            margin="dense"
            fullWidth
            name="user"
            value={patient?.user_str}
            disabled
          />)}
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
            {loading ? "Saving..." : patient?.id ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

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
