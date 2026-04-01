import React, { useState, useEffect, useCallback } from 'react';
import {
	Drawer,
	Box,
	Typography,
	TextField,
	Button,
	IconButton,
	CircularProgress,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CloseIcon from '@mui/icons-material/Close';
import CategoryListModal from './CategoryListModal';
import debounce from 'lodash/debounce'; // Import debounce from lodash

const ProductDrawer = ({ open, onClose, onSubmit, loading }) => {
	const [form, setForm] = useState({
		name: '',
		description: '',
		sku: '',
		quantity: '',
		unit: '',
		low_stock_level: '',
		status: 'active',
		category_id: '',
		initialPrice: '',
	});

	const [categories, setCategories] = useState([]);
	const [selectedCategoryName, setSelectedCategoryName] = useState('');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingCategories, setLoadingCategories] = useState(false);
	const [isCategoryListModalOpen, setCategoryListModalOpen] = useState(false);

	const fetchCategories = useCallback(
		async () => {
			if (loadingCategories) return; // Prevent multiple simultaneous fetches

			setLoadingCategories(true);
			try {
				const response = await fetch(
					`http://localhost:3003/categories?page=${page}&limit=20&search=${search}`
				);
				const data = await response.json();

				if (data.response.status === 'success') {
					setCategories((prev) => (page === 1 ? data.response.data : [...prev, ...data.response.data]));
					setHasMore(data.response.data.length === 20); // Check if more data is available
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
			} finally {
				setLoadingCategories(false);
			}
		},
		[loadingCategories, page, search]
	);

	const debouncedFetchCategories = useCallback(debounce(fetchCategories, 300), [fetchCategories]);

	useEffect(() => {
		fetchCategories();
	}, [page, search, fetchCategories]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleCategoryChange = (event, newValue) => {
		setForm((prev) => ({ ...prev, category_id: newValue ? newValue.id : '' }));
	};

	const handleCategoryCreated = (newCategory) => {
		setCategories((prev) => [newCategory, ...prev]); // Add new category to the top of the list
		setForm((prev) => ({ ...prev, category_id: newCategory.id }));
		setSelectedCategoryName(newCategory.name || '');
		setSearch(''); // Reset search to include all categories
		setPage(1); // Reset page to fetch updated list
		setHasMore(true); // Allow fetching more categories
	};

	const handleCategorySelected = (category) => {
		setCategories((prev) => {
			const exists = prev.some((item) => item.id === category.id);
			return exists ? prev : [category, ...prev];
		});
		setForm((prev) => ({ ...prev, category_id: category.id }));
		setSelectedCategoryName(category.name || '');
	};

	const handleDropdownOpen = () => {
		if (categories.length === 0) {
			setSearch('');
			setPage(1);
			setCategories([]);
			setHasMore(true);
			fetchCategories();
		}
	};

	const handleInputChange = (event, value) => {
		setSearch(value);
		setPage(1);
		setCategories([]);
		setHasMore(true);
		debouncedFetchCategories(); // Use debounced fetchCategories to handle input changes
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(form); // Call the onSubmit prop with the form data
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
						fullWidth
						sx={{ mb: 2 }}
					/>
					<TextField
						label="Category"
						value={selectedCategoryName || categories.find((cat) => cat.id === form.category_id)?.name || ''}
						InputProps={{ readOnly: true }}
						fullWidth
						sx={{ mb: 2 }}
					/>
					<Button
						variant="outlined"
						color="primary"
						sx={{ textTransform: 'none', borderColor: 'primary.main', color: 'primary.main', mb: 2 }}
						onClick={() => setCategoryListModalOpen(true)}
					>
						Select Category
					</Button>
					<TextField
						label="Initial Price"
						name="initialPrice"
						value={form.initialPrice}
						onChange={handleChange}
						fullWidth
						sx={{ mb: 2 }}
					/>
					<Button
						variant="contained"
						type="submit"
						fullWidth
						sx={{ textTransform: 'none', mt: 'auto' }}
						disabled={loading}
					>
						{loading ? <CircularProgress size={24} /> : 'Create Product'}
					</Button>
				</form>
			</Box>
			<CategoryListModal
				open={isCategoryListModalOpen}
				onClose={() => setCategoryListModalOpen(false)}
				onSelectCategory={handleCategorySelected}
				onCategoryCreated={handleCategoryCreated}
			/>
		</Drawer>
	);
};

export default ProductDrawer;
