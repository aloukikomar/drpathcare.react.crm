"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Paper,
  Avatar,
  Typography,
  Button,
  Autocomplete,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { User as UserIcon, Phone, EnvelopeSimple, PencilSimple } from "@phosphor-icons/react";
import { getCustomers } from "@/api/customers";
import  CustomerModal  from "./customers-modal"; // ✅ adjust path if needed

type Customer = {
  id: number;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
};

interface CustomerSectionProps {
  customer: Customer | null;
  onCustomerChange: (c: Customer | null) => void;
  title?: string;
  disableChange?: boolean;
}

export function CustomerSection({
  customer,
  onCustomerChange,
  title,
  disableChange = false,
}: CustomerSectionProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingMode, setEditingMode] = useState(false);

  // 🔄 Fetch customers
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCustomers(true);
        const res = await getCustomers({ page: 1, page_size: 50 });
        if (!mounted) return;
        setCustomers(res.results || res.data || []);
      } catch (e) {
        console.error("Failed to fetch customers", e);
      } finally {
        if (mounted) setLoadingCustomers(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fullName = useMemo(() => {
    const f = customer?.first_name || "";
    const l = customer?.last_name || "";
    return `${f} ${l}`.trim() || "Unnamed";
  }, [customer]);

  return (
    <Box>
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
      )}

      {/* 🔍 Always show customer search + add button */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Autocomplete
          sx={{ flex: 1 }}
          options={customers}
          loading={loadingCustomers}
          disabled={disableChange} // ✅ disable if not allowed to change
          getOptionLabel={(option: Customer) =>
            `${option.first_name ?? ""} ${option.last_name ?? ""} | ${option.mobile ?? ""}`.trim()
          }
          value={customer || null}
          onChange={(_, val) => {
            if (!disableChange) onCustomerChange(val);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Customer"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingCustomers ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Button
          variant="outlined"
          onClick={() => {
            setEditingMode(false);
            setCustomerModalOpen(true);
          }}
        >
          + Add Customer
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setEditingMode(false);
            setCustomerModalOpen(true);
          }}
        >
          + Add Lead Customer
        </Button>
      </Stack>

      {/* 📇 Customer Contact Card */}
      {customer?.id && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mt: 2,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 1,
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <UserIcon size={28} weight="fill" />
          </Avatar>

          <Box flex={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {fullName}
            </Typography>

            <Stack direction="row" spacing={3} mt={1} flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                <Phone size={18} />
                <Typography variant="body2">{customer.mobile}</Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <EnvelopeSimple size={18} />
                <Typography variant="body2">{customer.email}</Typography>
              </Stack>

              {customer.date_of_birth && (
                <Typography variant="body2">DOB: {customer.date_of_birth}</Typography>
              )}
              {customer.gender && <Typography variant="body2">Gender: {customer.gender}</Typography>}
            </Stack>
          </Box>

          {/* ✏️ Edit customer button */}
          <IconButton
            title="Edit customer"
            onClick={() => {
              setEditingMode(true);
              setCustomerModalOpen(true);
            }}
          >
            <PencilSimple />
          </IconButton>
        </Paper>
      )}

      {/* 🪟 Modals */}
      <CustomerModal
        open={customerModalOpen}
        customer={editingMode ? customer : null}
        onClose={() => setCustomerModalOpen(false)}
        onSaved={(newCustomer) => {
          setCustomers((prev) => {
            // ✅ Update existing or prepend new one
            const existingIndex = prev.findIndex((c) => c.id === newCustomer.id);
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = newCustomer;
              return updated;
            }
            return [newCustomer, ...prev];
          });
          onCustomerChange(newCustomer);
          setCustomerModalOpen(false);
        }}
      />
    </Box>
  );
}
