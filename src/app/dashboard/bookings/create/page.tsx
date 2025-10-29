"use client";

import { useState } from "react";
import { Stack, Box, Stepper, Step, StepLabel } from "@mui/material";
// import { PageHeader } from "@/components/dashboard/page-header";
import { CustomerDetailsStep } from "@/components/dashboard/bookings/steps/customer-details-step";
import { TestDetailsStep } from "@/components/dashboard/bookings/steps/test-details-step";
import { ReviewStep } from "@/components/dashboard/bookings/steps/review-step";
import BookingDetailsStep from "@/components/dashboard/bookings/steps/ad-booking-details-step"

const steps = ["Customer Details", "Booking Details", "Review & Confirm"];

export default function CreateBookingPage() {

  const [activeStep, setActiveStep] = useState(0);

  // --- Booking core state ---
  const [customer, setCustomer] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);

  // --- Test details ---
  const [testDetails, setTestDetails] = useState<any[]>([]);

  // --- Pricing ---
  interface PricingState {
    base: number;          // Sum of base prices
    offer: number;         // Sum of offer prices (pre-coupon/admin)
    coupon: number;        // Coupon discount applied
    admin: number;         // Admin discount applied
    totalDiscount: number; // Total = (base - offer) + coupon + admin
    final: number;         // Final = base - totalDiscount
  }

  const [pricing, setPricing] = useState<PricingState>({
    base: 0,
    offer: 0,
    coupon: 0,
    admin: 0,
    totalDiscount: 0,
    final: 0,
  });

  // --- Schedule + Coupon ---
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // ✅ go to specific steps (for "Edit" buttons)
  const goToCustomerStep = () => setActiveStep(0);
  const goToTestStep = () => setActiveStep(1);

  // ✅ Apply coupon (placeholder)
  const handleApplyCoupon = () => {
    // You can call a backend API here and update pricing accordingly
  };

  // ✅ Final booking creation (placeholder)
  const handleCreateBooking = () => {
    console.log("Creating booking with:", {
      customer,
      address,
      testDetails,
      pricing,
      scheduledDate,
      scheduledTime,
      couponCode,
    });
    alert("Booking created successfully!");
  };

  return (
    <Stack spacing={3}>
      {/* <PageHeader title="Create Booking" /> */}

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box>
        {/* Step 1: Customer & Address */}
        {activeStep === 0 && (
          <CustomerDetailsStep
            customer={customer}
            setCustomer={setCustomer}
            address={address}
            setAddress={setAddress}
            onNext={handleNext}
          />
        )}

        {/* Step 2: Test Details */}
        {activeStep === 1 && (
          <BookingDetailsStep
            mode="create"
            customer={customer}
            scheduledDate={scheduledDate}
            scheduledTime={scheduledTime}
            setScheduledDate={setScheduledDate}
            setScheduledTime={setScheduledTime}
            items={testDetails}
            setItems={setTestDetails}
            selectedCoupon={selectedCoupon}
            setSelectedCoupon={setSelectedCoupon}
            pricing={pricing}
            setPricing={setPricing}
            buttonText="Next"
            onSubmit={() => setActiveStep(2)}
            onBack={() => setActiveStep(0)}
          />

        )}

        {/* Step 3: Review & Confirm */}
        {activeStep === 2 && (
          <ReviewStep
            customer={customer}
            address={address}
            testDetails={testDetails}
            pricing={pricing}
            scheduledDate={scheduledDate}
            scheduledTime={scheduledTime}
            selectedCoupon={selectedCoupon}
            goToCustomerStep={goToCustomerStep}
            goToTestsStep={goToTestStep}
            onBack={handleBack}
          />
        )}
      </Box>
    </Stack>
  );
}
