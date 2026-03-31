import React, { useState } from 'react';
import {
	Drawer,
	Box,
	Typography,
	TextField,
	Button,
	IconButton,
	MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function ProductDrawer({ open, onClose, onSubmit, loading }) {
 const [form, setForm] = useState({
  name: '',
  description: '',
  sku: '',
  quantity: '',
  unit: '',
  low_stock_level: '',
  status: 'active', // keep in state for submission, but not shown in form
  category_id: '',
  initialPrice: '',
 });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(form);
	};

	return (
		<Drawer anchor="right" open={open} onClose={onClose}>
			<Box sx={{ width: 400, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
					<Typography variant="h6" sx={{ flex: 1 }}>
						New Product
					</Typography>
					<IconButton onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</Box>
				<form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
					<TextField
						label={<span>Name <span style={{ color: 'red' }}>*</span></span>}
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
						sx={{ mb: 2 }}
					/>
					<TextField
						label="SKU"
						name="sku"
						value={form.sku}
						onChange={handleChange}
						fullWidth
						sx={{ mb: 2 }}
					/>
					<TextField
						label="Quantity"
						name="quantity"
						value={form.quantity}
						onChange={handleChange}
						type="number"
						fullWidth
						sx={{ mb: 2 }}
					/>
					<TextField
						label="Unit"
						name="unit"
						value={form.unit}
						onChange={handleChange}
						fullWidth
						sx={{ mb: 2 }}
					/>
					<TextField
						label="Low Stock Level"
						name="low_stock_level"
						value={form.low_stock_level}
						onChange={handleChange}
						type="number"
						fullWidth
						sx={{ mb: 2 }}
					/>
					<TextField
						label="Category ID"
						name="category_id"
						value={form.category_id}
						onChange={handleChange}
						type="number"
						fullWidth
						sx={{ mb: 2 }}
					/>
					<TextField
						label="Initial Price"
						name="initialPrice"
						value={form.initialPrice}
						onChange={handleChange}
						type="number"
						fullWidth
						sx={{ mb: 2 }}
					/>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						sx={{ color: '#fff', fontWeight: 600, mt: 2 }}
						disabled={loading}
					>
						{loading ? 'Saving...' : 'Create Product'}
					</Button>
				</form>
			</Box>
		</Drawer>
	);
}
