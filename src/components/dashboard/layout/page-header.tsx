"use client";

import * as React from "react";
import { Box, Typography, TextField, IconButton, Button, Stack, OutlinedInput, InputAdornment, Badge } from "@mui/material";
import { FunnelSimpleIcon, PlusIcon, UploadIcon, DownloadIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";


interface PageHeaderProps {
    title: string;
    searchValue: string;
    onSearchChange: (val: string) => void;
    onAdd: () => void;
    onFilter: () => void;
    activeFiltersCount: number;
}

export function PageHeader({ title, searchValue, onSearchChange, onAdd, onFilter,activeFiltersCount }: PageHeaderProps) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Stack spacing={1} flex="1 1 auto">
                <Typography variant="h4">{title}</Typography>
                {/* <Stack direction="row" spacing={1} alignItems="center">
                    <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
                        Import
                    </Button>
                    <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
                        Export
                    </Button>
                </Stack> */}
            </Stack>
            <Box display="flex" alignItems="center" gap={1}>
                <OutlinedInput
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    fullWidth
                    placeholder="Search..."
                    startAdornment={
                        <InputAdornment position="start">
                            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
                        </InputAdornment>
                    }
                    sx={{ maxWidth: '500px' }}
                />
                <Badge
                    badgeContent={activeFiltersCount} // number of active filters
                    color="secondary"
                    overlap="circular"
                >
                    <IconButton onClick={onFilter} color="primary">
                        <FunnelSimpleIcon size={20} weight="bold" />
                    </IconButton>
                </Badge>
                <Button variant="contained" startIcon={<PlusIcon size={20} weight="bold" />} onClick={onAdd}>
                    Add
                </Button>
            </Box>
        </Box>
    );
}
