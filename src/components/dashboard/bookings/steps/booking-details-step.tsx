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
    Alert,
} from "@mui/material";
import { PlusCircleIcon, TrashIcon, PencilSimple } from "@phosphor-icons/react";

import { getPatient } from "@/api/customers";
import { getLabTests, getLabProfiles, getLabPackages } from "@/api/labproducts";
import { getCoupons, validateCoupon } from "@/api/coupons";
import { getBooking } from "@/api/bookings";
import PatientModal from "@/components/dashboard/customers/patient-modal";

type ItemType = "lab_test" | "lab_profile" | "lab_package";

export interface ItemRow {
    id: number;
    patient: any;            // { id, first_name, last_name, ... }
    itemType: ItemType;      // "lab_test" | "lab_profile" | "lab_package"
    item: any;               // { id, name, price, offer_price, ... }
    price: number;
    offer_price: number;
}

interface ScheduleState {
    date: string;
    time: string;
}

interface PricingState {
    base: number;
    offer: number;          // sum of offer_price per item (pre-coupon/admin)
    coupon: number;         // applied coupon discount
    admin: number;          // applied admin discount
    totalDiscount: number;  // coupon + admin + (base-offer)
    final: number;          // base - totalDiscount
}

interface BookingDetailsStepProps {
    mode: "create" | "edit";
    bookingId?: string; // required for edit auto-load (optional if parent passes initial props)

    // For both modes – if provided, they prefill; if not, we compute/fetch
    customer: any; // used to fetch patients (customer's patients)
    initialSchedule?: Partial<ScheduleState>;
    initialItems?: ItemRow[];
    initialCoupon?: any;         // { id, code, ... }
    initialAdminDiscount?: number;
    initialPricing?: Partial<PricingState>;
    selectedCoupon:any;
    setSelectedCoupon:any;

    // Create mode action
    onContinue?: (data: {
        schedule: ScheduleState;
        items: ItemRow[];
        pricing: PricingState;
        coupon: any | null;
    }) => void;

    // Edit mode action
    onSave?: (data: {
        schedule: ScheduleState;
        items: ItemRow[];
        pricing: PricingState;
        coupon: any | null;
    }) => Promise<void> | void;

    onBack?: () => void;
}

export default function BookingDetailsStep({
    mode,
    bookingId,
    customer,
    selectedCoupon,
    setSelectedCoupon,
    initialSchedule,
    initialItems,
    initialCoupon,
    initialAdminDiscount,
    initialPricing,

    onContinue,
    onSave,
    onBack,
}: BookingDetailsStepProps) {
    // ---------------- State ----------------
    const [loading, setLoading] = useState<boolean>(mode === "edit" && !!bookingId);
    const [error, setError] = useState<string>("");

    // Patients for this customer
    const [patientList, setPatientList] = useState<any[]>([]);
    const [openPatientModal, setOpenPatientModal] = useState(false);

    // Item picking row
    const [itemType, setItemType] = useState<ItemType>("lab_test");
    const [itemList, setItemList] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Items table (shared)
    const [items, setItems] = useState<ItemRow[]>(initialItems || []);

    // Schedule
    const [schedule, setSchedule] = useState<ScheduleState>({
        date: initialSchedule?.date || "",
        time: initialSchedule?.time || "",
    });

    // Coupons
    const [couponList, setCouponList] = useState<any[]>([]);
    const [couponApplied, setCouponApplied] = useState<number>(Number(initialPricing?.coupon || 0));
    const [couponMessage, setCouponMessage] = useState<string>("");

    // Admin Discount (applied only on button)
    const [adminInput, setAdminInput] = useState<number>(Number(initialAdminDiscount || 0));
    const [adminApplied, setAdminApplied] = useState<number>(Number(initialPricing?.admin || 0));

    // Sorting state
    const [sortKey, setSortKey] = useState<keyof ItemRow | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    // Pricing (computed)
    const baseSum = useMemo(
        () => items.reduce((s, r) => s + Number(r.price || 0), 0),
        [items]
    );
    const offerSum = useMemo(
        () => items.reduce((s, r) => s + Number(r.offer_price ?? r.price ?? 0), 0),
        [items]
    );
    const coreDiscount = useMemo(() => baseSum - offerSum, [baseSum, offerSum]);
    const totalDiscount = useMemo(
        () => Number(coreDiscount) + Number(couponApplied || 0) + Number(adminApplied || 0),
        [coreDiscount, couponApplied, adminApplied]
    );
    const finalAmount = useMemo(
        () => Math.max(0, Number(baseSum) - Number(totalDiscount)),
        [baseSum, totalDiscount]
    );

    const pricing: PricingState = {
        base: Number(baseSum.toFixed(2)),
        offer: Number(offerSum.toFixed(2)),
        coupon: Number(couponApplied.toFixed(2)),
        admin: Number(adminApplied.toFixed(2)),
        totalDiscount: Number(totalDiscount.toFixed(2)),
        final: Number(finalAmount.toFixed(2)),
    };

    // ---------------- Effects ----------------

    // Load booking if edit & bookingId present and no initial props given
    useEffect(() => {
        const shouldFetch = mode === "edit" && bookingId && !initialItems && !initialSchedule;
        if (!shouldFetch) return;

        (async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getBooking(bookingId!);
                console.log("now",data)
                // Map existing items -> ItemRow[]
                const rows: ItemRow[] = (data.items || []).map((bi: any) => {
                    const ref =
                        bi.lab_test_detail ||
                        bi.profile_detail ||
                        bi.package_detail ||
                        {};
                    const itemType: ItemType = bi.lab_test
                        ? "lab_test"
                        : bi.profile
                            ? "lab_profile"
                            : "lab_package";

                    return {
                        id: Date.now() + Math.floor(Math.random() * 10000),
                        patient: bi.patient_detail,
                        itemType,
                        item: ref,
                        price: Number(bi.base_price || ref.price || 0),
                        offer_price: Number(
                            bi.offer_price ?? ref.offer_price ?? ref.price ?? 0
                        ),
                    };
                });

                setItems(rows);
                setSchedule({
                    date: data.scheduled_date || "",
                    time: data.scheduled_time || "",
                });

                // Prefill discounts if exposed (optional; fallback to 0)
                setCouponApplied(Number(data.coupon_discount || 0));
                setAdminApplied(Number(data.admin_discount || 0));
                if (data.coupon) {
                    setSelectedCoupon(data.coupon_detail); // if serializer returns object; if id, you can fetch by id
                }
            } catch (err: any) {
                setError(err?.message || "Failed to load booking.");
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, bookingId]);

    // Patients of selected customer
    useEffect(() => {
        if (!customer?.id) return;
        (async () => {
            try {
                const res = await getPatient({ customer: customer.id, page_size: 1000 });
                const list = res.results || res.data || [];
                setPatientList(list);
                if (!selectedPatient && list.length > 0) {
                    setSelectedPatient(list[0]);
                }
            } catch (e) {
                // ignore
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer]);

    // Catalog items for selected type
    useEffect(() => {
        (async () => {
            let res: any;
            if (itemType === "lab_test") res = await getLabTests({ page_size: 1000 });
            if (itemType === "lab_profile") res = await getLabProfiles({ page_size: 1000 });
            if (itemType === "lab_package") res = await getLabPackages({ page_size: 1000 });

            const list = res?.results || res?.data || [];
            setItemList(list);
            if ( list.length > 0) {
                setSelectedItem(list[0]);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemType]);

    // Load coupons once
    useEffect(() => {
        (async () => {
            try {
                const res = await getCoupons({ page_size: 100 });
                setCouponList(res.results || res.data || []);
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    // ---------------- Handlers ----------------

    const handleAddItem = () => {
        if (!selectedPatient || !selectedItem) return;
        const next: ItemRow = {
            id: Date.now(),
            patient: selectedPatient,
            itemType,
            item: selectedItem,
            price: Number(selectedItem?.price || 0),
            offer_price: Number(
                selectedItem?.offer_price ?? selectedItem?.price ?? 0
            ),
        };
        const merged = [...items, next];
        setItems(merged);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter((r) => r.id !== id));
    };

    const handleApplyCoupon = async () => {
        setCouponMessage("");
        if (!selectedCoupon?.code) {
            setCouponMessage("Please select a coupon.");
            return;
        }
        try {
            const res = await validateCoupon(selectedCoupon.code, Number(baseSum));
            if (res.valid) {
                setCouponApplied(Number(res.discount || 0));
                setCouponMessage(res.message || "Coupon applied.");
            } else {
                setCouponMessage(res.message || "Coupon not valid.");
            }
        } catch (err: any) {
            setCouponMessage(err?.response?.data?.message || "Coupon validation failed.");
        }
    };

    const handleApplyAdmin = () => {
        setAdminApplied(Number(adminInput || 0));
    };

    const handleSort = (key: keyof ItemRow) => {
        const dir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
        setSortKey(key);
        setSortDir(dir);
    };

    const sortedItems = useMemo(() => {
        const arr = [...items];
        if (!sortKey) return arr;
        return arr.sort((a, b) => {
            let aVal: any = a[sortKey];
            let bVal: any = b[sortKey];
            if (sortKey === "patient") {
                aVal = `${a.patient?.first_name ?? ""} ${a.patient?.last_name ?? ""}`;
                bVal = `${b.patient?.first_name ?? ""} ${b.patient?.last_name ?? ""}`;
            }
            if (sortKey === "item") {
                aVal = a.item?.name ?? "";
                bVal = b.item?.name ?? "";
            }
            if (typeof aVal === "string") {
                return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDir === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
        });
    }, [items, sortKey, sortDir]);

    // Output payload (create or edit)
    const buildResultPayload = () => {
        const payloadItems = items.map((it) => {
            const base_price = Number(it.price || 0);
            const offer_price = Number(it.offer_price ?? it.price ?? 0);
            const out: any = {
                patient: it.patient?.id,
                base_price,
                offer_price,
            };
            if (it.itemType === "lab_test") out.lab_test = it.item?.id;
            if (it.itemType === "lab_profile") out.profile = it.item?.id;
            if (it.itemType === "lab_package") out.package = it.item?.id;
            // helpful for validation util on server (optional)
            out.product_type = it.itemType;
            out.product_id = it.item?.id;
            return out;
        });

        return {
            schedule,
            items,
            payloadItems, // convenience for parent/api
            pricing,      // base, offer, coupon, admin, totalDiscount, final
            coupon: selectedCoupon,
        };
    };

    const handlePrimaryAction = async () => {
        // validations
        setError("");
        if (!schedule.date || !schedule.time) {
            setError("Schedule date and time are required.");
            return;
        }
        if (items.length === 0) {
            setError("Please add at least one item.");
            return;
        }

        const data = buildResultPayload();
        if (mode === "create") {
            onContinue?.({
                schedule: data.schedule,
                items: data.items,
                pricing: data.pricing,
                coupon: data.coupon,
            });
            return;
        }

        // edit mode
        if (mode === "edit") {
            await onSave?.({
                schedule: data.schedule,
                items: data.items,
                pricing: data.pricing,
                coupon: data.coupon,
            });
        }
    };

    // ---------------- UI ----------------

    if (loading) {
        return (
            <Stack alignItems="center" py={4}>
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Box>
            <Typography variant="h6">
                {mode === "edit" ? "Booking Details" : "Build Booking"}
            </Typography>
            <Divider sx={{ my: 2 }} />

            {!!error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Schedule */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        type="date"
                        label="Date"
                        InputLabelProps={{ shrink: true }}
                        value={schedule.date}
                        onChange={(e) => setSchedule((s) => ({ ...s, date: e.target.value }))}
                        required
                    />
                    <TextField
                        type="time"
                        label="Time"
                        InputLabelProps={{ shrink: true }}
                        value={schedule.time}
                        onChange={(e) => setSchedule((s) => ({ ...s, time: e.target.value }))}
                        required
                    />
                </Stack>
            </Paper>

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
                                {[
                                    { key: "patient", label: "Patient" },
                                    { key: "itemType", label: "Type" },
                                    { key: "item", label: "Item" },
                                    { key: "price", label: "Price" },
                                    { key: "offer_price", label: "Offer Price" },
                                ].map((col) => (
                                    <TableCell
                                        key={col.key}
                                        onClick={() => handleSort(col.key as keyof ItemRow)}
                                        sx={{ cursor: "pointer", fontWeight: 600, userSelect: "none" }}
                                    >
                                        {col.label}
                                        {sortKey === (col.key as keyof ItemRow) &&
                                            (sortDir === "asc" ? " 🔼" : " 🔽")}
                                    </TableCell>
                                ))}
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedItems.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>
                                        {r.patient?.first_name} {r.patient?.last_name}
                                    </TableCell>
                                    <TableCell>{r.itemType}</TableCell>
                                    <TableCell>{r.item?.name}</TableCell>
                                    <TableCell>₹{Number(r.price).toFixed(2)}</TableCell>
                                    <TableCell>₹{Number(r.offer_price).toFixed(2)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleRemoveItem(r.id)}>
                                            <TrashIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sortedItems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No items added
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>

            {/* Discounts & Pricing */}
            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Coupons & Discounts
                </Typography>

                <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
                    {/* Coupon */}
                    <Stack spacing={1} sx={{ flex: 1 }}>
                        <Autocomplete
                            options={couponList}
                            getOptionLabel={(o) => o?.code ?? ""}
                            value={selectedCoupon}
                            onChange={(_, v) => setSelectedCoupon(v)}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Coupon" placeholder="Search coupon code" />
                            )}
                        />
                        <Button variant="outlined" onClick={handleApplyCoupon}>
                            Apply Coupon
                        </Button>
                        {!!couponMessage && (
                            <Typography variant="body2" sx={{ color: "success.main" }}>
                                {couponMessage}
                            </Typography>
                        )}
                    </Stack>

                    {/* Admin Discount */}
                    <Stack spacing={1} sx={{ width: { xs: "100%", md: 260 } }}>
                        <TextField
                            label="Admin Discount (₹)"
                            value={adminInput}
                            onChange={(e) =>
                                setAdminInput(Number(String(e.target.value).replace(/\D/g, "")))
                            }
                        />
                        <Button variant="outlined" onClick={handleApplyAdmin}>
                            Apply Admin Discount
                        </Button>
                    </Stack>
                </Stack>

                {/* Totals */}
                <Divider sx={{ my: 2 }} />
                <Stack spacing={0.5}>
                    <Typography>Base Price: ₹{pricing.base.toFixed(2)}</Typography>
                    <Typography>Offer Price: ₹{pricing.offer.toFixed(2)}</Typography>
                    <Typography sx={{ color: "success.main" }}>
                        Core Discount (Base - Offer): -₹{(pricing.base - pricing.offer).toFixed(2)}
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
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                        Final Amount: ₹{pricing.final.toFixed(2)}
                    </Typography>
                </Stack>
            </Paper>

            {/* Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button onClick={onBack}>Back</Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePrimaryAction}
                >
                    {mode === "edit" ? "Save Changes" : "Continue"}
                </Button>
            </Box>

            {/* Patient Modal */}
            <PatientModal
                open={openPatientModal}
                onClose={() => setOpenPatientModal(false)}
                onSaved={() => {
                    setOpenPatientModal(false);
                    // reload patients after adding
                    getPatient({ customer: customer.id, page_size: 1000 }).then((res) =>
                        setPatientList(res.results || res.data || [])
                    );
                }}
                customer={customer}
            />
        </Box>
    );
}
