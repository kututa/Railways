declare global {
  interface Window {
    mpesaPaymentResolve?: (success: boolean) => void
    currentBookingId?: string
  }
}

export {}
