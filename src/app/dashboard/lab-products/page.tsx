// src/app/dashboard/lab-products/page.tsx
"use client";

import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { LabProductsWrapper } from "@/components/dashboard/lab-products/lab-products-wrapper";

export default function LabProductsPage() {
  const [tab, setTab] = useState<"test" | "package" | "profile" | "category">("test");

  const handleTabChange = (_: any, newValue: "test" | "package" | "profile" | "category") => {
    setTab(newValue);
  };

  return (
    <Box>
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Lab Tests" value="test" />
        <Tab label="Lab Profiles" value="profile" />
        <Tab label="Lab Packages" value="package" />
        <Tab label="Lab Category" value="category" />
        
      </Tabs>

      <Box mt={2}>
        {tab === "test" && <LabProductsWrapper entityType="test" title="Lab Tests" />}
        {tab === "profile" && <LabProductsWrapper entityType="profile" title="Lab Profiles" />}
        {tab === "package" && <LabProductsWrapper entityType="package" title="Lab Packages" />}
        {tab === "category" && <LabProductsWrapper entityType="category" title="Lab Category" />}
        
      </Box>
    </Box>
  );
}
