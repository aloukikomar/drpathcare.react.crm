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
    mode: "create" | "edit";

    // Create-mode only
    scheduledDate?: string;
    scheduledTime?: string;
    setScheduledDate?: (d: string) => void;
    setScheduledTime?: (t: string) => void;

    customer: any;
    items: ItemRow[];
    setItems: (i: ItemRow[]) => void;
    selectedCoupon: any;
    setSelectedCoupon: (c: any) => void;
    pricing: PricingState;
    setPricing: (p: PricingState) => void;

    buttonText: string;
    onSubmit: () => void;
    onBack?: () => void;
}

export default function BookingDetailsStep({
    mode,
    scheduledDate,
    scheduledTime,
    setScheduledDate,
    setScheduledTime,
    customer,
    items,
    setItems,
    selectedCoupon,
    setSelectedCoupon,
    pricing,
    setPricing,
    buttonText,
    onSubmit,
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
    const [adminInput, setAdminInput] = useState<number>(pricing.admin || 0);
    const [adminApplied, setAdminApplied] = useState<number>(pricing.admin || 0);
    const [couponApplied, setCouponApplied] = useState<number>(pricing.coupon || 0);

    // 🔹 Fetch patient list
    useEffect(() => {
        if (!customer?.id) return;
        (async () => {
            const res = await getPatient({ customer: customer.id, page_size: 1000 });
            const list = res.results || res.data || [];
            setPatientList(list);
            if (!selectedPatient && list.length > 0) setSelectedPatient(list[0]);
        })();
    }, [customer]);

    // 🔹 Fetch lab items
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

    // 🔹 Fetch coupons
    useEffect(() => {
        (async () => {
            const res = await getCoupons({ page_size: 100 });
            setCouponList(res.results || res.data || []);
        })();
    }, []);

    // 🔹 Derived pricing
    const baseSum = useMemo(() => items.reduce((s, r) => s + Number(r.price || 0), 0), [items]);
    const offerSum = useMemo(() => items.reduce((s, r) => s + Number(r.offer_price ?? r.price ?? 0), 0), [items]);
    const coreDiscount = baseSum - offerSum;
    const totalDiscount = coreDiscount + couponApplied + adminApplied;
    const final = Math.max(0, baseSum - totalDiscount);

    useEffect(() => {
        {console.log(pricing)}
        setPricing({
            base: baseSum,
            offer: offerSum,
            coupon: couponApplied,
            admin: adminApplied,
            totalDiscount,
            final,
        });
    }, [baseSum, offerSum, couponApplied, adminApplied]);

    // 🔹 Handlers
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
            const res = await validateCoupon(selectedCoupon.code, baseSum);
            if (res.valid) {
                const discount = Number(res.discount || selectedCoupon.discount_amount || 0);
                setCouponApplied(discount);
                setCouponMessage(res.message || "Coupon applied.");
            } else {
                setCouponMessage(res.message || "Invalid coupon.");
                setCouponApplied(0);
            }
        } catch {
            setCouponMessage("Coupon validation failed.");
            setCouponApplied(0);
        }
    };

    const handleApplyAdmin = () => {
        setAdminApplied(Number(adminInput || 0));
    };

    if (loading) {
        return (
            <Stack alignItems="center" py={4}>
                <CircularProgress />
            </Stack>
        );
    }

    // 🔹 UI
    return (
        <Box>
            <Typography variant="h6">
                {mode === "edit" ? "Booking Details" : "Booking Setup"}
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* ✅ Schedule - only in CREATE mode */}
            {mode === "create" && (
                <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Schedule Test
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            type="date"
                            label="Date"
                            InputLabelProps={{ shrink: true }}
                            value={scheduledDate || ""}
                            onChange={(e) => setScheduledDate?.(e.target.value)}
                            required
                        />
                        <TextField
                            type="time"
                            label="Time"
                            InputLabelProps={{ shrink: true }}
                            value={scheduledTime || ""}
                            onChange={(e) => setScheduledTime?.(e.target.value)}
                            required
                        />
                    </Stack>
                </Paper>
            )}

            {/* Item Selection */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", md: "center" }}
                >
                    {/* Patient */}
                    <Box sx={{ flex: { md: 3, xs: 1 } }}>
                        <Autocomplete
                            options={patientList}
                            getOptionLabel={(p: any) =>
                                `${p.first_name ?? ""} ${p.last_name ?? ""} (${p.gender ?? ""})`
                            }
                            value={selectedPatient}
                            onChange={(_, v) => setSelectedPatient(v)}
                            renderInput={(params) => <TextField {...params} label="Select Patient" />}
                            fullWidth
                        />
                    </Box>

                    {/* Add Patient Button */}
                    <Box sx={{ flex: { md: 1, xs: 1 } }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setOpenPatientModal(true)}
                            sx={{ height: "100%" }}
                        >
                            + Add
                        </Button>
                    </Box>

                    {/* Item Type */}
                    <Box sx={{ flex: { md: 2, xs: 1 } }}>
                        <TextField
                            select
                            fullWidth
                            label="Item Type"
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value as ItemType)}
                        >
                            <MenuItem value="lab_test">Lab Test</MenuItem>
                            <MenuItem value="lab_profile">Lab Profile</MenuItem>
                            <MenuItem value="lab_package">Lab Package</MenuItem>
                        </TextField>
                    </Box>

                    {/* Item */}
                    <Box sx={{ flex: { md: 3, xs: 1 } }}>
                        <Autocomplete
                            options={itemList}
                            getOptionLabel={(i: any) => i?.name ?? ""}
                            value={selectedItem}
                            onChange={(_, v) => setSelectedItem(v)}
                            renderInput={(params) => <TextField {...params} label="Select Item" />}
                            fullWidth
                        />
                    </Box>

                    {/* Add Button */}
                    <Box sx={{ flex: { md: 1, xs: 1 } }}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PlusCircleIcon />}
                            disabled={!selectedPatient || !selectedItem}
                            onClick={handleAddItem}
                            sx={{ height: "100%", py: 1.5 }}
                        >
                            Add
                        </Button>
                    </Box>
                </Stack>
            </Paper>


            {/* Items Table */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Selected Items
                </Typography>
                <Table size="small">
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
            </Paper>

            {/* Discounts & Pricing */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Typography variant="subtitle1">Coupons & Discounts</Typography>
                <Stack spacing={2} direction={{ xs: "column", md: "row" }} mt={2}>
                    {/* Coupon */}
                    <Stack spacing={1} flex={1}>
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

                    {/* Admin Discount */}
                    <Stack spacing={1} sx={{ width: { xs: "100%", md: 260 } }}>
                        <TextField
                            label="Admin Discount (₹)"
                            type="number"
                            value={adminInput}
                            onChange={(e) => setAdminInput(Number(e.target.value) || 0)}
                        />
                        <Button variant="outlined" onClick={handleApplyAdmin}>
                            Apply Admin Discount
                        </Button>
                    </Stack>
                </Stack>
                        
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={0.5}>
                    <Typography>Base Price: ₹{pricing.base.toFixed(2)}</Typography>
                    <Typography>Offer Price: ₹{pricing.offer.toFixed(2)}</Typography>
                    <Typography sx={{ color: "success.main" }}>
                        Core Discount: -₹{(pricing.base - pricing.offer).toFixed(2)}
                    </Typography>
                    {pricing.coupon > 0 && (
                        <Typography sx={{ color: "success.main" }}>
                            Coupon Discount: -₹{pricing.coupon.toFixed(2)}
                        </Typography>
                    )}
                    {pricing.admin > 0 && (
                        <Typography sx={{ color: "success.main" }}>
                            Admin Discount: -₹{pricing.admin.toFixed(2)}
                        </Typography>
                    )}
                    <Typography sx={{ color: "success.main" }}>
                        Total Discount: -₹{pricing.totalDiscount.toFixed(2)}
                    </Typography>
                    <Typography variant="h6">
                        Final Amount: ₹{pricing.final.toFixed(2)}
                    </Typography>
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
                    getPatient({ customer: customer.id, page_size: 1000 }).then((res) =>
                        setPatientList(res.results || res.data || [])
                    );
                }}
                customer={customer}
            />
        </Box>
    );
}
