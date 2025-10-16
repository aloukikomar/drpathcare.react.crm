"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    Divider,
    Autocomplete,
    TextField,
    MenuItem,
    Button,
    IconButton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
} from "@mui/material";
import { PlusCircleIcon, TrashIcon } from "@phosphor-icons/react";
import { getPatient } from "@/api/customers";
import { getLabTests, getLabProfiles, getLabPackages } from "@/api/labproducts";
import { getCoupons, validateCoupon } from "@/api/coupons";
import PatientModal from "@/components/dashboard/customers/patient-modal";

export type ItemType = "lab_test" | "lab_profile" | "lab_package";

export interface ItemRow {
    id: number;
    patient: any;
    itemType: ItemType;
    item: any;
    price: number;
    offer_price: number;
}

export interface ScheduleState {
    date: string;
    time: string;
}

export interface PricingState {
    base: number;
    offer: number;
    coupon: number;
    admin: number;
    totalDiscount: number;
    final: number;
}

interface BookingDetailsStepProps {
    // Data controlled by parent
    customer: any;
    schedule: ScheduleState;
    setSchedule: (s: ScheduleState) => void;
    items: ItemRow[];
    setItems: (items: ItemRow[]) => void;
    selectedCoupon: any;
    setSelectedCoupon: (coupon: any) => void;
    adminDiscount: number;
    setAdminDiscount: (val: number) => void;
    pricing: PricingState;

    // Action from parent
    onSubmit: () => void;
    buttonText: string;
    onBack?: () => void;
}

export default function BookingDetailsStep({
    customer,
    schedule,
    setSchedule,
    items,
    setItems,
    selectedCoupon,
    setSelectedCoupon,
    adminDiscount,
    setAdminDiscount,
    pricing,
    onSubmit,
    buttonText,
    onBack,
}: BookingDetailsStepProps) {
    const [loading, setLoading] = useState(false);
    const [patientList, setPatientList] = useState<any[]>([]);
    const [itemType, setItemType] = useState<ItemType>("lab_test");
    const [itemList, setItemList] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [couponList, setCouponList] = useState<any[]>([]);
    const [couponMessage, setCouponMessage] = useState("");
    const [openPatientModal, setOpenPatientModal] = useState(false);

    // ✅ Fetch dropdown data
    useEffect(() => {
        if (!customer?.id) return;
        (async () => {
            try {
                const res = await getPatient({ customer: customer.id, page_size: 1000 });
                const list = res.results || res.data || [];
                setPatientList(list);
                if (!selectedPatient && list.length > 0) setSelectedPatient(list[0]);
            } catch {
                // ignore
            }
        })();
    }, [customer]);

    useEffect(() => {
        (async () => {
            let res: any;
            if (itemType === "lab_test") res = await getLabTests({ page_size: 1000 });
            if (itemType === "lab_profile") res = await getLabProfiles({ page_size: 1000 });
            if (itemType === "lab_package") res = await getLabPackages({ page_size: 1000 });
            const list = res?.results || res?.data || [];
            setItemList(list);
            if (list.length > 0) setSelectedItem(list[0]);
        })();
    }, [itemType]);

    useEffect(() => {
        (async () => {
            try {
                const res = await getCoupons({ page_size: 100 });
                setCouponList(res.results || res.data || []);
            } catch {
                // ignore
            }
        })();
    }, []);

    // ✅ Actions
    const handleAddItem = () => {
        if (!selectedPatient || !selectedItem) return;
        const newItem: ItemRow = {
            id: Date.now(),
            patient: selectedPatient,
            itemType,
            item: selectedItem,
            price: Number(selectedItem?.price || 0),
            offer_price: Number(selectedItem?.offer_price ?? selectedItem?.price ?? 0),
        };
        setItems([...items, newItem]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter((i) => i.id !== id));
    };

    const handleApplyCoupon = async () => {
        setCouponMessage("");
        if (!selectedCoupon?.code) {
            setCouponMessage("Please select a coupon.");
            return;
        }
        try {
            const res = await validateCoupon(selectedCoupon.code, pricing.base);
            if (res.valid) {
                setCouponMessage(res.message || "Coupon applied.");
            } else {
                setCouponMessage(res.message || "Coupon not valid.");
            }
        } catch {
            setCouponMessage("Coupon validation failed.");
        }
    };

    if (loading) {
        return (
            <Stack alignItems="center" py={4}>
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Box>
            <Typography variant="h6">Booking Details</Typography>
            <Divider sx={{ my: 2 }} />

            {/* Schedule */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        type="date"
                        label="Date"
                        InputLabelProps={{ shrink: true }}
                        value={schedule.date}
                        onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
                        required
                    />
                    <TextField
                        type="time"
                        label="Time"
                        InputLabelProps={{ shrink: true }}
                        value={schedule.time}
                        onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                        required
                    />
                </Stack>
            </Paper>

            {/* Add Item */}
            {/* Add Item Row */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", md: "center" }}
                >
                    {/* Patient */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
                        <Autocomplete
                            fullWidth
                            options={patientList}
                            getOptionLabel={(p: any) =>
                                `${p.first_name ?? ""} ${p.last_name ?? ""} (${p.gender ?? ""})`
                            }
                            value={selectedPatient}
                            onChange={(_, v) => setSelectedPatient(v)}
                            renderInput={(params) => (
                                <TextField {...params} fullWidth label="Select Patient" />
                            )}
                        />
                        <Button
                            variant="outlined"
                            onClick={() => setOpenPatientModal(true)}
                            sx={{ minWidth: { xs: "100%", sm: "auto" } }}
                        >
                            + Add Patient
                        </Button>
                    </Stack>

                    {/* Item Type */}
                    <TextField
                        select
                        fullWidth
                        label="Item Type"
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value as ItemType)}
                        sx={{ width: { xs: "100%", md: 200 } }}
                    >
                        <MenuItem value="lab_test">Lab Test</MenuItem>
                        <MenuItem value="lab_profile">Lab Profile</MenuItem>
                        <MenuItem value="lab_package">Lab Package</MenuItem>
                    </TextField>

                    {/* Item */}
                    <Autocomplete
                        fullWidth
                        options={itemList}
                        getOptionLabel={(i: any) => i?.name ?? ""}
                        value={selectedItem}
                        onChange={(_, v) => setSelectedItem(v)}
                        renderInput={(params) => (
                            <TextField {...params} fullWidth label="Select Item" />
                        )}
                        sx={{ flex: 1 }}
                    />

                    {/* Add Button */}
                    <Button
                        variant="contained"
                        startIcon={<PlusCircleIcon />}
                        disabled={!selectedPatient || !selectedItem}
                        onClick={handleAddItem}
                        sx={{
                            width: { xs: "100%", md: "auto" },
                            mt: { xs: 1, md: 0 },
                        }}
                    >
                        Add
                    </Button>
                </Stack>
            </Paper>

            {/* Items Table */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Selected Items
                </Typography>
                <Box sx={{ maxHeight: 250, overflow: "auto" }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Offer Price</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length ? (
                                items.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.patient?.first_name}</TableCell>
                                        <TableCell>{r.itemType}</TableCell>
                                        <TableCell>{r.item?.name}</TableCell>
                                        <TableCell>₹{r.price}</TableCell>
                                        <TableCell>₹{r.offer_price}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleRemoveItem(r.id)}>
                                                <TrashIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No items added
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>

            {/* Coupons & Discounts */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Coupons & Discounts
                </Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                        <Autocomplete
                            options={couponList}
                            getOptionLabel={(o) => o?.code ?? ""}
                            value={selectedCoupon}
                            onChange={(_, v) => setSelectedCoupon(v)}
                            renderInput={(params) => <TextField {...params} label="Select Coupon" />}
                        />
                        <Button variant="outlined" onClick={handleApplyCoupon}>
                            Apply Coupon
                        </Button>
                        {!!couponMessage && (
                            <Typography variant="body2" color="success.main">
                                {couponMessage}
                            </Typography>
                        )}
                    </Stack>

                    <Stack spacing={1} sx={{ width: { xs: "100%", md: 240 } }}>
                        <TextField
                            label="Admin Discount (₹)"
                            value={adminDiscount}
                            onChange={(e) => setAdminDiscount(Number(e.target.value) || 0)}
                        />
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Stack spacing={0.5}>
                    <Typography>Base Price: ₹{pricing.base.toFixed(2)}</Typography>
                    <Typography>Offer Price: ₹{pricing.offer.toFixed(2)}</Typography>
                    <Typography color="success.main">
                        Core Discount: -₹{(pricing.base - pricing.offer).toFixed(2)}
                    </Typography>
                    {pricing.coupon > 0 && (
                        <Typography color="success.main">Coupon Discount: -₹{pricing.coupon.toFixed(2)}</Typography>
                    )}
                    {pricing.admin > 0 && (
                        <Typography color="success.main">Admin Discount: -₹{pricing.admin.toFixed(2)}</Typography>
                    )}
                    <Typography color="success.main">
                        Total Discount: -₹{pricing.totalDiscount.toFixed(2)}
                    </Typography>
                    <Typography variant="h6">Final Amount: ₹{pricing.final.toFixed(2)}</Typography>
                </Stack>
            </Paper>

            <Box display="flex" justifyContent="space-between">
                {onBack && <Button onClick={onBack}>Back</Button>}
                <Button variant="contained" onClick={onSubmit}>
                    {buttonText}
                </Button>
            </Box>

            {/* Patient Modal */}
            <PatientModal
                open={openPatientModal}
                onClose={() => setOpenPatientModal(false)}
                onSaved={() => {
                    setOpenPatientModal(false);
                    getPatient({ customer: customer.id, page_size: 1000 }).then((res) =>
                        setPatientList(res.results || res.data || [])
                    );
                }}
                customer={customer}
            />
        </Box>
    );
}
