import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getLabCategories } from "../../../api/labcategories";

interface LabTestFiltersProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: { category?: string }) => void;
  initialValues?: { category?: string };
  entityType:string;
}

export function LabTestFilters({
  open,
  onClose,
  onApply,
  initialValues,
  entityType,
}: LabTestFiltersProps) {
  const [category, setCategory] = useState(initialValues?.category || "");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  useEffect(() => {
    if (open) {
      getLabCategories(entityType).then(setCategories).catch(console.error);
    }
  }, [open]);

  const handleApply = () => {
    onApply({ category });
    onClose();
  };

  const handleReset = () => {
    setCategory("");
    onApply({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Filter Lab Tests</DialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="inherit">
          Reset
        </Button>
        <Button onClick={handleApply} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
