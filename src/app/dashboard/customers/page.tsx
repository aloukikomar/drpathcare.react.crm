// src/app/dashboard/lab-products/page.tsx
"use client";

import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { CustomersWrapper } from "@/components/dashboard/customers/customers-wrapper";

export default function CustomersPage() {
  const [tab, setTab] = useState<"customer" | "patient" | "address" >("customer");

  const handleTabChange = (_: any, newValue: "customer" | "patient" | "address") => {
    setTab(newValue);
  };

  return (
    <Box>
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Customers" value="customer" />
        <Tab label="Patient" value="patient" />
        <Tab label="Address" value="address" />
        
      </Tabs>

      <Box mt={2}>
        {tab === "customer" && <CustomersWrapper entityType="customer" title="Customers" />}
        {tab === "patient" && <CustomersWrapper entityType="patient" title="Patient" />}
        {tab === "address" && <CustomersWrapper entityType="address" title="Address" />}
        
      </Box>
    </Box>
  );
}
