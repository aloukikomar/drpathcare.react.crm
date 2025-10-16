"use client";

import * as React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Box,
} from "@mui/material";
import { PencilSimple } from "@phosphor-icons/react";

interface DataTableProps<T> {
  columns: { key: keyof T; label: string; sortable?: boolean }[];
  data: T[];
  count: number;
  page: number;
  rowsPerPage: number;
  onEdit?: (row: T) => void;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSort?: (key: keyof T, direction: "asc" | "desc") => void;
}

export function DataTable<T>({
  columns,
  data,
  count,
  page,
  rowsPerPage,
  onEdit,
  onPageChange,
  onRowsPerPageChange,
  onSort,
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = React.useState<keyof T | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const handleSort = (key: keyof T) => {
    const dir = sortBy === key && sortDir === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortDir(dir);
    onSort?.(key, dir);
  };

  return (
    <Paper>
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key as string}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortDir : "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              {onEdit && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => {
                  const value = String(row[col.key] ?? "");
                  const isLong = value.length > 50; // threshold for "large field"

                  return (
                    <TableCell
                      key={col.key as string}
                      sx={{
                        maxWidth: 250,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {isLong ? (
                        <Tooltip title={value} placement="top-start" arrow>
                          <Box
                            sx={{
                              maxHeight: 100,
                              overflowY: "auto",
                              pr: 1,
                            }}
                          >
                            {value}
                          </Box>
                        </Tooltip>
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
                {onEdit && (
                  <TableCell>
                    <IconButton onClick={() => onEdit(row)}>
                      <PencilSimple size={18} />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(e, newPage) => onPageChange?.(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange?.(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}
