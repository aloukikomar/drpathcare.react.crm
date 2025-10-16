"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Stack, CircularProgress, Alert, Box, Typography, Button } from "@mui/material";
import { TrayIcon } from "@phosphor-icons/react/dist/ssr/Tray";

import { PageHeader } from "../layout/page-header";
import { DataTable } from "../layout/data-table";

import { getCustomersColumns } from "./customers-columns";
import { CustomerEntityModal } from "./customer-entity-modal";
import { CustomerApi } from "@/api/customers";

type EntityType = "customer" | "patient" | "address";

interface CustomersWrapperProps {
    entityType: EntityType;
    title: string;
}

export function CustomersWrapper({ entityType, title }: CustomersWrapperProps) {
    // --- State ---
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

    // --- Columns ---
    const columns = useMemo(() => getCustomersColumns(entityType), [entityType]);

    // --- Fetch Function ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await CustomerApi.get[entityType]({
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
    }, [entityType, page, rowsPerPage, search, sortBy, sortDir, filters]);

    // --- Load data on deps change ---
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Modal Actions ---
    const handleAdd = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const handleEdit = (row: any) => {
        setEditing(row);
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            // {console.log(data,"why")}
            // if (editing) {
            //     await CustomerApi.update[entityType](editing.id, data);
            // } else {
            //     await CustomerApi.create[entityType](data);
            // }
            setModalOpen(false);
            setEditing(null);
            fetchData();
        } catch (err: any) {
            console.error("Save failed", err);
        }
    };

    // --- Empty State Component ---
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
                onFilter={() => { }}
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
                    page={page - 1} // MUI DataTable is 0-indexed
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
            <CustomerEntityModal
                entityType={entityType}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editing || undefined}
            />
        </Stack>
    );
}
