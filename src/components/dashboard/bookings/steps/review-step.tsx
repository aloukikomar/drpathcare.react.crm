"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Divider,
  Stack,
  Paper,
  Avatar,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  Alert,
} from "@mui/material";
import {
  User as UserIcon,
  House as HouseIcon,
  PencilSimple,
  CalendarCheckIcon,
  CurrencyInr,
} from "@phosphor-icons/react";
import { getCoupons, validateCoupon } from "@/api/coupons";
import { createBooking } from "@/api/bookings";

// --- Pricing ---
interface PricingState {
  base: number;          // Sum of base prices
  offer: number;         // Sum of offer prices (pre-coupon/admin)
  coupon: number;        // Coupon discount applied
  admin: number;         // Admin discount applied
  totalDiscount: number; // Total = (base - offer) + coupon + admin
  final: number;         // Final = base - totalDiscount
}

interface Props {
  customer: any;
  address: any;
  scheduledDate: any;
  scheduledTime: any;
  testDetails: any[];
  selectedCoupon: any;
  pricing: PricingState;
  onBack: () => void;
  goToCustomerStep?: () => void;
  goToTestsStep?: () => void;
}

export function ReviewStep({
  customer,
  selectedCoupon,
  scheduledDate,
  scheduledTime,
  address,
  testDetails,
  pricing,
  onBack,
  goToCustomerStep,
  goToTestsStep,
}: Props) {
  const router = useRouter();

  // 🧾 State
  const [couponList, setCouponList] = useState<any[]>([]);
  const [couponDiscount, setCouponDiscount] = useState<number>(pricing.coupon || 0);
  const [adminDiscount, setAdminDiscount] = useState<number>(pricing.admin || 0);
  const [adjustedPricing, setAdjustedPricing] = useState<PricingState>(pricing);

  const [couponMessage, setCouponMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🪄 Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await getCoupons({ page_size: 100 });
        setCouponList(res.results || res.data || []);
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
      }
    };
    fetchCoupons();
  }, []);

  // ✅ Recalculate totals
  const recalcTotals = (couponVal: number, adminVal: number) => {
    const coreDiscount = pricing.base - pricing.offer;
    const totalDiscount = coreDiscount + couponVal + adminVal;
    const final = Math.max(pricing.base - totalDiscount, 0);

    setAdjustedPricing({
      ...pricing,
      coupon: couponVal,
      admin: adminVal,
      totalDiscount,
      final,
    });
  };

  // ✅ Coupon apply
  const handleApplyCoupon = async () => {
    if (!selectedCoupon?.code) {
      setCouponMessage("Please select a coupon");
      return;
    }
    try {
      const res = await validateCoupon(selectedCoupon.code, pricing.base);
      if (res.valid) {
        setCouponDiscount(Number(res.discount));
        setCouponMessage("Coupon applied successfully!");
        recalcTotals(Number(res.discount), adminDiscount);
      } else {
        setCouponMessage(res.message);
      }
    } catch (err: any) {
      setCouponMessage(err.response?.data?.message || "Coupon validation failed");
    }
  };

  // ✅ Admin discount apply
  const handleApplyAdminDiscount = () => {
    recalcTotals(couponDiscount, adminDiscount);
  };

  // ✅ Confirm Booking
  const handleConfirmBooking = async () => {
    setError("");

    // 1️⃣ Basic validation
    if (!scheduledDate || !scheduledTime) {
      setError("Scheduled date and time are required.");
      return;
    }
    if (testDetails.length === 0) {
      setError("At least one test is required to create a booking.");
      return;
    }

    // 2️⃣ Build items payload
    const itemsPayload = testDetails.map((item) => {
      const basePrice = Number(item.item?.price) || 0;
      const offerPrice = Number(item.item?.offer_price ?? basePrice) || 0;

      const payloadItem: any = {
        patient: item.patient?.id,
        base_price: basePrice,
        offer_price: offerPrice,
      };

      if (item.itemType === "lab_test") {
        payloadItem.lab_test = item.item?.id;
        payloadItem.product_type = "lab_test";
        payloadItem.product_id = item.item?.id;
      } else if (item.itemType === "lab_profile") {
        payloadItem.profile = item.item?.id;
        payloadItem.product_type = "lab_profile";
        payloadItem.product_id = item.item?.id;
      } else if (item.itemType === "lab_package") {
        payloadItem.package = item.item?.id;
        payloadItem.product_type = "lab_package";
        payloadItem.product_id = item.item?.id;
      }

      return payloadItem;
    });

    try {
      setLoading(true);

      const payload = {
        user: customer?.id,
        address: address?.id,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        coupon: selectedCoupon?.id || null,
        admin_discount: Number(adminDiscount || 0),
        discount_amount: adjustedPricing.totalDiscount,
        coupon_discount: adjustedPricing.coupon,
        base_total: adjustedPricing.base,
        offer_total: adjustedPricing.offer,
        final_amount: adjustedPricing.final,
        total_savings: adjustedPricing.base - adjustedPricing.final,
        remarks: "Booking created from dashboard",
        items: itemsPayload,
      };

      const res = await createBooking(payload);

      if (res?.id) {
        router.push("/dashboard/bookings");
      }
    } catch (err: any) {
      console.error("Booking creation failed:", err);
      setError(err.response?.data?.detail || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review & Confirm Booking
      </Typography>
      <Divider sx={{ my: 2 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 👤 Customer Card */}
      <Paper variant="outlined" sx={cardStyle}>
        <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
          <UserIcon size={28} weight="fill" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6">
            {customer?.first_name} {customer?.last_name}
          </Typography>
          <Stack direction="row" spacing={3} mt={1} flexWrap="wrap">
            <Typography variant="body2">📞 {customer?.mobile}</Typography>
            <Typography variant="body2">📧 {customer?.email}</Typography>
            <Typography variant="body2">DOB: {customer?.date_of_birth}</Typography>
            <Typography variant="body2">Gender: {customer?.gender}</Typography>
          </Stack>
        </Box>
        <IconButton onClick={goToCustomerStep}>
          <PencilSimple />
        </IconButton>
      </Paper>

      {/* 🏠 Address Card */}
      <Paper variant="outlined" sx={cardStyle}>
        <Avatar sx={{ bgcolor: "success.main", width: 56, height: 56 }}>
          <HouseIcon size={28} weight="fill" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6">Delivery Address</Typography>
          <Typography variant="body2">
            {address?.line1}, {address?.city} - {address?.pincode}
          </Typography>
        </Box>
        <IconButton onClick={goToCustomerStep}>
          <PencilSimple />
        </IconButton>
      </Paper>

      {/* 📅 Schedule Card */}
      <Paper variant="outlined" sx={cardStyle}>
        <Avatar sx={{ bgcolor: "warning.main", width: 56, height: 56 }}>
          <CalendarCheckIcon size={28} weight="fill" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6">Scheduled Booking</Typography>
          {scheduledDate && scheduledTime ? (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {new Date(scheduledDate).toLocaleDateString()} at {scheduledTime}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No schedule selected
            </Typography>
          )}
        </Box>
        <IconButton onClick={goToTestsStep}>
          <PencilSimple />
        </IconButton>
      </Paper>

      {/* 🧪 Selected Tests */}
      <Paper variant="outlined" sx={cardStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Selected Tests</Typography>
          <IconButton onClick={goToTestsStep}>
            <PencilSimple />
          </IconButton>
        </Stack>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Item Type</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Offer Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testDetails?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.patient?.first_name} {item.patient?.last_name}</TableCell>
                  <TableCell>{item.itemType}</TableCell>
                  <TableCell>{item.item?.name}</TableCell>
                  <TableCell>₹{item.item?.price}</TableCell>
                  <TableCell>₹{item.item?.offer_price ?? item.item?.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* 💰 Pricing Summary */}
      <Paper variant="outlined" sx={cardStyle}>
        <Avatar sx={{ bgcolor: "success.main", width: 56, height: 56 }}>
          <CurrencyInr size={28} weight="fill" />
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6">Pricing Summary</Typography>
          <Stack spacing={1} mt={1}>
            <Typography>Base Price: ₹{adjustedPricing.base}</Typography>
            <Typography>Offer Price: ₹{adjustedPricing.offer}</Typography>
            <Typography>Core Discount: -₹{(adjustedPricing.base - adjustedPricing.offer).toFixed(2)}</Typography>
            <Typography>Coupon Discount: -₹{couponDiscount}</Typography>
            <Typography>Admin Discount: -₹{adminDiscount}</Typography>
            <Typography color="success.main">Total Discount: -₹{adjustedPricing.totalDiscount}</Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Final Amount: ₹{adjustedPricing.final}
            </Typography>
          </Stack>
        </Box>
        <IconButton onClick={goToTestsStep}>
          <PencilSimple />
        </IconButton>
      </Paper>

      {/* ✅ Actions */}
      <Box mt={4} textAlign="right">
        <Button onClick={onBack}>Back</Button>
        <Button
          variant="contained"
          color="success"
          sx={{ ml: 2 }}
          onClick={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? "Creating..." : "Confirm Booking"}
        </Button>
      </Box>
    </Box>
  );
}

// --- Styling Helper ---
const cardStyle = {
  p: 2,
  mb: 3,
  display: "flex",
  alignItems: "center",
  gap: 2,
  borderRadius: 2,
  bgcolor: "grey.50",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: 1,
};
