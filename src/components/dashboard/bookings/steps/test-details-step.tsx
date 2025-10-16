// src/components/dashboard/bookings/steps/test-details-step.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box, Button, Typography, Stack, Divider, Paper,
  Autocomplete, TextField, MenuItem, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody,
} from "@mui/material";
import { TrashIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { getPatient } from "@/api/customers";
import { getLabTests, getLabProfiles, getLabPackages } from "@/api/labproducts";
import PatientModal from "@/components/dashboard/customers/patient-modal";

type ItemType = "lab_test" | "lab_profile" | "lab_package";

interface ItemRow {
  id: number;
  patient: any;            // { id, first_name, last_name, ... }
  itemType: ItemType;      // one of the three
  item: any;               // { id, name, price, offer_price, ... }
  price: number;
  offer_price: number;
}

interface Props {
  customer: any;
  pricing: { base: number; discount: number; final: number };
  setPricing: (p: { base: number; discount: number; final: number }) => void;

  // NEW: flat list of rows shared with Review step
  testDetails: ItemRow[];
  setTestDetails: (rows: ItemRow[]) => void;

  onBack: () => void;
  onNext: () => void;
}

export function TestDetailsStep({
  customer,
  pricing,
  setPricing,
  testDetails,
  setTestDetails,
  onBack,
  onNext,
}: Props) {
  const [patientList, setPatientList] = useState<any[]>([]);
  const [openPatientModal, setOpenPatientModal] = useState(false);

  const [itemType, setItemType] = useState<ItemType>("lab_test");
  const [itemList, setItemList] = useState<any[]>([]);

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // local mirror for sorting UX; always keep it in sync with testDetails
  const [items, setItems] = useState<ItemRow[]>(testDetails || []);

  useEffect(() => {
    setItems(testDetails || []);
  }, [testDetails]);

  // fetch patients for that customer
  useEffect(() => {
    if (!customer?.id) return;
    (async () => {
      const res = await getPatient({ customer: customer.id, page_size: 1000 });
      const list = res.results || res.data || [];
      setPatientList(list);
      if (!selectedPatient && list.length > 0) {
        setSelectedPatient(list[0]); // default first
      }
    })();
  }, [customer]);

  // fetch items for current type
  useEffect(() => {
    (async () => {
      let res: any;
      if (itemType === "lab_test") res = await getLabTests({ page_size: 1000 });
      if (itemType === "lab_profile") res = await getLabProfiles({ page_size: 1000 });
      if (itemType === "lab_package") res = await getLabPackages({ page_size: 1000 });
      const list = res?.results || res?.data || [];
      setItemList(list);
      if (!selectedItem && list.length > 0) {
        setSelectedItem(list[0]); // default first
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemType]);

  const recalcPricing = (data: ItemRow[]) => {
    const base = data.reduce((sum, i) => sum + Number(i.price || 0), 0);
    const final = data.reduce((sum, i) => sum + Number(i.offer_price || 0), 0);
    const discount = base - final;
    setPricing({
      base: Number(base.toFixed(2)),
      final: Number(final.toFixed(2)),
      discount: Number(discount.toFixed(2)),
    });
  };

  const handleAddItem = () => {
    if (!selectedPatient || !itemType || !selectedItem) return;

    const newItem: ItemRow = {
      id: Date.now(),
      patient: selectedPatient,
      itemType,
      item: selectedItem,
      price: Number(selectedItem?.price || 0),
      offer_price: Number(
        selectedItem?.offer_price ?? selectedItem?.price ?? 0
      ),
    };

    const next = [...items, newItem];
    setItems(next);
    setTestDetails(next);     // <-- keep shared state updated
    recalcPricing(next);
  };

  const handleRemoveItem = (id: number) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    setTestDetails(next);     // <-- keep shared state updated
    recalcPricing(next);
  };

  // simple sort
  const [sortKey, setSortKey] = useState<keyof ItemRow | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const handleSort = (key: keyof ItemRow) => {
    const dir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(dir);
  };
  const sortedItems = [...items].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal: any = a[sortKey];
    let bVal: any = b[sortKey];
    if (sortKey === "patient") {
      aVal = `${a.patient.first_name} ${a.patient.last_name}`;
      bVal = `${b.patient.first_name} ${b.patient.last_name}`;
    }
    if (sortKey === "item") {
      aVal = a.item?.name ?? "";
      bVal = b.item?.name ?? "";
    }
    if (typeof aVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  return (
    <Box>
      <Typography variant="h6">Test Details</Typography>
      <Divider sx={{ my: 2 }} />

      {/* Add row */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Patient */}
          <Autocomplete
            sx={{ flex: 1 }}
            options={patientList}
            getOptionLabel={(p: any) => `${p.first_name} ${p.last_name} (${p.gender})`}
            value={selectedPatient}
            onChange={(_, val) => setSelectedPatient(val)}
            renderInput={(params) => <TextField {...params} label="Select Patient" />}
          />
          <Button variant="outlined" onClick={() => setOpenPatientModal(true)}>
            + Add Patient
          </Button>

          {/* Type */}
          <TextField select sx={{ width: 200 }} label="Item Type" value={itemType} onChange={(e) => setItemType(e.target.value as ItemType)}>
            <MenuItem value="lab_test">Lab Test</MenuItem>
            <MenuItem value="lab_profile">Lab Profile</MenuItem>
            <MenuItem value="lab_package">Lab Package</MenuItem>
          </TextField>

          {/* Item */}
          <Autocomplete
            sx={{ flex: 1 }}
            options={itemList}
            getOptionLabel={(i: any) => i?.name ?? ""}
            value={selectedItem}
            onChange={(_, val) => setSelectedItem(val)}
            renderInput={(params) => <TextField {...params} label="Select Item" />}
          />

          <Button
            variant="contained"
            startIcon={<PlusCircleIcon />}
            disabled={!selectedPatient || !itemType || !selectedItem}
            onClick={handleAddItem}
          >
            Add
          </Button>
        </Stack>
      </Paper>

      {/* Items table */}
      <Paper sx={{ mt: 3, maxHeight: 250, overflow: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {[
                { key: "patient", label: "Patient" },
                { key: "itemType", label: "Item Type" },
                { key: "item", label: "Item Name" },
                { key: "price", label: "Price" },
                { key: "offer_price", label: "Offer Price" },
              ].map((col) => (
                <TableCell
                  key={col.key}
                  onClick={() => handleSort(col.key as keyof ItemRow)}
                  sx={{ cursor: "pointer", fontWeight: "bold", userSelect: "none" }}
                >
                  {col.label}
                  {sortKey === col.key && (sortDir === "asc" ? " 🔼" : " 🔽")}
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedItems.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.patient.first_name} {r.patient.last_name}</TableCell>
                <TableCell>{r.itemType}</TableCell>
                <TableCell>{r.item?.name}</TableCell>
                <TableCell>₹{r.price}</TableCell>
                <TableCell>₹{r.offer_price}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleRemoveItem(r.id)}>
                    <TrashIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {sortedItems.length === 0 && (
              <TableRow><TableCell colSpan={6}>No items added</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Pricing */}
      <Box mt={3} textAlign="right">
        <Typography>Base Total: ₹{pricing?.base ?? 0}</Typography>
        <Typography>Discount: ₹{pricing?.discount ?? 0}</Typography>
        <Typography variant="h6">Final: ₹{pricing?.final ?? 0}</Typography>
      </Box>

      {/* Navigation */}
      <Box mt={3}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={onNext} sx={{ ml: 2 }}>
          Continue
        </Button>
      </Box>

      {/* Patient Modal */}
      <PatientModal
        open={openPatientModal}
        onClose={() => setOpenPatientModal(false)}
        onSaved={() => {
          setOpenPatientModal(false);
          getPatient({ customer: customer.id, page_size: 1000 }).then((res) =>
            setPatientList(res.results || res.data || [])
          );
        }}
        customer={customer}
      />
    </Box>
  );
}
