import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

const defaultPanelSx = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function CategoryModal({ open, onClose, onCategoryCreated, panelSx, modalProps }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3003/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.response.status === 'success') {
        onCategoryCreated(data.response.data);
        onClose();
      } else {
        console.error('Failed to create category:', data.response.message);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} {...modalProps}>
      <Box
        sx={{
          ...defaultPanelSx,
          ...panelSx,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Add New Category
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Category Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Create Category'}
          </Button>
        </form>
      </Box>
    </Modal>
  );
}