import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'bookings', title: 'Bookings', href: paths.dashboard.bookings, icon: 'folders' },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'lab_products', title: 'Lab Products', href: paths.dashboard.lab_products, icon: 'test-tube' },
  { key: 'notifications', title: 'Notifications', href: paths.dashboard.notifications, icon: 'envelope-simple' },
  
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
