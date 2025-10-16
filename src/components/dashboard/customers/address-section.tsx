"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { PencilSimple } from "@phosphor-icons/react";
import { getAddress } from "@/api/customers";
import AddressModal  from "./address-modal"; // ✅ adjust path if needed

interface Address {
  id: number;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

interface AddressSectionProps {
  customer: any;
  address: Address | null;
  onAddressChange: (addr: Address | null) => void;
  disableChange?: boolean;
  title?: string;
}

export function AddressSection({
  customer,
  address,
  onAddressChange,
  disableChange = false,
  title = "Address",
}: AddressSectionProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // 📦 Fetch addresses when customer changes
  useEffect(() => {
    if (!customer?.id) return;
    (async () => {
      setLoadingAddresses(true);
      try {
        const res = await getAddress({ customer: customer.id });
        setAddresses(res.results || res.data || []);
      } catch (err) {
        console.error("Failed to load addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }
    })();
  }, [customer]);

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>

      {loadingAddresses ? (
        <Stack alignItems="center" justifyContent="center" py={4}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {addresses.map((addr) => (
            <Paper
              key={addr.id}
              onClick={() => !disableChange && onAddressChange(addr)}
              sx={{
                p: 2,
                width: { xs: "100%", md: "calc(50% - 8px)" },
                position: "relative",
                cursor: disableChange ? "not-allowed" : "pointer",
                borderRadius: 2,
                border: address?.id === addr.id ? "2px solid #1976d2" : "1px solid #ccc",
                boxShadow: address?.id === addr.id ? 3 : 0,
                transition: "0.2s",
                "&:hover": {
                  boxShadow: 2,
                  borderColor: "#1976d2",
                },
              }}
            >
              {/* ✏️ Edit button */}
              <IconButton
                size="small"
                sx={{ position: "absolute", top: 8, right: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingAddress(addr);
                  setAddressModalOpen(true);
                }}
              >
                <PencilSimple size={16} />
              </IconButton>

              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {addr.line1}
              </Typography>
              {addr.line2 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {addr.line2}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {addr.city}, {addr.state} - {addr.pincode}
              </Typography>
              {addr.is_default && (
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, color: "success.main", display: "block" }}
                >
                  ✅ Default Address
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      {/* ➕ Add new address */}
      {!disableChange && (
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => {
            setEditingAddress(null);
            setAddressModalOpen(true);
          }}
        >
          + Add New Address
        </Button>
      )}

      {/* 🪟 Address Modal */}
      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        customer={customer}
        address={editingAddress}
        onSaved={(newAddr) => {
          setAddresses((prev) => {
            const idx = prev.findIndex((a) => a.id === newAddr.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = newAddr;
              return updated;
            }
            return [newAddr, ...prev];
          });
          onAddressChange(newAddr);
          setAddressModalOpen(false);
        }}
      />
    </Box>
  );
}
