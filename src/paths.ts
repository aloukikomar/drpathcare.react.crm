export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    bookings: '/dashboard/bookings',
    customers: '/dashboard/customers',
    labtests: '/dashboard/integrations',
    packages: '/dashboard/packages',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
