"use client";

import { Box } from "@mui/material";
import  BookingWrapper  from "@/components/dashboard/bookings/bookings-wrapper";

export default function BookingsPage() {
  return (
    <Box>
      <Box mt={0}>
        <BookingWrapper />
      </Box>
    </Box>
  );
}
