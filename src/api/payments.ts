// src/api/payments.ts
"use client";

import api from "./axios";

export interface BookingPayment {
  id: string;
  booking: string;
  booking_detail?: any;
  user: string;
  user_detail?: any;
  amount: string;
  status: string;
  method: string;
  transaction_id?: string;
  provider_order_id?: string;
  remarks?: string;
  metadata?: any;
  url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 📄 Get all payments for a booking
 */
export async function getBookingPayments(bookingId: string): Promise<BookingPayment[]> {
  const res = await api.get(`/payments/`, { params: { booking: bookingId } });
  return res.data ;
}

/**
 * 🔄 Refresh a specific payment's status by its ID
 */
export async function refreshPaymentStatus(paymentId: string): Promise<BookingPayment> {
  const res = await api.post(`/payments/${paymentId}/refresh-status/`);
  return res.data;
}

/**
 * 🔄 Refresh the latest payment for a booking
 */
export async function refreshLatestPayment(bookingId: string): Promise<BookingPayment> {
  const res = await api.post(`/payments/booking/${bookingId}/refresh-latest/`);
  return res.data;
}
