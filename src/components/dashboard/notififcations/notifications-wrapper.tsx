// src/components/dashboard/notifications/notifications-wrapper.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Stack,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { PlusIcon } from "@phosphor-icons/react";

import { PageHeader } from "@/components/dashboard/layout/page-header";
import { DataTable } from "@/components/dashboard/layout/data-table";

import { getNotifications, getSMSTemplates } from "@/api/notifications"; // make sure these exist

export interface WrapperProps {
  entityType: "notification" | "sms_template";
  title: string;
}

export function NotificationsWrapper({
  entityType,
  title,
}: WrapperProps): React.JSX.Element {
  // state
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  // Columns depend on entity type
  const columns = useMemo(() => {
    if (entityType === "sms_template") {
      return [
        { key: "id", label: "ID", sortable: true },
        { key: "name", label: "Name", sortable: true },
        { key: "message", label: "Message", sortable: false },
        { key: "sender_name", label: "Sender", sortable: true },
        { key: "sms_type", label: "SMS Type", sortable: true },
        { key: "peid", label: "PE ID", sortable: true },
        { key: "template_id", label: "Template ID", sortable: true },
        { key: "is_active", label: "Active", sortable: true },
      ];
    }

    // Default = notification
    return [
      { key: "id", label: "ID", sortable: true },
      { key: "recipient_mobile", label: "Recipient Number", sortable: true },
      { key: "recipient_email", label: "Recipient Email", sortable: true },
      { key: "notification_type", label: "Type", sortable: true },
      { key: "subject", label: "Subject", sortable: true },
      { key: "message_short", label: "Message", sortable: false },
      { key: "status", label: "Status", sortable: true },
      { key: "created_at", label: "Created At", sortable: true },
    ];
  }, [entityType]);

  // helper: shorten message
  function short(msg?: string, len = 120) {
    if (!msg) return "";
    return msg.length > len ? msg.slice(0, len) + "…" : msg;
  }

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        page_size: rowsPerPage,
      };
      if (search) params.search = search;
      if (sortBy) params.ordering = `${sortDir === "desc" ? "-" : ""}${sortBy}`;
      Object.assign(params, filters);

      let res;
      if (entityType === "sms_template") {
        res = await getSMSTemplates(params);
      } else {
        res = await getNotifications(params);
      }

      const raw = res.results || [];
      let mapped = raw;

      if (entityType === "notification") {
        mapped = raw.map((r: any) => ({
          ...r,
          recipient_name: r.recipient
            ? `${r.recipient.first_name || ""} ${r.recipient.last_name || ""}`.trim()
            : "",
          recipient_str: r.recipient
            ? `${r.recipient.first_name || ""} ${r.recipient.last_name || ""} | ${r.recipient.mobile || ""}`.trim()
            : "",
          message_short: short(r.message),
        }));
      }

      setRows(mapped);
      setTotalCount(res.count ?? mapped.length);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || err?.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, sortBy, sortDir, filters, entityType]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setPage(1);
    fetchData();
  };

  const EmptyState = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      sx={{ opacity: 0.7 }}
    >
      <Typography variant="h6">No {title.toLowerCase()}s found</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Create a new {title.toLowerCase()} or adjust filters.
      </Typography>
      <Button
        variant="contained"
        startIcon={<PlusIcon size={16} />}
        onClick={handleAdd}
      >
        Create {title}
      </Button>
    </Box>
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title={title}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={handleAdd}
        onFilter={() => {}}
        activeFiltersCount={Object.values(filters).filter(Boolean).length}
      />

      {loading && (
        <Stack alignItems="center">
          <CircularProgress />
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && rows.length === 0 && <EmptyState />}

      {!loading && !error && rows.length > 0 && (
        <DataTable
          columns={columns}
          data={rows}
          count={totalCount}
          page={page - 1}
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage: number) => setPage(newPage + 1)}
          onRowsPerPageChange={(newSize: number) => {
            setRowsPerPage(newSize);
            setPage(1);
          }}
          onSort={(key, dir) => {
                        setSortBy(String(key));
                        setSortDir(dir);
                    }}
          //onEdit={handleEdit}
        />
      )}

      {/* TODO: plug in modals for notification + sms_template */}
    </Stack>
  );
}
