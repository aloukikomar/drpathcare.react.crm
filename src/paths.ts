export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' ,signInOTP: '/auth/sign-in-otp'},
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    bookings: '/dashboard/bookings',
    customers: '/dashboard/customers',
    lab_products: '/dashboard/lab-products',
    notifications: '/dashboard/notifications',
    // labtests: '/dashboard/labtests',
    // profile_tests: '/dashboard/profile-tests',
    // packages: '/dashboard/packages',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
