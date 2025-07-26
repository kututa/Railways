# M-Pesa Integration Setup Guide

This guide will help you set up the Safaricom M-Pesa API integration for real payments.

## Prerequisites

1. **Safaricom Developer Account**: Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. **M-Pesa App**: Create an M-Pesa app in the developer portal
3. **Business Shortcode**: Get a business shortcode (Paybill or Till Number)

## Environment Variables

Add these variables to your `.env.local` file:

\`\`\`env
# M-Pesa API Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=your_business_shortcode
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# Set to 'production' for live environment
NODE_ENV=development
\`\`\`

## Getting M-Pesa Credentials

### 1. Consumer Key & Consumer Secret
1. Log in to [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Go to "My Apps" and create a new app
3. Select "Lipa Na M-Pesa Online" product
4. Copy the Consumer Key and Consumer Secret

### 2. Business Shortcode
- **Sandbox**: Use `174379` for testing
- **Production**: Use your actual Paybill or Till Number

### 3. Passkey
- **Sandbox**: Use the provided test passkey
- **Production**: Get from Safaricom after approval

### 4. Callback URL
- Must be a publicly accessible HTTPS URL
- For development, use ngrok or similar tunneling service
- Example: `https://your-app.vercel.app/api/mpesa/callback`

## Sandbox vs Production

### Sandbox (Testing)
\`\`\`env
NODE_ENV=development
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
\`\`\`

### Production (Live)
\`\`\`env
NODE_ENV=production
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_actual_shortcode
MPESA_PASSKEY=your_production_passkey
\`\`\`

## Testing

### Sandbox Test Numbers
Use these phone numbers for testing in sandbox:
- `254708374149`
- `254711111111`
- `254722222222`

### Test Scenarios
1. **Successful Payment**: Use test numbers with sufficient balance
2. **Insufficient Funds**: Use `254711111111`
3. **Invalid PIN**: Enter wrong PIN 3 times
4. **Timeout**: Don't respond to STK push prompt

## Callback URL Setup

### Local Development
1. Install ngrok: `npm install -g ngrok`
2. Start your app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the HTTPS URL: `https://abc123.ngrok.io/api/mpesa/callback`

### Production
Use your deployed app URL:
`https://your-app.vercel.app/api/mpesa/callback`

## Security Considerations

1. **Environment Variables**: Never commit credentials to version control
2. **HTTPS Only**: M-Pesa requires HTTPS for callbacks
3. **IP Whitelisting**: Configure IP restrictions in Safaricom portal
4. **Callback Validation**: Always validate callback authenticity
5. **Error Handling**: Implement proper error handling and logging

## Common Issues

### 1. "Invalid Access Token"
- Check consumer key and secret
- Ensure credentials match the environment (sandbox/production)

### 2. "Invalid Shortcode"
- Verify business shortcode is correct
- Ensure shortcode is active and approved

### 3. "Callback Not Received"
- Check callback URL is publicly accessible
- Verify HTTPS is working
- Check firewall settings

### 4. "STK Push Failed"
- Verify phone number format (254XXXXXXXXX)
- Check if phone number is M-Pesa registered
- Ensure sufficient balance for testing

## Monitoring and Logs

### Enable Logging
The integration includes comprehensive logging:
- STK Push requests and responses
- Callback processing
- Payment status updates
- Error tracking

### Check Logs
\`\`\`bash
# View application logs
npm run logs

# Check specific M-Pesa logs
grep "M-Pesa" logs/app.log
\`\`\`

## Support

### Safaricom Support
- Email: apisupport@safaricom.co.ke
- Phone: +254 722 000 000
- Portal: [developer.safaricom.co.ke](https://developer.safaricom.co.ke)

### Documentation
- [M-Pesa API Documentation](https://developer.safaricom.co.ke/docs)
- [STK Push Guide](https://developer.safaricom.co.ke/lipa-na-m-pesa-online/apis/post/stkpush/v1/processrequest)
- [Callback Documentation](https://developer.safaricom.co.ke/lipa-na-m-pesa-online/apis/post/stkpushquery/v1/query)
\`\`\`

Finally, let me update the package.json to include the axios dependency:

```json file="package.json"
[v0-no-op-code-block-prefix]{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "autoprefixer": "^10.4.20",
    "axios": "^1.6.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "geist": "^1.3.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "next": "14.2.25",
    "next-themes": "^0.4.4",
    "react": "^19",
    "react-day-picker": "9.8.0",
    "react-dom": "^19",
    "react-hook-form": "^7.54.1",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.6",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8.5",
    "tailwindcss": "^3.4.17",
    "typescript": "5.7.3"
  }
}
