"use client";

import { useEffect, useState, useMemo } from "react";
import { Stack, CircularProgress, Alert, Box, Typography, Button } from "@mui/material";
import { TrayIcon} from "@phosphor-icons/react/dist/ssr/Tray";

import { PageHeader } from "../layout/page-header";
import { DataTable } from "../layout/data-table";

import { LabProductFilters } from "./lab-product-filters";
import { LabProductModal } from "./lab-product-modal";
import { getLabProductColumns } from "./lab-product-columns";

import { LabApi } from "@/api/labproducts";

type EntityType = "test" | "package" | "profile" | "category";

interface LabProductsWrapperProps {
  entityType: EntityType;
  title: string;
}

export function LabProductsWrapper({ entityType, title }: LabProductsWrapperProps) {
  // --- State ---
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1); // ✅ default page = 1
  const [rowsPerPage, setRowsPerPage] = useState(10); // ✅ default page_size = 10
  const [totalCount, setTotalCount] = useState(0);

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);

  // --- Columns ---
  const columns = useMemo(() => getLabProductColumns(entityType), [entityType]);

  // --- API Loader ---
  const fetchLabProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await LabApi.get[entityType]({
        page,
        page_size: rowsPerPage,
        search,
        ordering: sortBy ? `${sortDir === "desc" ? "-" : ""}${sortBy}` : undefined,
        ...filters,
      });

      setRows(response?.results || response?.data || []);
      setTotalCount(response?.count || response?.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabProducts();
  }, [entityType, page, rowsPerPage, sortBy, sortDir, search, filters]);

  // --- Modal Actions ---
  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editing) {
        await LabApi.update[entityType](editing.id, data);
      } else {
        await LabApi.create[entityType](data);
      }

      setModalOpen(false);
      setEditing(null);
      fetchLabProducts();
    } catch (err: any) {
      console.error("Save failed", err);
    }
  };

  // --- Empty State ---
  const EmptyState = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      sx={{ opacity: 0.6 }}
    >
      <TrayIcon size={64} weight="thin" style={{ marginBottom: 16 }} />
      <Typography variant="h6">No {title.toLowerCase()} found</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Try adjusting filters or add a new {entityType}.
      </Typography>
      <Button variant="contained" onClick={handleAdd}>
        Add {title}
      </Button>
    </Box>
  );

  return (
    <Stack spacing={3}>
      {/* Header */}
      <PageHeader
        title={title}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={handleAdd}
        onFilter={() => setFilterOpen(true)}
        activeFiltersCount={Object.values(filters).filter(Boolean).length}
      />

      {/* Data / States */}
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && rows.length === 0 && <EmptyState />}

      {!loading && !error && rows.length > 0 && (
        <DataTable
          columns={columns}
          data={rows}
          count={totalCount}
          page={page - 1} // MUI = 0-based
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(newSize) => {
            setRowsPerPage(newSize);
            setPage(1);
          }}
          onSort={(key, dir) => {
            setSortBy(String(key));
            setSortDir(dir);
          }}
          onEdit={handleEdit}
        />
      )}

      {/* Modal */}
      <LabProductModal
        entityType={entityType}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editing || undefined}
      />

      {/* Filters */}
      <LabProductFilters
        entityType={entityType}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        initialValues={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />
    </Stack>
  );
}
