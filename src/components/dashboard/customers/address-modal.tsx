"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Autocomplete,
} from "@mui/material";
import { createAddress, updateAddress, getCustomers, getLocation } from "@/api/customers";

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (data?: any) => void;
  address?: any;
  customer?: any; // ✅ new prop
}


export default function AddressModal({ open, onClose, onSaved, address,customer }: AddressModalProps) {
    const [formData, setFormData] = useState({
        line1: "",
        line2: "",
        is_default: false,
        location: null as any,
        user: null as any,
    });

    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    const [customerOptions, setCustomerOptions] = useState<any[]>([]);
    const [locationOptions, setLocationOptions] = useState<any[]>([]);

    // Reset form when modal opens
    useEffect(() => {
        if (!open) return;
        setFormData({
            line1: address?.line1 || "",
            line2: address?.line2 || "",
            is_default: address?.is_default || false,
            location: address?.location || null,
            user: address?.user || null,
        });
    }, [open, address]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async () => {
        formData.user=customer?customer:formData.user
        console.log(formData)
        if (!formData.line1 || !formData.location || !formData.user) {
            setSnackbar({
                open: true,
                message: "Line1, Location, and User are required.",
                severity: "error",
            });
            return;
        }

        setLoading(true);
        try {


            let savedData;
            if (address?.id) {
                const payload = {
                    ...formData,
                    location_id: formData.location.id,
                    user_id: formData.user.id,
                };
                savedData = await updateAddress(address.id, payload);
            } else {
                
                const payload = {
                    ...formData,
                    location_id: formData.location.id,
                    user_id: formData.user.id,
                };
                console.log(payload)
                savedData = await createAddress(payload);
            }

            setSnackbar({
                open: true,
                message: "Address saved successfully!",
                severity: "success",
            });
            onSaved?.(savedData);
            onClose();
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Failed to save address.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>{address?.id ? "Update Address" : "Create Address"}</DialogTitle>
                <DialogContent dividers>
                    {/* User Search */}
                     <Autocomplete
                            disabled={address?.id || customer}
                            value={customer?customer:formData.user}
                            onChange={(e, value) => setFormData((prev) => ({ ...prev, user: value }))}
                            filterOptions={(x) => x} // disable local filtering
                            onInputChange={async (e, value) => {
                                if (value.length < 2) return;
                                try {
                                    const res = await getCustomers({ search: value });
                                    setCustomerOptions(res.results || res.data || []);
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            options={customerOptions}
                            getOptionLabel={(option: any) =>
                                option ? `${option.first_name} ${option.last_name} (${option.email})` : ""
                            }
                            renderInput={(params) => <TextField {...params} label="User" margin="dense" />}
                        />
                    <TextField
                        margin="dense"
                        label="Line 1"
                        name="line1"
                        fullWidth
                        value={formData.line1}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Line 2"
                        name="line2"
                        fullWidth
                        value={formData.line2}
                        onChange={handleChange}
                    />



                    {/* Location Search */}
                    <Autocomplete
                        value={formData.location}
                        onChange={(e, value) => setFormData((prev) => ({ ...prev, location: value }))}
                        filterOptions={(x) => x}
                        onInputChange={async (e, value) => {
                            if (value.length < 2) return;
                            try {
                                const res = await getLocation({ search: value });
                                setLocationOptions(res.results || res.data || []);
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                        options={locationOptions}
                        getOptionLabel={(option: any) =>
                            option ? `${option.city}, ${option.state} - ${option.pincode}` : ""
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Location" margin="dense" required />
                        )}
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
                        {loading ? "Saving..." : address?.id ? "Update" : "Create"}
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
