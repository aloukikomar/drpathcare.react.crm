"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Divider,
  Autocomplete,
  TextField,
  CircularProgress,
  Paper,
  Avatar,
} from "@mui/material";
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr/Phone";

import { getCustomers, getAddress } from "@/api/customers";
import CustomerModal from "@/components/dashboard/customers/customers-modal";
import AddressModal from "@/components/dashboard/customers/address-modal";
import { CustomerSection } from "../../customers/customer-section";
import { AddressSection } from "../../customers/address-section";

interface Props {
  customer: any;
  setCustomer: (c: any) => void;
  address: any;
  setAddress: (a: any) => void;
  onNext: () => void;
}

export function CustomerDetailsStep({ customer, setCustomer, address, setAddress, onNext }: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // 📥 Load customers on mount
  useEffect(() => {
    async function fetchCustomers() {
      setLoadingCustomers(true);
      try {
        const res = await getCustomers();
        setCustomers(res.results || res.data || []);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setLoadingCustomers(false);
      }
    }
    fetchCustomers();
  }, []);

  // 📥 Load addresses whenever a customer is selected
  useEffect(() => {
    if (!customer?.id) return;
    async function fetchAddresses() {
      setLoadingAddresses(true);
      try {
        const res = await getAddress({ customer: customer.id });
        setAddresses(res.results || res.data || []);
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, [customer]);

  return (
    <Box>
      <Typography variant="h6">Customer Details</Typography>
      <Divider sx={{ my: 2 }} />

      <Stack spacing={4}>
        {/* 🔎 Customer selection */}
        <Box>
          <CustomerSection
            // title="Customer"
            customer={customer}
            onCustomerChange={(c) => {
              setCustomer(c);
              setAddress(null); // reset address when customer changes
            }}
            disableChange={false} // ✅ set to true if you don't want the customer changed
          />
        </Box>

        {/* 🏠 Address selection (only if customer selected) */}
        {customer && (
          <Box>

            {/* 🏠 Address Selection / Edit */}
        <AddressSection
          customer={customer}
          address={address}
          onAddressChange={setAddress}
          disableChange={false} // 👈 true = lock selection (view/edit only)
          title="Address"
        />

            {/* <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Address
            </Typography>

            {loadingAddresses ? (
              <CircularProgress />
            ) : (
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {addresses.map((addr) => (
                  <Paper
                    key={addr.id}
                    onClick={() => setAddress(addr)}
                    sx={{
                      p: 2,
                      width: "calc(50% - 8px)",
                      cursor: "pointer",
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

            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setAddressModalOpen(true)}>
              + Add New Address
            </Button> */}
          </Box>
        )}
      </Stack>

      <Box mt={4}>
        <Button variant="contained" onClick={onNext} disabled={!customer || !address}>
          Continue
        </Button>
      </Box>


    </Box>
  );
}
