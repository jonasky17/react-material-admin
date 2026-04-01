import { useState, useEffect, useCallback } from 'react';
import {
	Drawer,
	Box,
	Typography,
	TextField,
	Button,
	IconButton,
	CircularProgress,
	MenuItem,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CloseIcon from '@mui/icons-material/Close';
import CategoryListModal from './CategoryListModal';

const toOptionsList = (payload) => {
	const data = payload?.response?.data;
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.rows)) return data.rows;
	if (Array.isArray(data?.items)) return data.items;
	return [];
};

const initialFormState = {
	name: '',
	description: '',
	sku: '',
	quantity: '',
	unit: '',
	low_stock_level: '',
	status: 'active',
	category_id: '',
	initialPrice: '',
	received_at: '',
	locationId: '',
	movementDefinitionId: '',
	sourceLocationId: '',
	destinationLocationId: '',
	remarks: '',
};

const ProductDrawer = ({ open, onClose, onSubmit, loading }) => {
	const [form, setForm] = useState(initialFormState);

	const [categories, setCategories] = useState([]);
	const [locations, setLocations] = useState([]);
	const [movementDefinitions, setMovementDefinitions] = useState([]);
	const [selectedCategoryName, setSelectedCategoryName] = useState('');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [loadingCategories, setLoadingCategories] = useState(false);
	const [loadingLookups, setLoadingLookups] = useState(false);
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
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
			} finally {
				setLoadingCategories(false);
			}
		},
		[loadingCategories, page, search]
	);

	useEffect(() => {
		fetchCategories();
	}, [page, search, fetchCategories]);

	useEffect(() => {
		if (!open) {
			setForm(initialFormState);
			setSelectedCategoryName('');
			return;
		}

		const fetchLookups = async () => {
			setLoadingLookups(true);
			try {
				const [locationsResponse, movementDefinitionsResponse] = await Promise.all([
					fetch('http://localhost:3003/locations?page=1&limit=20'),
					fetch('http://localhost:3003/movement-definitions?page=1&limit=20'),
				]);

				const [locationsData, movementDefinitionsData] = await Promise.all([
					locationsResponse.json(),
					movementDefinitionsResponse.json(),
				]);

				setLocations(toOptionsList(locationsData));
				setMovementDefinitions(toOptionsList(movementDefinitionsData));
			} catch (lookupError) {
				console.error('Error fetching product form lookups:', lookupError);
			} finally {
				setLoadingLookups(false);
			}
		};

		fetchLookups();
	}, [open]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleCategoryCreated = (newCategory) => {
		setCategories((prev) => [newCategory, ...prev]); // Add new category to the top of the list
		setForm((prev) => ({ ...prev, category_id: newCategory.id }));
		setSelectedCategoryName(newCategory.name || '');
		setSearch(''); // Reset search to include all categories
		setPage(1); // Reset page to fetch updated list
	};

	const handleCategorySelected = (category) => {
		setCategories((prev) => {
			const exists = prev.some((item) => item.id === category.id);
			return exists ? prev : [category, ...prev];
		});
		setForm((prev) => ({ ...prev, category_id: category.id }));
		setSelectedCategoryName(category.name || '');
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(form); // Call the onSubmit prop with the form data
	};

	const quantityValue = Number(form.quantity);
	const showMovementFields = form.quantity !== '' && !Number.isNaN(quantityValue) && quantityValue !== 0;
	const movementDefinitionError = showMovementFields && !form.movementDefinitionId;
	const movementSuggestions = movementDefinitions
		.map((item) => item.name)
		.filter(Boolean);
	const locationSuggestions = locations
		.map((item) => item.name)
		.filter(Boolean);

	return (
		<Drawer anchor="right" open={open} onClose={onClose}>
			<Box sx={{ width: 440, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
					<Typography variant="h6" sx={{ flex: 1 }}>
						New Product
					</Typography>
					<IconButton onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</Box>
			<form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
				<Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
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
						inputProps={{ min: 0, step: 'any' }}
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
						inputProps={{ min: 0, step: 'any' }}
						fullWidth
						sx={{ mb: 2 }}
					/>
					<TextField
						select
						label="Status"
						name="status"
						value={form.status}
						onChange={handleChange}
						fullWidth
						sx={{ mb: 2 }}
					>
						<MenuItem value="active">Active</MenuItem>
						<MenuItem value="inactive">Inactive</MenuItem>
					</TextField>
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
						fullWidth
						sx={{ textTransform: 'none', mb: 2 }}
						onClick={() => setCategoryListModalOpen(true)}
					>
						Select Category
					</Button>
					<TextField
						label="Initial Price"
						name="initialPrice"
						value={form.initialPrice}
						onChange={handleChange}
						type="number"
						inputProps={{ min: 0, step: 'any' }}
						fullWidth
						sx={{ mb: 2 }}
					/>
					{showMovementFields ? (
						<>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>
								Initial Stock Movement
							</Typography>
							<Autocomplete
								freeSolo
								options={movementSuggestions}
								value={form.movementDefinitionId || ''}
								onInputChange={(_, val) => {
									setForm((prev) => ({ ...prev, movementDefinitionId: val || '' }));
								}}
								onChange={(_, val) => {
									setForm((prev) => ({
										...prev,
										movementDefinitionId: val || '',
									}));
								}}
								disabled={loadingLookups}
								sx={{ mb: 2 }}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Movement Type"
										error={movementDefinitionError}
										helperText={movementDefinitionError ? 'Required when quantity is not 0' : 'Start typing to see suggestions'}
									/>
								)}
							/>
							<Autocomplete
								freeSolo
								options={locationSuggestions}
								value={form.locationId || ''}
								onInputChange={(_, val) => {
									setForm((prev) => ({ ...prev, locationId: val || '' }));
								}}
								onChange={(_, val) => {
									setForm((prev) => ({
										...prev,
										locationId: val || '',
									}));
								}}
								disabled={loadingLookups}
								sx={{ mb: 2 }}
								renderInput={(params) => (
									<TextField {...params} label="Location" />
								)}
							/>
							<Autocomplete
								freeSolo
								options={locationSuggestions}
								value={form.sourceLocationId || ''}
								onInputChange={(_, val) => {
									setForm((prev) => ({ ...prev, sourceLocationId: val || '' }));
								}}
								onChange={(_, val) => {
									setForm((prev) => ({
										...prev,
										sourceLocationId: val || '',
									}));
								}}
								disabled={loadingLookups}
								sx={{ mb: 2 }}
								renderInput={(params) => (
									<TextField {...params} label="Source" />
								)}
							/>
							<Autocomplete
								freeSolo
								options={locationSuggestions}
								value={form.destinationLocationId || ''}
								onInputChange={(_, val) => {
									setForm((prev) => ({ ...prev, destinationLocationId: val || '' }));
								}}
								onChange={(_, val) => {
									setForm((prev) => ({
										...prev,
										destinationLocationId: val || '',
									}));
								}}
								disabled={loadingLookups}
								sx={{ mb: 2 }}
								renderInput={(params) => (
									<TextField {...params} label="Destination" />
								)}
							/>
							<TextField
							label="Date Received"
								name="received_at"
								value={form.received_at}
								onChange={handleChange}
								type="datetime-local"
								InputLabelProps={{ shrink: true }}
								fullWidth
								sx={{ mb: 2 }}
							/>
							<TextField
								label="Remarks"
								name="remarks"
								value={form.remarks}
								onChange={handleChange}
								fullWidth
								multiline
								rows={3}
								sx={{ mb: 2 }}
							/>
						</>
					) : null}
				</Box>
				<Button
					variant="contained"
					type="submit"
					fullWidth
					sx={{ textTransform: 'none', mt: 2, flexShrink: 0 }}
					disabled={loading || loadingLookups}
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
