"use client";

import { Box, Button, Typography } from "@mui/material";

interface Props {
  customer: any;
  address: any;
  setAddress: (a: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export function AddressStep({ customer, address, setAddress, onBack, onNext }: Props) {
  return (
    <Box>
      <Typography variant="h6">Select Address for {customer?.name || "Customer"}</Typography>
      {/* TODO: List addresses, add new address button */}
      <Box mt={2}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext} sx={{ ml: 2 }}>
          Continue
        </Button>
      </Box>
    </Box>
  );
}
