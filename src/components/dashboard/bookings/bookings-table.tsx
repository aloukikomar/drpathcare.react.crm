"use client";

import { useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Stack,
  Drawer,
  Divider,
  TablePagination,
  TableSortLabel,
  Chip,
} from "@mui/material";
import {
  CaretDown,
  CaretUp,
  PencilSimple,
  ClockCounterClockwise,
  CurrencyInr,
} from "@phosphor-icons/react";
import { BookingOperationsModal } from "./booking-operations-modal";
import PaymentDrawer from "./booking-payment-drawer";

type SortDir = "asc" | "desc";

type BookingRow = {
  id: string;
  ref_id?: string;
  user_email?: string;
  status: string;
  payment_status: string;
  final_amount: string | number;
  created_at: string;
  address_detail?: {
    line1?: string;
    city?: string;
    pincode?: string;
  };
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  base_total?: string | number;
  offer_total?: string | number;
  coupon_discount?: string | number | null;
  admin_discount?: string | number | null;
  items?: any[];
  actions?: any[];
};

interface Props {
  bookings: BookingRow[];
  count: number;
  page: number;               // 0-indexed
  rowsPerPage: number;
  refreshBooking: () => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newSize: number) => void;
  onSort: (key: string, dir: SortDir) => void; // pass through to API as ordering
}

export function BookingsTable({
  bookings,
  count,
  page,
  rowsPerPage,
  refreshBooking,
  onPageChange,
  onRowsPerPageChange,
  onSort,
}: Props) {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedActions, setSelectedActions] = useState<any[]>([]);
  const [openOperationModal, setOpenOperationModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);

  // server sorting state (so label shows correct direction)
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleRow = (id: string) => {
    setOpenRow(openRow === id ? null : id);
  };

  const openActionsDrawer = (actions: any[]) => {
    setSelectedActions(actions || []);
    setDrawerOpen(true);
  };

  const handleOperation = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setOpenOperationModal(true);
  };

  const handlePayments = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setPaymentDrawerOpen(true);
  };

  // columns + mapping to API ordering keys
  const columns: { key: string; label: string; sortable?: boolean; orderKey?: string }[] = [
    { key: "expand", label: "" },
    { key: "ref_id", label: "Booking Ref ID", sortable: true, orderKey: "ref_id" },
    { key: "user_email", label: "User", sortable: true, orderKey: "user__email" },
    { key: "status", label: "Status", sortable: true, orderKey: "status" },
    { key: "payment_status", label: "Payment Status", sortable: true, orderKey: "payment_status" },
    { key: "final_amount", label: "Final Amount", sortable: true, orderKey: "final_amount" },
    { key: "created_at", label: "Created At", sortable: true, orderKey: "created_at" },
    { key: "actions", label: "Actions" },
  ];

  const handleSortClick = (col: typeof columns[number]) => {
    if (!col.sortable || !col.orderKey) return;
    const nextDir: SortDir = sortBy === col.orderKey && sortDir === "asc" ? "desc" : "asc";
    setSortBy(col.orderKey);
    setSortDir(nextDir);
    // For DRF ordering param: asc = "field", desc = "-field"
    onSort(col.orderKey, nextDir);
  };

  const toNum = (v: any) => Number(v ?? 0);

  // Capitalize helper: "sample_collected" → "Sample Collected"
  const formatLabel = (text: string) =>
    text
      ? text
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      : "N/A";

  // Common Chip styling for uniform length
  const chipStyle = {
    minWidth: 140,
    justifyContent: "center",
    fontWeight: 500,
    borderRadius: "8px",
    textTransform: "capitalize",
  };

  // ✅ Color mapping for booking status
  const getStatusChip = (status: string) => {
    const label = formatLabel(status);
    const normalized = status?.toLowerCase();

    switch (normalized) {
      case "completed":
        return <Chip label={label} color="success" size="small" sx={chipStyle}/>;
      case "report_uploaded":
        return <Chip label={label} color="info" size="small" sx={chipStyle}/>;
      case "open":
        return <Chip label={label} color="info" size="small" sx={chipStyle}/>;
      case "verified":
        return <Chip label={label} color="warning" size="small" sx={chipStyle}/>;
      case "cancelled":
        return <Chip label={label} color="error" size="small" sx={chipStyle} />;
      case "payment_collected":
        return <Chip label={label} color="success" size="small" sx={chipStyle} />;
      case "sample_collected":
        return <Chip label={label} color="info" size="small" sx={chipStyle} />;
      default:
        return <Chip label={label || "N/A"} color="default" size="small" sx={chipStyle} />;
    }
  };

  // ✅ Color mapping for payment status
  const getPaymentChip = (paymentStatus: string) => {
    const normalized = paymentStatus?.toLowerCase();

    switch (normalized) {
      case "success":
      case "paid":
        return <Chip label="Paid" color="success" size="small" sx={chipStyle}/>;

      case "pending":
        return <Chip label="Pending" color="info" size="small" sx={chipStyle}/>;
      case "initiated":
        return <Chip label="Initiated" color="warning" size="small" sx={chipStyle}/>;

      case "failed":
      case "cancelled":
        return <Chip label="Failed" color="error" size="small" sx={chipStyle}/>;

      default:
        return <Chip label={paymentStatus || "N/A"} color="default" size="small" sx={chipStyle}/>;
    }
  };


  return (
    <>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.key}>
                  {c.sortable ? (
                    <TableSortLabel
                      active={sortBy === c.orderKey}
                      direction={sortBy === c.orderKey ? sortDir : "asc"}
                      onClick={() => handleSortClick(c)}
                    >
                      {c.label}
                    </TableSortLabel>
                  ) : (
                    c.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {bookings.map((row) => {
              const base = toNum(row.base_total);
              const offer = toNum(row.offer_total);
              const coupon = toNum(row.coupon_discount);
              const admin = toNum(row.admin_discount);
              const coreDiscount = base - offer;
              const totalDiscount = coreDiscount + coupon + admin;
              const finalAmount = toNum(row.final_amount);

              return (
                <>

                  <TableRow hover key={row.id}>
                    {/* expand */}
                    <TableCell>
                      <IconButton size="small" onClick={() => toggleRow(row.id)}>
                        {openRow === row.id ? <CaretUp /> : <CaretDown />}
                      </IconButton>
                    </TableCell>

                    <TableCell>{row.ref_id || "—"}</TableCell>
                    <TableCell>{row.user_email || "—"}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell>{getPaymentChip(row.payment_status)}</TableCell>
                    <TableCell>₹{finalAmount}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>

                    {/* actions */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => handleOperation(row.id)}>
                          <PencilSimple />
                        </IconButton>
                        <IconButton onClick={() => openActionsDrawer(row.actions || [])}>
                          <ClockCounterClockwise />
                        </IconButton>
                        <IconButton onClick={() => handlePayments(row.id)}>
                          <CurrencyInr />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>

                  {/* collapsible details */}
                  <TableRow key={`${row.id}-details`}>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length}>
                      <Collapse in={openRow === row.id} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Booking Details
                          </Typography>

                          <Typography variant="body2" sx={{ mb: 2 }}>
                            Address: {row.address_detail?.line1 || "—"},{" "}
                            {row.address_detail?.city || "—"} - {row.address_detail?.pincode || "—"}
                          </Typography>

                          <Typography variant="body2" sx={{ mb: 2 }}>
                            Scheduled: {row.scheduled_date || "—"} at {row.scheduled_time || "—"}
                          </Typography>

                          {/* Items */}
                          <Typography variant="subtitle1" sx={{ mt: 2 }}>
                            Items
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Base Price</TableCell>
                                <TableCell>Offer Price</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {row.items?.length ? (
                                row.items.map((item: any) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      {item.patient_detail?.first_name} {item.patient_detail?.last_name}
                                    </TableCell>
                                    <TableCell>
                                      {item.lab_test_detail?.name ||
                                        item.profile_detail?.name ||
                                        item.package_detail?.name ||
                                        "—"}
                                    </TableCell>
                                    <TableCell>₹{toNum(item.base_price).toFixed(2)}</TableCell>
                                    <TableCell>₹{toNum(item.offer_price).toFixed(2)}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} align="center">
                                    No items found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>

                          {/* Price Breakdown */}
                          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Price Breakdown
                            </Typography>
                            <Stack spacing={0.8}>
                              <Typography>Base Price: ₹{base.toFixed(2)}</Typography>
                              <Typography>Offer Price: ₹{offer.toFixed(2)}</Typography>
                              <Typography>Core Discount: -₹{coreDiscount.toFixed(2)}</Typography>
                              <Typography>Coupon Discount: -₹{coupon.toFixed(2)}</Typography>
                              <Typography>Admin Discount: -₹{admin.toFixed(2)}</Typography>
                              <Typography color="success.main">
                                Total Discount: -₹{totalDiscount.toFixed(2)}
                              </Typography>
                              <Typography variant="h6" sx={{ mt: 1 }}>
                                Final Amount: ₹{finalAmount.toFixed(2)}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>

        {/* Server-driven Pagination */}
        <TablePagination
          component="div"
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Operations Modal */}
      <BookingOperationsModal
        open={openOperationModal}
        onClose={() => setOpenOperationModal(false)}
        bookingId={selectedBooking}
        onSubmit={refreshBooking}
      />

      {/* Actions Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Typography variant="h6">Booking Actions</Typography>
          <Divider sx={{ my: 2 }} />
          {(selectedActions || []).length === 0 ? (
            <Typography>No actions logged for this booking.</Typography>
          ) : (
            selectedActions.map((act) => (
              <Box key={act.id} sx={{ mb: 2, p: 1, borderBottom: "1px solid #ddd" }}>
                <Typography variant="subtitle2">Action: {act.action}</Typography>
                <Typography variant="body2">User: {act.user_email || "System"}</Typography>
                <Typography variant="body2">Notes: {act.notes}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(act.created_at).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Drawer>

      {/* Payments Drawer */}
      <PaymentDrawer
        open={paymentDrawerOpen}
        bookingId={selectedBooking}
        onClose={() => setPaymentDrawerOpen(false)}
      />
    </>
  );
}
