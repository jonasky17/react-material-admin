import { Home as HomeIcon, Inventory2 as InventoryIcon, PointOfSale as SalesIcon, Settings as SettingsIcon } from '@mui/icons-material';

const structure = [
  { id: 0, label: 'Dashboard', link: '/app/dashboard', icon: <HomeIcon /> },
  { id: 1, label: 'Inventory', link: '/app/inventory', icon: <InventoryIcon /> },
  { id: 2, label: 'Sales', link: '/app/sales', icon: <SalesIcon /> },
  { id: 3, label: 'Settings', link: '/app/settings', icon: <SettingsIcon /> },
];

export default structure;
