// src/components/dashboard/bookings/PaymentDrawer.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import { X as CloseIcon, ArrowClockwise  } from "@phosphor-icons/react";
import { getBookingPayments,refreshLatestPayment  } from "@/api/payments"; // 👈 you'll create these APIs

interface PaymentDrawerProps {
  open: boolean;
  bookingId: string;
  onClose: () => void;
}

export default function PaymentDrawer({ open, bookingId, onClose }: PaymentDrawerProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // 🔎 Fetch payments for a booking
  const fetchPayments = async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const res = await getBookingPayments(bookingId);
      setPayments(res?.results || res?.data || []);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchPayments();
  }, [open, bookingId]);

  // 🔄 Update last payment status
  const handleUpdateStatus = async () => {
    if (!payments.length) return;
    const lastPayment = payments[0]; // latest one (since sorted desc)
    try {
      setUpdating(true);
      await refreshLatestPayment(bookingId);
      await fetchPayments(); // refresh list
    } catch (err) {
      console.error("Failed to update payment:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 400, p: 2 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">💳 Payments for Booking #{bookingId}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Actions */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">Payment History</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowClockwise />}
          onClick={handleUpdateStatus}
          disabled={updating || !payments.length}
        >
          {updating ? "Updating..." : "Update Status"}
        </Button>
      </Box>

      {/* Payment List */}
      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : payments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No payments found for this booking.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {payments.map((p) => (
            <Paper key={p.id} sx={{ p: 2 }} variant="outlined">
              <Typography variant="subtitle2">Amount: ₹{p.amount}</Typography>
              <Typography variant="body2">Status: {p.status}</Typography>
              <Typography variant="body2">Method: {p.method}</Typography>
              <Typography variant="body2">
                Created: {new Date(p.created_at).toLocaleString()}
              </Typography>
              {p.payment_link && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <a href={p.payment_link} target="_blank" rel="noopener noreferrer">
                    🔗 Payment Link
                  </a>
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
