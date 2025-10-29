"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { getBooking, updateBooking } from "@/api/bookings";
import { CustomerSection } from "@/components/dashboard/customers/customer-section";
import { AddressSection } from "@/components/dashboard/customers/address-section";
import BookingDetailsStep, {
  ItemRow,
  PricingState,
} from "@/components/dashboard/bookings/steps/ad-booking-details-step";

function TabPanel({
  children,
  value,
  index,
}: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = String(params?.id || "");

  const [tab, setTab] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking states
  const [booking, setBooking] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);

  // Editable
  // const [schedule, setSchedule] = useState<ScheduleState>({ date: "", time: "" });
  const [items, setItems] = useState<ItemRow[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  // Pricing (now fully controlled)
  const [pricing, setPricing] = useState<PricingState>({
    base: 0,
    offer: 0,
    coupon: 0,
    admin: 0,
    totalDiscount: 0,
    final: 0,
  });

  // Old snapshot for diff detection
  // const [oldSchedule, setOldSchedule] = useState<ScheduleState | null>(null);
  const [oldItems, setOldItems] = useState<ItemRow[]>([]);
  const [oldCalc, setOldCalc] = useState<{ coupon: any; admin: number }>({
    coupon: null,
    admin: 0,
  });

  // Confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [diffs, setDiffs] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");

  // --- Fetch booking ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getBooking(bookingId);
        if (!mounted) return;

        setBooking(data);
        setCustomer(data.user_detail);
        setAddress(data.address_detail);

        // const fetchedSchedule = {
        //   date: data.scheduled_date || "",
        //   time: data.scheduled_time || "",
        // };
        // setSchedule(fetchedSchedule);
        // setOldSchedule(fetchedSchedule);

        const rows: ItemRow[] = (data.items || []).map((bi: any) => {
          const ref =
            bi.lab_test_detail || bi.profile_detail || bi.package_detail || {};
          const itemType: "lab_test" | "lab_profile" | "lab_package" = bi.lab_test
            ? "lab_test"
            : bi.profile
              ? "lab_profile"
              : "lab_package";
          return {
            id: bi.id,
            patient: bi.patient_detail,
            itemType,
            item_type:itemType,
            item: ref,
            price: Number(bi.base_price || ref.price || 0),
            offer_price: Number(bi.offer_price ?? ref.offer_price ?? ref.price ?? 0),
          };
        });
        setItems(rows);
        setOldItems(rows);

        const calc = {
          coupon: data.coupon_detail,
          admin: Number(data.admin_discount || 0),
          coupon_dis: Number(data.coupon_discount || 0)
        };
        setSelectedCoupon(data.coupon_detail);
        setPricing((p) => ({ ...p, admin: calc.admin,coupon: calc.coupon_dis }));
        setOldCalc(calc);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Failed to load booking");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [bookingId]);

  // --- Detect Differences ---
  const detectDifferences = () => {
    const changes: string[] = [];

    // if (oldSchedule?.date !== schedule.date)
    //   changes.push(`Scheduled Date changed from ${oldSchedule?.date} → ${schedule.date}`);
    // if (oldSchedule?.time !== schedule.time)
    //   changes.push(`Scheduled Time changed from ${oldSchedule?.time} → ${schedule.time}`);

    if ((oldCalc?.coupon?.id || null) !== (selectedCoupon?.id || null))
      changes.push("Coupon changed");
    if (oldCalc?.admin !== pricing.admin)
      changes.push(`Admin Discount changed from ₹${oldCalc.admin} → ₹${pricing.admin}`);

    if (oldItems.length !== items.length) {
      changes.push(`Item count changed (${oldItems.length} → ${items.length})`);
    } else {
      for (let i = 0; i < items.length; i++) {
        const old = oldItems[i];
        const now = items[i];
        if (old.item?.id !== now.item?.id) {
          changes.push(`Item #${i + 1} changed (${old.item?.name} → ${now.item?.name})`);
        }
        if (old.price !== now.price || old.offer_price !== now.offer_price) {
          changes.push(
            `Item #${i + 1} price changed (Base ₹${old.price} → ₹${now.price}, Offer ₹${old.offer_price} → ₹${now.offer_price})`
          );
        }
      }
    }

    return changes;
  };

  const determineActionType = () => {
    // const scheduleChanged =
    //   oldSchedule?.date !== schedule.date || oldSchedule?.time !== schedule.time;
    const itemsChanged = JSON.stringify(oldItems) !== JSON.stringify(items);
    const discountChanged =
      (oldCalc?.coupon?.id || null) !== (selectedCoupon?.id || null) ||
      oldCalc?.admin !== pricing.admin;

    if (itemsChanged) return "update_items";
    // if (scheduleChanged) return "update_schedule";
    if (discountChanged) return "update_discounts";
    return null;
  };

  // --- Confirmation Flow ---
  const handlePreSubmit = () => {
    const foundDiffs = detectDifferences();
    console.log(foundDiffs)
    if (foundDiffs.length === 0) {
      handleSubmit(); // no changes
    } else {
      setDiffs(foundDiffs);
      setConfirmOpen(true);
    }
  };

  const handleConfirm = async () => {
    const actionType = determineActionType();
    setConfirmOpen(false);
    await handleSubmit(actionType);
  };

  // --- Submit booking ---
  const handleSubmit = async (actionType?: string | null) => {
    try {
      setLoading(true);
      const payload = {
        action_type: actionType,
        remarks,
        // scheduled_date: schedule.date,
        // scheduled_time: schedule.time,
        coupon: selectedCoupon?.id || null,
        admin_discount: pricing.admin,
        base_total: pricing.base,
        offer_total: pricing.offer,
        final_amount: pricing.final,
        discount_amount: pricing.totalDiscount,
        address: address?.id,
        items: items.map((i) => ({
          patient: i.patient?.id,
          base_price: i.price,
          offer_price: i.offer_price,
          product_type:i.itemType,
          product_id: i.item?.id ,
          ...(i.itemType === "lab_test" && { lab_test: i.item?.id }),
          ...(i.itemType === "lab_profile" && { profile: i.item?.id }),
          ...(i.itemType === "lab_package" && { package: i.item?.id }),
        })),
      };

      await updateBooking(bookingId, payload);
      router.push("/dashboard/bookings");
    } catch (err: any) {
      setError(err?.message || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: any, newValue: number) => setTab(newValue as 0 | 1);

  // --- UI ---
  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">
            Booking ID: <strong>{bookingId}</strong>
          </Typography>
          <Button variant="outlined" onClick={() => router.push("/dashboard/bookings")}>
            Back to Bookings
          </Button>
        </Stack>
      </Paper>

      {loading && (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && booking && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={handleTabChange}>
              <Tab label="Booking Items" />
              <Tab label="Customer Details" />
            </Tabs>
          </Box>

          {/* Booking Items */}
          <TabPanel value={tab} index={0}>
            <BookingDetailsStep
              mode="edit"
              customer={customer}
              items={items}
              setItems={setItems}
              selectedCoupon={selectedCoupon}
              setSelectedCoupon={setSelectedCoupon}
              pricing={pricing}
              setPricing={setPricing}
              buttonText="Save Changes"
              onSubmit={handlePreSubmit}
              onBack={() => router.push("/dashboard/bookings")}
            />
          </TabPanel>

          {/* Customer Details */}
          <TabPanel value={tab} index={1}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Customer & Address
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <CustomerSection
                customer={booking.user_detail}
                onCustomerChange={(c) => {
                  setCustomer(c);
                  setAddress(null);
                }}
                disableChange
              />
              <Box sx={{ mt: 4 }}>
                <AddressSection
                  customer={booking.user_detail}
                  address={booking.address_detail}
                  onAddressChange={setAddress}
                  disableChange={false}
                  title="Address"
                />
              </Box>
            </Paper>
          </TabPanel>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Booking Changes</DialogTitle>
        <DialogContent dividers>
          {diffs.length > 1 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              You made multiple changes — recorded as "{determineActionType()}".
            </Alert>
          )}
          <Typography variant="body2" sx={{ mb: 2 }}>
            The following changes will be applied:
          </Typography>
          <List dense>
            {diffs.map((diff, i) => (
              <ListItem key={i}>
                <ListItemText primary={diff} />
              </ListItem>
            ))}
          </List>

          <TextField
            label="Remarks (required)"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!remarks.trim()} onClick={handleConfirm}>
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
