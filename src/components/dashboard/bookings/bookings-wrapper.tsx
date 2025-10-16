"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Stack,
  CircularProgress,
  Alert,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { PageHeader } from "@/components/dashboard/layout/page-header";
import { BookingsTable } from "@/components/dashboard/bookings/bookings-table";
import { getBookings } from "@/api/bookings";
import { useRouter } from "next/navigation";

export default function BookingWrapper() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const router = useRouter();

  // ✅ Define fetchBookings with useCallback to avoid recreating function
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const ordering = sortBy
        ? `${sortDir === "desc" ? "-" : ""}${sortBy}`
        : undefined;

      const res = await getBookings({
        page,
        page_size: rowsPerPage,
        search,
        ordering,
      });

      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, sortBy, sortDir]);

  // ✅ Trigger fetch when dependencies change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Bookings"
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={() => router.push("/dashboard/bookings/create")}
        onFilter={() => {}}
        activeFiltersCount={0}
      />

      {/* States */}
      {loading && (
        <Stack alignItems="center">
          <CircularProgress />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Empty State */}
      {!loading && !error && rows.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6">No bookings found</Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard/bookings/create")}
          >
            Add Booking
          </Button>
        </Box>
      )}

      {/* Data Table */}
      {!loading && !error && rows.length > 0 && (
        <BookingsTable
          bookings={rows}
          count={totalCount}
          page={page - 1} // MUI pagination is 0-indexed
          rowsPerPage={rowsPerPage}
          refreshBooking={fetchBookings} // ✅ Now this works
          onPageChange={(newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(1);
          }}
          onSort={(key, dir) => {
            setSortBy(String(key));
            setSortDir(dir);
          }}
        />
      )}
    </Stack>
  );
}
