import axios from "axios"

// M-Pesa API Configuration
const MPESA_CONFIG = {
  consumer_key: process.env.MPESA_CONSUMER_KEY!,
  consumer_secret: process.env.MPESA_CONSUMER_SECRET!,
  business_short_code: process.env.MPESA_BUSINESS_SHORT_CODE!,
  passkey: process.env.MPESA_PASSKEY!,
  callback_url: process.env.MPESA_CALLBACK_URL!,
  base_url: process.env.NODE_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke",
}

// Generate M-Pesa access token
export async function generateAccessToken(): Promise<string> {
  const auth = Buffer.from(`${MPESA_CONFIG.consumer_key}:${MPESA_CONFIG.consumer_secret}`).toString("base64")

  try {
    const response = await axios.get(`${MPESA_CONFIG.base_url}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    return response.data.access_token
  } catch (error) {
    console.error("Error generating M-Pesa access token:", error)
    throw new Error("Failed to generate M-Pesa access token")
  }
}

// Generate password for STK Push
function generatePassword(): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3)
  const password = Buffer.from(`${MPESA_CONFIG.business_short_code}${MPESA_CONFIG.passkey}${timestamp}`).toString(
    "base64",
  )

  return password
}

// Get current timestamp
function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3)
}

// Format phone number to M-Pesa format (254XXXXXXXXX)
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // Handle different formats
  if (cleaned.startsWith("254")) {
    return cleaned
  } else if (cleaned.startsWith("0")) {
    return "254" + cleaned.slice(1)
  } else if (cleaned.length === 9) {
    return "254" + cleaned
  }

  throw new Error("Invalid phone number format")
}

// STK Push request
export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string,
): Promise<{
  success: boolean
  checkoutRequestId?: string
  responseCode?: string
  responseDescription?: string
  customerMessage?: string
  error?: string
}> {
  try {
    const accessToken = await generateAccessToken()
    const formattedPhone = formatPhoneNumber(phoneNumber)
    const timestamp = getTimestamp()
    const password = generatePassword()

    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.business_short_code,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount), // M-Pesa requires integer amounts
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.business_short_code,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callback_url,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }

    const response = await axios.post(`${MPESA_CONFIG.base_url}/mpesa/stkpush/v1/processrequest`, stkPushData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const { data } = response

    if (data.ResponseCode === "0") {
      return {
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        customerMessage: data.CustomerMessage,
      }
    } else {
      return {
        success: false,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        customerMessage: data.CustomerMessage,
        error: data.errorMessage || "STK Push failed",
      }
    }
  } catch (error: any) {
    console.error("STK Push error:", error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.errorMessage || "Failed to initiate payment",
    }
  }
}

// Query STK Push status
export async function querySTKPushStatus(checkoutRequestId: string): Promise<{
  success: boolean
  resultCode?: string
  resultDesc?: string
  mpesaReceiptNumber?: string
  transactionDate?: string
  phoneNumber?: string
  error?: string
}> {
  try {
    const accessToken = await generateAccessToken()
    const timestamp = getTimestamp()
    const password = generatePassword()

    const queryData = {
      BusinessShortCode: MPESA_CONFIG.business_short_code,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }

    const response = await axios.post(`${MPESA_CONFIG.base_url}/mpesa/stkpushquery/v1/query`, queryData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const { data } = response

    if (data.ResponseCode === "0") {
      return {
        success: true,
        resultCode: data.ResultCode,
        resultDesc: data.ResultDesc,
        mpesaReceiptNumber: data.MpesaReceiptNumber,
        transactionDate: data.TransactionDate,
        phoneNumber: data.PhoneNumber,
      }
    } else {
      return {
        success: false,
        error: data.ResponseDescription || "Query failed",
      }
    }
  } catch (error: any) {
    console.error("STK Push query error:", error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.errorMessage || "Failed to query payment status",
    }
  }
}

// Validate M-Pesa callback
export function validateCallback(callbackData: any): {
  isValid: boolean
  resultCode?: string
  resultDesc?: string
  mpesaReceiptNumber?: string
  transactionDate?: string
  phoneNumber?: string
  amount?: number
} {
  try {
    const { Body } = callbackData
    const { stkCallback } = Body

    if (!stkCallback) {
      return { isValid: false }
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    if (ResultCode === 0 && CallbackMetadata) {
      // Extract metadata
      const metadata = CallbackMetadata.Item
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value
      const transactionDate = metadata.find((item: any) => item.Name === "TransactionDate")?.Value
      const phoneNumber = metadata.find((item: any) => item.Name === "PhoneNumber")?.Value
      const amount = metadata.find((item: any) => item.Name === "Amount")?.Value

      return {
        isValid: true,
        resultCode: ResultCode.toString(),
        resultDesc: ResultDesc,
        mpesaReceiptNumber,
        transactionDate: transactionDate?.toString(),
        phoneNumber: phoneNumber?.toString(),
        amount: Number.parseFloat(amount),
      }
    }

    return {
      isValid: true,
      resultCode: ResultCode.toString(),
      resultDesc: ResultDesc,
    }
  } catch (error) {
    console.error("Callback validation error:", error)
    return { isValid: false }
  }
}

// Utility function to check if M-Pesa is configured
export function isMpesaConfigured(): boolean {
  return !!(
    MPESA_CONFIG.consumer_key &&
    MPESA_CONFIG.consumer_secret &&
    MPESA_CONFIG.business_short_code &&
    MPESA_CONFIG.passkey &&
    MPESA_CONFIG.callback_url
  )
}
