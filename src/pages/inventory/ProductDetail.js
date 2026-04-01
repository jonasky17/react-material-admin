import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getActiveProfileId } from '../../utils/profile';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pesoFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }),
    [],
  );

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

  useEffect(() => {
    const fetchProduct = async () => {
      const profileId = getActiveProfileId();
      if (!profileId) {
        setError('No profile selected');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3003/products/${productId}?profile_id=${profileId}`,
        );
        setProduct(res.data?.response?.data || null);
      } catch (err) {
        const message =
          err.response?.data?.response?.message ||
          err.response?.data?.message ||
          'Failed to fetch product details';
        setError(Array.isArray(message) ? message.join(', ') : message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const status = getStockStatusMeta(product?.quantity, product?.low_stock_level);
  const latestPrice = product?.priceHistory?.length
    ? product.priceHistory[0]?.price
    : null;
  const quantityValue = Number(product?.quantity);
  const lowStockValue = Number(product?.low_stock_level);

  const formatDateTime = (value) => {
    if (!value) return '--';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';

    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height='60vh'>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display='flex' flexDirection='column' gap={2}>
        <Typography variant='h5'>Product Detail</Typography>
        <Typography color='error'>{error}</Typography>
        <Box>
          <Button variant='outlined' onClick={() => navigate('/app/inventory')}>
            Back to Inventory
          </Button>
        </Box>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box display='flex' flexDirection='column' gap={2}>
        <Typography variant='h5'>Product Detail</Typography>
        <Typography>Product not found.</Typography>
        <Box>
          <Button variant='outlined' onClick={() => navigate('/app/inventory')}>
            Back to Inventory
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant='h4'>Product Detail</Typography>
        <Button variant='outlined' onClick={() => navigate('/app/inventory')}>
          Back to Inventory
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems='center'>
          <Grid item xs={12} md={8}>
            <Typography variant='overline' color='text.secondary'>
              PRODUCT NAME
            </Typography>
            <Typography variant='h5' sx={{ mb: 1 }}>
              {product.name || '--'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              SKU: {product.sku || '--'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Category: {product.category?.name || '--'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='overline' color='text.secondary'>
              CURRENT PRICE
            </Typography>
            <Typography variant='h5' align='right'>
              {latestPrice != null ? pesoFormatter.format(Number(latestPrice)) : '--'}
            </Typography>
            <Box mt={1} display='flex' justifyContent='flex-end'>
              <Chip label={status.label} color={status.color} variant='outlined' size='small' />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Product Info
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              PRODUCT DESCRIPTION
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {product.description || '--'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              PRODUCT CODE
            </Typography>
            <Typography variant='body2' sx={{ mb: 2 }}>
              {product.sku || '--'}
            </Typography>

            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              INVENTORY
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Remaining Stock: {Number.isNaN(quantityValue) ? '--' : quantityValue}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Low Stock Level: {Number.isNaN(lowStockValue) ? '--' : lowStockValue}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Unit: {product.unit || '--'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              STATUS & TIMELINE
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Chip label={status.label} color={status.color} variant='outlined' size='small' />
            </Box>
            <Typography variant='body2' color='text.secondary'>
              Created: {formatDateTime(product.created_at)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Updated: {formatDateTime(product.updated_at)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
