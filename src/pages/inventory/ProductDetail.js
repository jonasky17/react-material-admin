import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getActiveProfileId } from '../../utils/profile';
import PriceModal from 'components/PriceModal';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [stockBatches, setStockBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);
  const [editingPriceEntry, setEditingPriceEntry] = useState(null);

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
        const productRes = await axios.get(
          `http://localhost:3003/products/${productId}?profile_id=${profileId}`,
        );

        setProduct(productRes.data?.response?.data || null);

        const priceHistoryRes = await axios.get(
          `http://localhost:3003/price-history/product/${productId}`,
        );
        const rawPriceHistory = priceHistoryRes.data?.response?.data;
        const sortedPriceHistory = Array.isArray(rawPriceHistory)
          ? rawPriceHistory
              .slice()
              .sort(
                (a, b) =>
                  new Date(b?.effective_date || b?.created_at).getTime() -
                  new Date(a?.effective_date || a?.created_at).getTime(),
              )
          : [];
        setPriceHistory(sortedPriceHistory);

        const stockBatchesRes = await axios.get(
          `http://localhost:3003/stock-batches/product/${productId}`,
        );
        const rawStockBatches = stockBatchesRes.data?.response?.data;
        setStockBatches(Array.isArray(rawStockBatches) ? rawStockBatches : []);
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

  const refreshPriceHistory = async () => {
    try {
      const priceHistoryRes = await axios.get(
        `http://localhost:3003/price-history/product/${productId}`,
      );
      const rawPriceHistory = priceHistoryRes.data?.response?.data;
      const sortedPriceHistory = Array.isArray(rawPriceHistory)
        ? rawPriceHistory
            .slice()
            .sort(
              (a, b) =>
                new Date(b?.effective_date || b?.created_at).getTime() -
                new Date(a?.effective_date || a?.created_at).getTime(),
            )
        : [];
      setPriceHistory(sortedPriceHistory);
    } catch {
      setError('Failed to refresh price history');
    }
  };

  const handleSavePrice = async (form) => {
    const parsedPrice = Number(form.price);
    const effectiveDate = form.effective_date
      ? new Date(`${form.effective_date}T00:00:00Z`)
      : null;

    if (Number.isNaN(parsedPrice)) {
      setError('Please enter a valid price.');
      return false;
    }

    if (!effectiveDate || Number.isNaN(effectiveDate.getTime())) {
      setError('Please enter a valid effective date.');
      return false;
    }

    setSavingPrice(true);
    setError(null);
    try {
      const payload = {
        productId: Number(productId),
        price: parsedPrice,
        effective_date: effectiveDate.toISOString(),
      };

      if (editingPriceEntry?.id) {
        await axios.patch(
          `http://localhost:3003/price-history/${editingPriceEntry.id}`,
          payload,
        );
      } else {
        await axios.post('http://localhost:3003/price-history', payload);
      }

      await refreshPriceHistory();
      setEditingPriceEntry(null);
      return true;
    } catch (err) {
      const message =
        err.response?.data?.response?.message ||
        err.response?.data?.message ||
        'Failed to update price';
      setError(Array.isArray(message) ? message.join(', ') : message);
      return false;
    } finally {
      setSavingPrice(false);
    }
  };

  const toDateInputValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const handleCreatePrice = () => {
    setEditingPriceEntry(null);
    setPriceModalOpen(true);
  };

  const handleEditPrice = (entry) => {
    setEditingPriceEntry({
      id: entry?.id,
      price: entry?.price != null ? String(entry.price) : '',
      effective_date: toDateInputValue(entry?.effective_date || entry?.created_at),
    });
    setPriceModalOpen(true);
  };

  const status = getStockStatusMeta(product?.quantity, product?.low_stock_level);
  const latestPrice = priceHistory.length ? priceHistory[0]?.price : null;
  const quantityValue = Number(product?.quantity);
  const lowStockValue = Number(product?.low_stock_level);

  const formatDate = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';

    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const getPriceTrend = (currentPrice, previousPrice) => {
    const current = Number(currentPrice);
    const previous = Number(previousPrice);

    if (Number.isNaN(current) || Number.isNaN(previous)) {
      return { label: '--', color: 'default' };
    }

    if (current > previous) {
      return { label: 'Up', color: 'success' };
    }

    if (current < previous) {
      return { label: 'Down', color: 'error' };
    }

    return { label: 'No change', color: 'default' };
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
        <Grid container columnSpacing={4} rowSpacing={2} alignItems='flex-start'>
          <Grid item xs={12} md={4}>
            <Typography variant='overline' color='text.secondary'>
              PRODUCT
            </Typography>
            <Typography variant='h6' sx={{ mb: 1 }}>
              {product.name || '--'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {product.description || '--'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant='overline' color='text.secondary'>
              ITEM DETAILS
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              SKU: {product.sku || '--'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Category: {product.category?.name || '--'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant='overline' color='text.secondary'>
              CURRENT PRICE
            </Typography>
            <Typography variant='h6'>
              {latestPrice != null ? pesoFormatter.format(Number(latestPrice)) : '--'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant='overline' color='text.secondary'>
              INVENTORY
            </Typography>
            <Box display='flex' alignItems='center' justifyContent='space-between' gap={2} flexWrap='wrap'>
              <Typography variant='body2' color='text.secondary'>
                Remaining: {Number.isNaN(quantityValue) ? '--' : quantityValue}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Unit: {product.unit || '--'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant='overline' color='text.secondary'>
              STOCK SETTINGS
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Low Stock: {Number.isNaN(lowStockValue) ? '--' : lowStockValue}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip label={status.label} color={status.color} variant='outlined' size='small' />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6'>Price History</Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={handleCreatePrice}
              >
                Update Price
              </Button>
            </Box>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align='right'>Price</TableCell>
                    <TableCell>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {priceHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align='center'>
                        No price history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    priceHistory.map((entry, index) => {
                      const trend = getPriceTrend(entry?.price, priceHistory[index + 1]?.price);

                      return (
                        <TableRow
                          key={entry?.id || `${entry?.created_at || 'date'}-${index}`}
                          hover
                          onClick={() => handleEditPrice(entry)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{formatDate(entry?.effective_date || entry?.created_at)}</TableCell>
                          <TableCell align='right'>
                            {entry?.price != null ? pesoFormatter.format(Number(entry.price)) : '--'}
                          </TableCell>
                          <TableCell>
                            {index === priceHistory.length - 1 ? (
                              <Chip label='--' size='small' variant='outlined' />
                            ) : (
                              <Chip
                                label={trend.label}
                                color={trend.color}
                                size='small'
                                variant='outlined'
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Stock Batches
            </Typography>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Date Received</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align='right'>Quantity Received</TableCell>
                    <TableCell align='right'>Quantity Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align='center'>
                        No stock batches available
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockBatches.map((batch) => (
                      <TableRow key={batch?.id}>
                        <TableCell>{formatDate(batch?.received_at)}</TableCell>
                        <TableCell>{batch?.location?.name || '--'}</TableCell>
                        <TableCell align='right'>{Number(batch?.quantity_received || 0).toFixed(2)}</TableCell>
                        <TableCell align='right'>{Number(batch?.quantity_remaining || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <PriceModal
        open={priceModalOpen}
        onClose={() => {
          setPriceModalOpen(false);
          setEditingPriceEntry(null);
        }}
        onSubmit={handleSavePrice}
        loading={savingPrice}
        title={editingPriceEntry ? 'Edit Price' : 'Update Price'}
        actionLabel={editingPriceEntry ? 'Update' : 'Save'}
        initialValues={editingPriceEntry}
      />
    </Box>
  );
}
