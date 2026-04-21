import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getActiveProfileId } from '../../utils/profile';
import DashboardSnapshotModal from 'components/DashboardSnapshotModal';


const ASSET_COLORS = ['#1976d2', '#2e7d32', '#ed6c02'];

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPeso(value) {
  if (value === null || value === undefined || value === '') return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return '--';
  return '\u20b1' + pesoFormatter.format(num);
}

function formatDate(value) {
  if (!value) return '--';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: '2-digit' });
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.main`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='body2' color='text.secondary' noWrap>
            {label}
          </Typography>
          <Typography variant='h5' fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          {sub && (
            <Typography variant='caption' color='text.secondary'>
              {sub}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default function DashboardV1() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeReport, setActiveReport] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [importError, setImportError] = useState(null);
  const importRef = useRef(null);

  const profileId = getActiveProfileId();

  const STORAGE_KEY = `dashboard_snapshots_${profileId}`;

  // TODO: replace localStorage block with real API calls once /dashboard-snapshots backend is ready.
  // fetchSnapshots â†’ GET /dashboard-snapshots?profile_id=profileId
  // handleSave     â†’ POST /dashboard-snapshots or PATCH /dashboard-snapshots/:id
  const fetchSnapshots = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const sorted = raw.slice().sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
      setSnapshots(sorted);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) fetchSnapshots();
    else {
      setError('No profile selected');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const handleSave = async (form) => {
    const entryDate = form.entry_date ? new Date(`${form.entry_date}T00:00:00Z`) : null;
    if (!entryDate || Number.isNaN(entryDate.getTime())) {
      return false;
    }

    const toNum = (v) => (v === '' || v === undefined ? null : Number(v));

    setSaving(true);
    try {
      const payload = {
        profile_id: Number(profileId),
        entry_date: entryDate.toISOString(),
        sales: toNum(form.sales),
        expenses: toNum(form.expenses),
        cash_on_hand: toNum(form.cash_on_hand),
        accounts_receivable: toNum(form.accounts_receivable),
        inventory_value: toNum(form.inventory_value),
        notes: form.notes || null,
      };

      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      let updated;
      if (editingEntry?.id) {
        updated = existing.map((s) =>
          s.id === editingEntry.id ? { ...s, ...payload } : s,
        );
      } else {
        updated = [...existing, { ...payload, id: Date.now() }];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      fetchSnapshots();
      setEditingEntry(null);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleEdit = (entry) => {
    const dateVal = entry?.entry_date
      ? new Date(entry.entry_date).toISOString().slice(0, 10)
      : '';
    setEditingEntry({
      id: entry.id,
      entry_date: dateVal,
      sales: entry.sales != null ? String(entry.sales) : '',
      expenses: entry.expenses != null ? String(entry.expenses) : '',
      cash_on_hand: entry.cash_on_hand != null ? String(entry.cash_on_hand) : '',
      accounts_receivable: entry.accounts_receivable != null ? String(entry.accounts_receivable) : '',
      inventory_value: entry.inventory_value != null ? String(entry.inventory_value) : '',
      notes: entry.notes || '',
    });
    setModalOpen(true);
  };

  const handleExport = () => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-snapshots-profile${profileId}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('File must contain a JSON array.');
        // Validate each entry has at least an entry_date
        const valid = parsed.every((r) => r.entry_date);
        if (!valid) throw new Error('One or more entries are missing an entry_date.');
        // Merge: keep existing entries, add imported ones that don't clash by id
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const existingIds = new Set(existing.map((r) => r.id));
        const toAdd = parsed
          .map((r) => ({ ...r, id: existingIds.has(r.id) ? Date.now() + Math.random() : r.id }));
        const merged = [...existing, ...toAdd.filter((r) => !existingIds.has(r.id))].concat(
          toAdd.filter((r) => existingIds.has(r.id)),
        );
        // Deduplicate by id keeping last occurrence
        const deduped = Object.values(
          merged.reduce((acc, r) => { acc[r.id] = r; return acc; }, {}),
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
        fetchSnapshots();
      } catch (err) {
        setImportError(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = '';
  };

  // Derive summary from latest snapshot
  const latest = snapshots[0] ?? null;

  // displayEntry: selected backlog row, or latest if none selected
  const displayEntry = selectedEntry ?? latest;
  const isViewingBacklog = selectedEntry !== null && selectedEntry?.id !== latest?.id;

  const netIncome = useMemo(() => {
    const s = Number(displayEntry?.sales ?? 0);
    const e = Number(displayEntry?.expenses ?? 0);
    return Number.isNaN(s) || Number.isNaN(e) ? null : s - e;
  }, [displayEntry]);

  const totalAssets = useMemo(() => {
    const cash = Number(displayEntry?.cash_on_hand ?? 0);
    const ar = Number(displayEntry?.accounts_receivable ?? 0);
    const inv = Number(displayEntry?.inventory_value ?? 0);
    return cash + ar + inv;
  }, [displayEntry]);

  // Bar chart: sales vs expenses (last 10 entries, chronological)
  const barData = useMemo(() => {
    return snapshots
      .slice()
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
      .slice(-10)
      .map((s) => ({
        label: formatDate(s.entry_date),
        Sales: Number(s.sales ?? 0),
        Expenses: Number(s.expenses ?? 0),
      }));
  }, [snapshots]);

  // Line chart: cash on hand trend (last 10, chronological)
  const lineData = useMemo(() => {
    return snapshots
      .slice()
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
      .slice(-10)
      .map((s) => ({
        label: formatDate(s.entry_date),
        'Cash on Hand': Number(s.cash_on_hand ?? 0),
      }));
  }, [snapshots]);

  // Pie: asset allocation from displayEntry
  const pieData = useMemo(() => {
    if (!displayEntry) return [];
    return [
      { name: 'Cash on Hand', value: Number(displayEntry.cash_on_hand ?? 0) },
      { name: 'Inventory', value: Number(displayEntry.inventory_value ?? 0) },
      { name: 'Receivables', value: Number(displayEntry.accounts_receivable ?? 0) },
    ].filter((d) => d.value > 0);
  }, [displayEntry]);

  // Net income trend (chronological, last 10)
  const netIncomeData = useMemo(() => {
    return snapshots
      .slice()
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
      .slice(-10)
      .map((s) => ({
        label: formatDate(s.entry_date),
        'Net Income': Number(s.sales ?? 0) - Number(s.expenses ?? 0),
        Sales: Number(s.sales ?? 0),
        Expenses: Number(s.expenses ?? 0),
      }));
  }, [snapshots]);

  // Asset trend (cash + receivables + inventory over time)
  const assetTrendData = useMemo(() => {
    return snapshots
      .slice()
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
      .slice(-10)
      .map((s) => ({
        label: formatDate(s.entry_date),
        'Cash': Number(s.cash_on_hand ?? 0),
        'Inventory': Number(s.inventory_value ?? 0),
        'Receivables': Number(s.accounts_receivable ?? 0),
      }));
  }, [snapshots]);

  const REPORTS = [
    { label: 'Overview', icon: <DashboardIcon fontSize='small' /> },
    { label: 'Sales & Expenses', icon: <BarChartIcon fontSize='small' /> },
    { label: 'Cash Flow', icon: <WaterfallChartIcon fontSize='small' /> },
    { label: 'Entry History', icon: <TableChartIcon fontSize='small' /> },
  ];

  const EmptyChart = ({ height = 260 }) => (
    <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
      <Typography variant='body2' color='text.disabled'>No data yet â€” log an entry to see this chart.</Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height='60vh'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='flex-start' flexWrap='wrap' gap={1}>
        <Box>
          <Typography variant='h4' fontWeight={700}>
            Financial Overview
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {isViewingBacklog
              ? `Viewing backlog: ${formatDate(displayEntry.entry_date)}`
              : latest
              ? `Last updated: ${formatDate(latest.entry_date)}`
              : 'No entries yet — log your first financial snapshot.'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {isViewingBacklog && (
            <Button variant='outlined' size='small' onClick={() => setSelectedEntry(null)}>
              Back to Latest
            </Button>
          )}
          <Button variant='outlined' startIcon={<DownloadIcon />} onClick={handleExport} disabled={snapshots.length === 0}>
            Export JSON
          </Button>
          <Button variant='outlined' startIcon={<UploadFileIcon />} onClick={() => importRef.current?.click()}>
            Import JSON
          </Button>
          <input ref={importRef} type='file' accept='application/json,.json' style={{ display: 'none' }} onChange={handleImport} />
          <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreate}>
            Log Entry
          </Button>
        </Box>
      </Box>

      {(error || importError) && (
        <Typography color='error'>{error || importError}</Typography>
      )}

      {/* Stat Cards - reflect selected or latest entry */}
      {isViewingBacklog && (
        <Box sx={{ px: 2, py: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant='body2' color='warning.dark' fontWeight={600}>
            Viewing backlog entry for {formatDate(displayEntry.entry_date)}. Click the same row again or &ldquo;Back to Latest&rdquo; to reset.
          </Typography>
        </Box>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<AttachMoneyIcon />} label='Sales' value={formatPeso(displayEntry?.sales)} color='success' sub='Total revenue this period' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<TrendingDownIcon />} label='Expenses' value={formatPeso(displayEntry?.expenses)} color='error' sub='Feeds, supplies, labor, etc.' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<TrendingUpIcon />} label='Net Income' value={netIncome != null ? formatPeso(netIncome) : '--'} color={netIncome != null && netIncome >= 0 ? 'success' : 'error'} sub='Sales minus Expenses' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<AccountBalanceWalletIcon />} label='Cash on Hand' value={formatPeso(displayEntry?.cash_on_hand)} color='primary' sub='Available liquid cash' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<ReceiptLongIcon />} label='Accounts Receivable' value={formatPeso(displayEntry?.accounts_receivable)} color='warning' sub='Money owed to the business' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<Inventory2Icon />} label='Inventory Value' value={formatPeso(displayEntry?.inventory_value)} color='info' sub='Feeds & supplies invested' />
        </Grid>
      </Grid>
      {/* Report Tabs */}
      <Paper sx={{ p: 0 }}>
        <Tabs
          value={activeReport}
          onChange={(_, v) => setActiveReport(v)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          {REPORTS.map((r, i) => (
            <Tab key={i} label={r.label} icon={r.icon} iconPosition='start' sx={{ minHeight: 52, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>

          {/* â”€â”€ TAB 0: Overview â”€â”€ */}
          {activeReport === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant='subtitle1' fontWeight={600} gutterBottom>Sales vs Expenses</Typography>
                {barData.length === 0 ? <EmptyChart /> : (
                  <Box sx={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={barData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='label' tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `\u20b1${Number(v).toLocaleString()}`} tick={{ fontSize: 11 }} />
                        <RechartsTooltip formatter={(v) => formatPeso(v)} />
                        <Legend />
                        <Bar dataKey='Sales' fill='#2e7d32' radius={[4, 4, 0, 0]} />
                        <Bar dataKey='Expenses' fill='#d32f2f' radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant='subtitle1' fontWeight={600} gutterBottom>
                  Asset Allocation {isViewingBacklog ? `(${formatDate(displayEntry.entry_date)})` : '(Latest)'}
                </Typography>
                {pieData.length === 0 ? <EmptyChart /> : (
                  <Box sx={{ width: '100%', height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ResponsiveContainer width='100%' height={210}>
                      <PieChart>
                        <Pie data={pieData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={85} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                          {pieData.map((_, i) => <Cell key={i} fill={ASSET_COLORS[i % ASSET_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(v) => formatPeso(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <Typography variant='caption' color='text.secondary'>Total Assets: <strong>{formatPeso(totalAssets)}</strong></Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}

          {/* â”€â”€ TAB 1: Sales & Expenses â”€â”€ */}
          {activeReport === 1 && (
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant='subtitle1' fontWeight={600} gutterBottom>Sales vs Expenses Trend</Typography>
                {netIncomeData.length === 0 ? <EmptyChart height={300} /> : (
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={netIncomeData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='label' tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `\u20b1${Number(v).toLocaleString()}`} tick={{ fontSize: 11 }} />
                        <RechartsTooltip formatter={(v) => formatPeso(v)} />
                        <Legend />
                        <Bar dataKey='Sales' fill='#2e7d32' radius={[4, 4, 0, 0]} />
                        <Bar dataKey='Expenses' fill='#d32f2f' radius={[4, 4, 0, 0]} />
                        <Line type='monotone' dataKey='Net Income' stroke='#1976d2' strokeWidth={2} dot strokeDasharray='5 3' />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Grid>
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant='subtitle1' fontWeight={600} gutterBottom>Net Income Over Time</Typography>
                {netIncomeData.length === 0 ? <EmptyChart height={220} /> : (
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <AreaChart data={netIncomeData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id='niGradient' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='5%' stopColor='#1976d2' stopOpacity={0.3} />
                            <stop offset='95%' stopColor='#1976d2' stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='label' tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `\u20b1${Number(v).toLocaleString()}`} tick={{ fontSize: 11 }} />
                        <RechartsTooltip formatter={(v) => formatPeso(v)} />
                        <ReferenceLine y={0} stroke='#888' strokeDasharray='3 3' />
                        <Area type='monotone' dataKey='Net Income' stroke='#1976d2' fill='url(#niGradient)' strokeWidth={2} dot />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}

          {/* â”€â”€ TAB 2: Cash Flow â”€â”€ */}
          {activeReport === 2 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='subtitle1' fontWeight={600} gutterBottom>Cash on Hand Trend</Typography>
                {lineData.length === 0 ? <EmptyChart height={260} /> : (
                  <Box sx={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <AreaChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id='cashGradient' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='5%' stopColor='#1976d2' stopOpacity={0.3} />
                            <stop offset='95%' stopColor='#1976d2' stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='label' tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `\u20b1${Number(v).toLocaleString()}`} tick={{ fontSize: 11 }} />
                        <RechartsTooltip formatter={(v) => formatPeso(v)} />
                        <Legend />
                        <Area type='monotone' dataKey='Cash on Hand' stroke='#1976d2' fill='url(#cashGradient)' strokeWidth={2} dot />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='subtitle1' fontWeight={600} gutterBottom>Asset Breakdown Over Time</Typography>
                {assetTrendData.length === 0 ? <EmptyChart height={260} /> : (
                  <Box sx={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <AreaChart data={assetTrendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id='cashG' x1='0' y1='0' x2='0' y2='1'><stop offset='5%' stopColor='#1976d2' stopOpacity={0.4} /><stop offset='95%' stopColor='#1976d2' stopOpacity={0} /></linearGradient>
                          <linearGradient id='invG' x1='0' y1='0' x2='0' y2='1'><stop offset='5%' stopColor='#2e7d32' stopOpacity={0.4} /><stop offset='95%' stopColor='#2e7d32' stopOpacity={0} /></linearGradient>
                          <linearGradient id='arG' x1='0' y1='0' x2='0' y2='1'><stop offset='5%' stopColor='#ed6c02' stopOpacity={0.4} /><stop offset='95%' stopColor='#ed6c02' stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='label' tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `\u20b1${Number(v).toLocaleString()}`} tick={{ fontSize: 11 }} />
                        <RechartsTooltip formatter={(v) => formatPeso(v)} />
                        <Legend />
                        <Area type='monotone' dataKey='Cash' stroke='#1976d2' fill='url(#cashG)' strokeWidth={2} />
                        <Area type='monotone' dataKey='Inventory' stroke='#2e7d32' fill='url(#invG)' strokeWidth={2} />
                        <Area type='monotone' dataKey='Receivables' stroke='#ed6c02' fill='url(#arG)' strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}

          {/* â”€â”€ TAB 3: Entry History â”€â”€ */}
          {activeReport === 3 && (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align='right'>Sales</TableCell>
                    <TableCell align='right'>Expenses</TableCell>
                    <TableCell align='right'>Net Income</TableCell>
                    <TableCell align='right'>Cash on Hand</TableCell>
                    <TableCell align='right'>Receivables</TableCell>
                    <TableCell align='right'>Inventory Value</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align='center'>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {snapshots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align='center' sx={{ py: 4, color: 'text.disabled' }}>
                        No entries yet. Click &ldquo;Log Entry&rdquo; to add your first snapshot.
                      </TableCell>
                    </TableRow>
                  ) : (
                    snapshots.map((row) => {
                      const net = Number(row.sales ?? 0) - Number(row.expenses ?? 0);
                      const isSelected = selectedEntry?.id === row.id;
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          selected={isSelected}
                          onClick={() => setSelectedEntry(isSelected ? null : row)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{formatDate(row.entry_date)}</TableCell>
                          <TableCell align='right'>{formatPeso(row.sales)}</TableCell>
                          <TableCell align='right'>{formatPeso(row.expenses)}</TableCell>
                          <TableCell align='right'>
                            <Chip label={formatPeso(net)} color={net >= 0 ? 'success' : 'error'} size='small' variant='outlined' />
                          </TableCell>
                          <TableCell align='right'>{formatPeso(row.cash_on_hand)}</TableCell>
                          <TableCell align='right'>{formatPeso(row.accounts_receivable)}</TableCell>
                          <TableCell align='right'>{formatPeso(row.inventory_value)}</TableCell>
                          <TableCell sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={row.notes || ''} placement='top'>
                              <span>{row.notes || '--'}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align='center'>
                            <IconButton size='small' onClick={() => handleEdit(row)}>
                              <EditIcon fontSize='small' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </Box>
      </Paper>

      <DashboardSnapshotModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEntry(null); }}
        onSubmit={handleSave}
        loading={saving}
        title={editingEntry ? 'Edit Entry' : 'Log Financial Entry'}
        actionLabel={editingEntry ? 'Update' : 'Save'}
        initialValues={editingEntry}
      />
    </Box>
  );
}

