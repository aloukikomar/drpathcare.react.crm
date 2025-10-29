"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Tooltip,
} from "@mui/material";
import { DownloadSimple, X } from "@phosphor-icons/react";
import dayjs from "dayjs";
import { getBookingDocuments } from "@/api/bookings";

interface BookingDocumentsDrawerProps {
  open: boolean;
  onClose: () => void;
  bookingId: string | null;
}

interface BookingDocument {
  id: string;
  name: string;
  description: string;
  file_url: string;
  doc_type: string;
  uploaded_by_name: string;
  created_at: string;
}

export default function BookingDocumentsDrawer({
  open,
  onClose,
  bookingId,
}: BookingDocumentsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<BookingDocument[]>([]);

  useEffect(() => {
    if (!open || !bookingId) return;

    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const data = await getBookingDocuments(bookingId);
        setDocuments(data.results || []);
      } catch (err) {
        console.error("Failed to load booking documents", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [open, bookingId]);

  const handleDownload = (url: string) => {
    if (url) window.open(url, "_blank");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Booking Documents
        </Typography>
        <IconButton onClick={onClose}>
          <X size={20} />
        </IconButton>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Loading State */}
      {loading && (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
          <CircularProgress />
        </Stack>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, textAlign: "center" }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            No documents found.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload receipts, lab reports, or other related files.
          </Typography>
        </Stack>
      )}

      {/* Documents List */}
      {!loading && documents.length > 0 && (
        <Stack spacing={2} sx={{ overflowY: "auto", pr: 1, pb: 2 }}>
          {documents.map((doc) => (
            <Box
              key={doc.id}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                backgroundColor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {doc.name}
                </Typography>
                <Chip
                  label={doc.doc_type?.replace(/_/g, " ").toUpperCase() || "OTHER"}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              {doc.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {doc.description}
                </Typography>
              )}

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Uploaded by {doc.uploaded_by_name || "Unknown"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • {dayjs(doc.created_at).format("DD MMM YYYY, hh:mm A")}
                </Typography>
              </Stack>

              <Box sx={{ mt: 1.5 }}>
                <Tooltip title="Download Document">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadSimple size={16} />}
                    onClick={() => handleDownload(doc.file_url)}
                  >
                    Download
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
