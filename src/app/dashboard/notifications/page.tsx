// src/app/dashboard/lab-products/page.tsx
"use client";

import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { NotificationsWrapper } from "@/components/dashboard/notififcations/notifications-wrapper";

export default function LabProductsPage() {
  const [tab, setTab] = useState<"notification" | "sms_template">("notification");

  const handleTabChange = (_: any, newValue: "notification" | "sms_template") => {
    setTab(newValue);
  };

  return (
    <Box>
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Notification" value="notification" />
        <Tab label="SMS Template" value="sms_template" />
      </Tabs>

      <Box mt={2}>
        {tab === "notification" && <NotificationsWrapper entityType="notification" title="Notification" />}
        {tab === "sms_template" && <NotificationsWrapper entityType="sms_template" title="SMS Template" />}
      </Box>
    </Box>
  );
}
