import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import axios from 'axios';
import { getActiveProfileId } from '../../utils/profile';
import ProductDrawer from 'components/ProductDrawer';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add this handler for the drawer form submission
  const handleCreateProduct = (form) => {
    // For now, just close the drawer and log the form data
    setDrawerOpen(false);
    console.log('Product to create:', form);
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
    { id: 'id', label: 'ID', minWidth: 70 },
    { id: 'sku', label: 'SKU', minWidth: 120 },
    { id: 'name', label: 'Name', minWidth: 180 },
    { id: 'description', label: 'Description', minWidth: 220 },
    { id: 'quantity', label: 'Quantity', minWidth: 100 },
    { id: 'unit', label: 'Unit', minWidth: 80 },
    { id: 'low_stock_level', label: 'Low Stock', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'currentPrice', label: 'Current Price', minWidth: 120 },
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
          height: 500,
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
            placeholder='Search by name, SKU, or description'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <TableContainer sx={{ maxHeight: 420 }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
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
                  filteredProducts.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sku}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell>{row.low_stock_level}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>
                        {row.category && row.category.name
                          ? row.category.name
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {row.currentPrice != null ? row.currentPrice : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreateProduct}
        loading={false}
      />
    </Box>
  );
}
