"use client";

import api from "./axios";

// ============================================================
// 🔹 Core Types
// ============================================================
export interface PatientDetail {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  user_email?: string;
  user_mobile?: string;
}

export interface LabTestDetail {
  id: number;
  name: string;
  description?: string;
  price: string;
  offer_price?: string;
}

export interface ProfileDetail extends LabTestDetail {
  tests?: LabTestDetail[];
}

export interface PackageDetail extends LabTestDetail {
  tests?: LabTestDetail[];
}

export interface BookingItem {
  id: string;
  booking: string;
  patient: number;
  patient_detail?: PatientDetail;
  lab_test?: number | null;
  lab_test_detail?: LabTestDetail | null;
  profile?: number | null;
  profile_detail?: ProfileDetail | null;
  package?: number | null;
  package_detail?: PackageDetail | null;
  base_price: string;
  offer_price?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingAction {
  id: string;
  booking: string;
  user: number;
  user_email: string;
  action: string;
  notes: string;
  created_at: string;
}

export interface UserDetail {
  id: number;
  email: string;
  mobile: string;
  first_name: string;
  last_name: string;
  gender: string;
}

export interface AddressDetail {
  id: number;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  user_name?: string;
  user_mobile?: string;
}

export interface Booking {
  id: string;
  ref_id: string;
  user: number;
  user_email: string;
  user_detail: UserDetail;
  current_agent: number | null;
  address: number;
  address_detail: AddressDetail;
  coupon: number | null;
  coupon_detail?: any;
  discount_amount: string;
  coupon_discount: string;
  admin_discount: string;
  base_total: string;
  offer_total: string;
  final_amount: string;
  total_savings: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  scheduled_date?: string;
  scheduled_time?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  items: BookingItem[];
  actions: BookingAction[];
}

// ============================================================
// 🔹 List + Retrieve
// ============================================================
export interface BookingListResponse {
  results: Booking[];
  count: number;
}

export async function getBookings(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  filters?: Record<string, any>;
}): Promise<BookingListResponse> {
  const response = await api.get("/bookings/", { params });
  return response.data;
}

export async function getBooking(id: string): Promise<Booking> {
  const response = await api.get(`/bookings/${id}/`);
  return response.data;
}

// ============================================================
// 🔹 Create / Update payloads
// ============================================================

export interface BookingItemPayload {
  patient: number;
  lab_test?: number | null;
  profile?: number | null;
  package?: number | null;
  base_price: number;
  offer_price?: number | null;
}

export interface BookingPayload {
  user?: number;
  address: number;
  scheduled_date?: string;
  scheduled_time?: string;
  remarks?: string;
  coupon?: number | null;
  base_total: number;
  offer_total: number;
  final_amount: number;
  discount_amount: number;
  coupon_discount?: number;
  admin_discount?: number;
  items: BookingItemPayload[];
}

// ============================================================
// 🔹 Create Booking
// ============================================================

export async function createBooking(data: BookingPayload): Promise<Booking> {
  /**
   * Example payload:
   * {
   *   user: 1,
   *   address: 2,
   *   scheduled_date: "2025-10-16",
   *   scheduled_time: "10:10:00",
   *   coupon: 3,
   *   base_total: 1000,
   *   offer_total: 850,
   *   final_amount: 750,
   *   discount_amount: 250,
   *   admin_discount: 50,
   *   items: [
   *     { patient: 1, lab_test: 10, base_price: 500, offer_price: 400 },
   *   ]
   * }
   */
  const response = await api.post("/bookings/", data);
  return response.data;
}

// ============================================================
// 🔹 Update Booking
// ============================================================

export async function updateBooking(id: string, data: BookingPayload): Promise<Booking> {
  /**
   * Same structure as createBooking — allows partial update
   */
  const response = await api.patch(`/bookings/${id}/`, data);
  return response.data;
}

// ============================================================
// 🔹 Delete Booking
// ============================================================
export async function deleteBooking(id: string): Promise<void> {
  await api.delete(`/bookings/${id}/`);
}

// ============================================================
// 🔹 Booking Items (optional standalone endpoints)
// ============================================================
export async function addBookingItem(data: BookingItemPayload): Promise<BookingItem> {
  const response = await api.post("/booking-items/", data);
  return response.data;
}

export async function deleteBookingItem(id: string): Promise<void> {
  await api.delete(`/booking-items/${id}/`);
}

// ============================================================
// 🎟️ Coupons
// ============================================================
export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discount_type: "percent" | "flat";
  discount_value: string;
  max_discount_amount?: string;
  valid_from?: string;
  valid_to?: string;
  active: boolean;
}

export async function getCoupons(search = ""): Promise<{ results: Coupon[] }> {
  const response = await api.get("/coupons/", { params: { search } });
  return response.data;
}

export async function validateCoupon(
  code: string,
  booking_amount: number
): Promise<{ valid: boolean; discount: number; message?: string }> {
  const response = await api.post("/coupons/validate/", { code, booking_amount });
  return response.data;
}
