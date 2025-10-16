"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Box,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { updateBooking } from "@/api/bookings";

interface BookingOperationsModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  currentStatus?: string;
  currentAgent?: any;
  onSubmit: () => void;
}

const ACTIONS = [
  // { value: "add_remark", label: "Add Remark" },
  { value: "update_status", label: "Update Status" },
  // { value: "update_agent", label: "Update Agent" },
  { value: "update_payment", label: "Update Payment Status" },
  { value: "update_schedule", label: "Reschedule" },
  // { value: "upload_document", label: "Upload Document" },
];

export function BookingOperationsModal({
  open,
  onClose,
  bookingId,
  currentStatus,
  currentAgent,
  onSubmit,
}: BookingOperationsModalProps) {
  const router = useRouter();

  const [actionType, setActionType] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState(currentStatus || "");
  const [agentId, setAgentId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online" | "">("");

  // For reschedule
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setActionType("");
    setRemarks("");
    setStatus(currentStatus || "");
    setAgentId("");
    setPaymentMethod("");
    setNewDate("");
    setNewTime("");
  };

  const handleSubmit = async () => {
    if (!actionType) return setError("Please select an action type.");
    if (!remarks.trim()) return setError("Remarks are required.");

    let payload: Record<string, any> = { action_type: actionType, remarks };

    if (actionType === "update_status") {
      payload.status = status;
    }

    if (actionType === "update_agent") {
      payload.current_agent = agentId;
    }

    if (actionType === "update_payment") {
      if (!paymentMethod) return setError("Please select a payment method.");
      payload.payment_method = paymentMethod;
      if (paymentMethod === "cash") {
        payload.payment_status = "success";
      }
    }

    if (actionType === "update_schedule") {
      if (!newDate || !newTime)
        return setError("Please select both date and time for rescheduling.");
      payload.scheduled_date = newDate;
      payload.scheduled_time = newTime;
    }

    try {
      setLoading(true);
      await updateBooking(bookingId, payload);
      onSubmit();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Failed to update booking:", err);
      setError(err.response?.data?.detail || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Header */}
      <DialogTitle>
        ID: {bookingId}
        <Button
          disabled
          onClick={() => router.push(`/dashboard/bookings/${bookingId}/edit`)}
          variant="outlined"
          size="small"
          sx={{ float: "right" }}
        >
          Update Details
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Action Type */}
          <FormControl fullWidth>
            <InputLabel>Action Type</InputLabel>
            <Select
              label="Action Type"
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value);
                setError("");
              }}
            >
              {ACTIONS.map((a) => (
                <MenuItem key={a.value} value={a.value}>
                  {a.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Dynamic Inputs */}
          {actionType === "update_status" && (
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {/* <MenuItem value="pending">Pending</MenuItem> */}
                <MenuItem value="verified">Verified</MenuItem>
                {/* <MenuItem value="manger_assigned">Manger Assigned</MenuItem>
                <MenuItem value="feild_agent_assigned">Feild Agent Assigned</MenuItem> */}
                <MenuItem value="sample_collected">Sample Collected</MenuItem>
                {/* <MenuItem value="in_progress">In Progress</MenuItem> */}
                <MenuItem value="report_uploaded">All Reports Uploaded</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          )}

          {actionType === "update_agent" && (
            <TextField
              label="Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              fullWidth
              placeholder="Enter agent user ID"
            />
          )}

          {actionType === "update_payment" && (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary">
                💡 If Cash is selected, payment will be marked as <b>success</b>.  
                If Online is selected, the backend will handle payment initiation.
              </Typography>
            </Box>
          )}

          {actionType === "update_schedule" && (
            <Stack spacing={2}>
              <TextField
                type="date"
                label="New Date"
                InputLabelProps={{ shrink: true }}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                fullWidth
              />
              <TextField
                type="time"
                label="New Time"
                InputLabelProps={{ shrink: true }}
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                fullWidth
              />
              <Typography variant="body2" color="text.secondary">
                🕓 Use this option to reschedule the booking date/time.
              </Typography>
            </Stack>
          )}

          {/* Remarks - always required */}
          <TextField
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required
            fullWidth
            multiline
            minRows={2}
          />

          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Updating..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
