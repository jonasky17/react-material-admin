import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Typography,
} from '@mui/material';

const EMPTY_FORM = {
  entry_date: '',
  sales: '',
  expenses: '',
  cash_on_hand: '',
  accounts_receivable: '',
  inventory_value: '',
  notes: '',
};

export default function DashboardSnapshotModal({
  open,
  onClose,
  onSubmit,
  loading,
  initialValues,
  title = 'Log Financial Entry',
  actionLabel = 'Save',
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...EMPTY_FORM, ...initialValues } : EMPTY_FORM);
    }
  }, [open, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const success = await onSubmit(form);
    if (success) onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={12}>
            <TextField
              label='Entry Date'
              name='entry_date'
              type='date'
              value={form.entry_date}
              onChange={handleChange}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label='Sales'
              name='sales'
              type='number'
              value={form.sales}
              onChange={handleChange}
              fullWidth
              size='small'
              inputProps={{ min: 0, step: '0.01' }}
              helperText='Total revenue collected'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label='Expenses'
              name='expenses'
              type='number'
              value={form.expenses}
              onChange={handleChange}
              fullWidth
              size='small'
              inputProps={{ min: 0, step: '0.01' }}
              helperText='Feeds, supplies, labor, etc.'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label='Cash on Hand'
              name='cash_on_hand'
              type='number'
              value={form.cash_on_hand}
              onChange={handleChange}
              fullWidth
              size='small'
              inputProps={{ min: 0, step: '0.01' }}
              helperText='Available cash as of entry date'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label='Accounts Receivable'
              name='accounts_receivable'
              type='number'
              value={form.accounts_receivable}
              onChange={handleChange}
              fullWidth
              size='small'
              inputProps={{ min: 0, step: '0.01' }}
              helperText='Money owed to the business'
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label='Inventory Value'
              name='inventory_value'
              type='number'
              value={form.inventory_value}
              onChange={handleChange}
              fullWidth
              size='small'
              inputProps={{ min: 0, step: '0.01' }}
              helperText='Current value of feeds, stocks and supplies on hand'
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label='Notes'
              name='notes'
              value={form.notes}
              onChange={handleChange}
              fullWidth
              size='small'
              multiline
              rows={3}
              placeholder='Optional remarks for this entry...'
            />
          </Grid>
        </Grid>

        {loading && (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={14} /> Saving...
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={loading}>
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
