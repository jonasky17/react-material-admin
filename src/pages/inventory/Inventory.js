import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getActiveProfileId } from '../../utils/profile';
import ProductDrawer from 'components/ProductDrawer';

export default function Inventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const pesoFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  const getStockStatusMeta = (quantity, lowStockLevel) => {
    const qty = Number(quantity);
    const low = Number(lowStockLevel);

    if (Number.isNaN(qty)) {
      return { label: '-', color: 'default' };
    }
    if (qty === 0) {
      return { label: 'No stock remaining', color: 'error' };
    }
    if (!Number.isNaN(low) && qty <= low) {
      return { label: 'Low stock', color: 'warning' };
    }
    return { label: 'In stock', color: 'success' };
  };

  const handleCreateProduct = async (form) => {
    const profileId = getActiveProfileId();
    if (!profileId) {
      setError('No profile selected');
      return;
    }

    const name = form.name?.trim();
    if (!name) {
      setError('Product name is required');
      return;
    }

    const parseOptionalNumber = (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      return Number(value);
    };

    const quantity = parseOptionalNumber(form.quantity);
    const lowStockLevel = parseOptionalNumber(form.low_stock_level);
    const categoryId = parseOptionalNumber(form.category_id);
    const initialPrice = parseOptionalNumber(form.initialPrice);

    const payload = {
      name,
      profile_id: Number(profileId),
    };

    if (Number.isNaN(payload.profile_id)) {
      setError('Invalid profile selected');
      return;
    }

    if (form.description?.trim()) payload.description = form.description.trim();
    if (form.sku?.trim()) payload.sku = form.sku.trim();
    if (form.unit?.trim()) payload.unit = form.unit.trim();
    if (form.status?.trim()) payload.status = form.status.trim();
    if (quantity !== undefined) payload.quantity = quantity;
    if (lowStockLevel !== undefined) payload.low_stock_level = lowStockLevel;
    if (categoryId !== undefined) payload.category_id = categoryId;
    if (initialPrice !== undefined) payload.initialPrice = initialPrice;

    const hasInvalidOptionalNumber = [quantity, lowStockLevel, categoryId, initialPrice]
      .filter((value) => value !== undefined)
      .some((value) => Number.isNaN(value));

    if (hasInvalidOptionalNumber) {
      setError('Please provide valid numeric values for quantity, low stock, category, and initial price.');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:3003/products', payload);
      const createdProduct = res.data?.response?.data;

      if (createdProduct) {
        setProducts((prev) => [createdProduct, ...prev]);
      }

      setDrawerOpen(false);
    } catch (err) {
      const message =
        err.response?.data?.response?.message ||
        err.response?.data?.message ||
        'Failed to create product';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const profileId = getActiveProfileId();
      if (!profileId) {
        setError('No profile selected');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:3003/products?profile_id=${profileId}`,
        );
        setProducts(res.data.response.data || []);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Table columns definition for MUI Table
  const columns = [
    { id: 'name', label: 'Name', minWidth: 180 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'currentPrice', label: 'Current Price', minWidth: 140, align: 'right' },
    { id: 'quantity', label: 'Remaining Stock', minWidth: 130, align: 'right' },
    { id: 'unit', label: 'Unit', minWidth: 80 },
    { id: 'status', label: 'Status', minWidth: 160 },
  ];

  // Filter products based on search
  const filteredProducts = products.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.name?.toLowerCase().includes(q) ||
      row.sku?.toLowerCase().includes(q) ||
      row.description?.toLowerCase().includes(q)
    );
  });

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleRowClick = (product) => {
    if (!product?.id) {
      return;
    }
    navigate(`/app/inventory/${product.id}`);
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', width: '100%', mt: 2 }}
    >
      <Typography variant='h4' gutterBottom>
        Inventory
      </Typography>
      <Paper
        elevation={2}
        sx={{
          height: 730,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            variant='outlined'
            size='small'
            placeholder='Search'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              endAdornment: search ? (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    aria-label='Clear search'
                    onClick={() => {
                      setSearch('');
                      setPage(0);
                    }}
                  >
                    <CloseIcon fontSize='small' />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ width: 320 }}
          />
          <Box sx={{ flex: 1 }} />
          <Button
            variant='contained'
            color='primary'
            sx={{ color: '#fff', fontWeight: 600, ml: 2 }}
            onClick={() => setDrawerOpen(true)}
          >
            New Product
          </Button>
        </Box>
        {loading ? (
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            height='100%'
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            height='100%'
          >
            <Typography color='error'>{error}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ height: 610 }}>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.align || 'left'}
                        style={{ minWidth: col.minWidth, fontWeight: 'bold' }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align='center'>
                        No data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((row) => {
                      const stockStatus = getStockStatusMeta(row.quantity, row.low_stock_level);

                      return (
                        <TableRow
                          key={row.id}
                          hover
                          onClick={() => handleRowClick(row)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {row.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {row.sku || '--'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {row.category && row.category.name
                              ? row.category.name
                              : '-'}
                          </TableCell>
                          <TableCell align='right'>
                            {row.currentPrice != null
                              ? pesoFormatter.format(Number(row.currentPrice))
                              : '-'}
                          </TableCell>
                          <TableCell align='right'>{row.quantity ?? '-'}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>
                            <Chip
                              size='small'
                              label={stockStatus.label}
                              color={stockStatus.color}
                              variant='outlined'
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={filteredProducts.length}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10]}
            />
          </>
        )}
      </Paper>
      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreateProduct}
        loading={creating}
      />
    </Box>
  );
}
