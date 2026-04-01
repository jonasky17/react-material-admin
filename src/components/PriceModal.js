import { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

const panelSx = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 420,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

export default function PriceModal({
  open,
  onClose,
  onSubmit,
  loading,
  title = 'Update Price',
  actionLabel = 'Save',
  initialValues,
}) {
  const [form, setForm] = useState({
    price: '',
    effective_date: '',
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      price: initialValues?.price ?? '',
      effective_date: initialValues?.effective_date ?? '',
    });
  }, [open, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const didSave = await onSubmit(form);

    if (didSave) {
      setForm({ price: '', effective_date: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setForm({ price: '', effective_date: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={panelSx}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {title}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label='Date'
            name='effective_date'
            value={form.effective_date}
            onChange={handleChange}
            type='date'
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            sx={(theme) => ({
              mb: 2,
              '& input[type="date"]': {
                pr: 1.5,
              },
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                opacity: 1,
                cursor: 'pointer',
                transform: 'scale(1.25)',
                filter:
                  theme.palette.mode === 'dark'
                    ? 'invert(1) brightness(1.5) contrast(1.35)'
                    : 'contrast(1.35) brightness(0.85)',
              },
            })}
          />

          <TextField
            label='Price'
            name='price'
            value={form.price}
            onChange={handleChange}
            type='number'
            inputProps={{ min: 0, step: 'any' }}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant='outlined' onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type='submit' variant='contained' disabled={loading}>
              {loading ? <CircularProgress size={20} /> : actionLabel}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
