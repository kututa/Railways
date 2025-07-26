# Kututa Railway Booking System

A modern, full-stack railway booking system built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## 🚀 Features

### User Features
- **Authentication**: Email/password registration and login with Supabase Auth
- **Train Search**: Search trains by origin, destination, and travel date
- **Real-time Seat Selection**: Interactive seat map with live availability
- **Multiple Classes**: Economy, First Class, and Business class options
- **Passenger Management**: Save passenger details for quick rebooking
- **Booking Management**: View, manage, and cancel bookings
- **PDF Tickets**: Download printable tickets
- **Real M-Pesa Integration**: Actual Safaricom M-Pesa payments with STK Push
- **Mobile Responsive**: Optimized for all devices

### Admin Features
- **Train Management**: Create, edit, and delete train schedules
- **Route Management**: Manage stations and routes
- **Booking Overview**: View and manage all bookings
- **Reports**: Generate booking and revenue reports

### Technical Features
- **Real-time Updates**: Live seat availability using Supabase Realtime
- **Row Level Security**: Secure data access with Supabase RLS
- **Seat Locking**: Prevent double bookings during selection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **M-Pesa API Integration**: Real-time STK Push and callback handling
- **Payment Status Tracking**: Automatic payment verification and status updates
- **Secure Payment Processing**: Production-ready M-Pesa integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel
- **Payment Gateway**: Safaricom M-Pesa API

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🚀 Quick Start

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd kututa-railway
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Database Setup

1. In your Supabase dashboard, go to SQL Editor
2. Run the SQL scripts in order:
   - `scripts/01-create-tables.sql` - Creates all tables and RLS policies
   - `scripts/02-seed-data.sql` - Inserts sample data

### 4. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## 📊 Database Schema

### Core Tables
- **users**: User profiles and roles
- **stations**: Railway stations
- **routes**: Train routes between stations  
- **trains**: Train schedules and details
- **train_classes**: Class types and pricing
- **seats**: Individual seat information
- **bookings**: Ticket bookings
- **passengers**: Saved passenger information
- **payments**: Payment records
- **seat_locks**: Temporary seat reservations

### Key Relationships
- Routes connect origin and destination stations
- Trains operate on specific routes
- Train classes define seating and pricing per train
- Bookings link users, trains, passengers, and seats
- Seat locks prevent double booking during selection

## 🔐 Authentication & Authorization

### User Roles
- **User**: Can search trains, book tickets, manage bookings
- **Admin**: Full system access including train/route management

### Security Features
- Row Level Security (RLS) policies
- JWT-based authentication
- Role-based access control
- Secure API endpoints

## 🎨 UI/UX Features

### Design System
- **Colors**: Deep Blue (#1e3a8a), Soft Yellow (#facc15)
- **Components**: shadcn/ui component library
- **Responsive**: Mobile-first design
- **Animations**: Smooth transitions and loading states

### Key Components
- Interactive seat selection grid
- Real-time availability updates
- Modern booking flow
- Downloadable ticket generation

## 🚂 Available Routes

### Current Routes
1. **Mombasa ↔ Nairobi** (Madaraka Express)
   - Distance: 485 km
   - Duration: 8 hours
   - Classes: Economy, First Class, Business

2. **Nairobi ↔ Naivasha** (Naivasha Commuter)
   - Distance: 90 km  
   - Duration: 2 hours
   - Classes: Economy, First Class

## 💳 M-Pesa Integration

#### Real M-Pesa Payments
- **STK Push**: Direct payment prompts to customer phones
- **Automatic Verification**: Real-time payment status checking
- **Callback Processing**: Secure M-Pesa payment confirmations
- **Status Tracking**: Live payment status updates

#### Supported Payment Methods
- **M-Pesa**: Real Safaricom M-Pesa integration with STK Push
- **Credit/Debit Cards**: Simulated for demo purposes
- **Bank Transfer**: Simulated for demo purposes

#### M-Pesa Payment Flow
1. Customer enters M-Pesa phone number
2. System initiates STK Push via Safaricom API
3. Customer receives payment prompt on phone
4. Customer enters M-Pesa PIN to complete payment
5. System automatically detects payment completion
6. Booking confirmed and ticket generated

#### Environment Support
- **Sandbox**: Testing with Safaricom sandbox environment
- **Production**: Live M-Pesa transactions
- **Demo Fallback**: Simulated payments when M-Pesa not configured

## 📱 Mobile Experience

- Responsive design for all screen sizes
- Touch-friendly seat selection
- Optimized forms and navigation
- Fast loading and smooth animations
- Offline-capable ticket viewing

## 🔧 Development

### Project Structure
\`\`\`
kututa-railway/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── booking/           # Booking flow
│   ├── dashboard/         # User dashboard
│   └── search/            # Train search
├── components/            # Reusable components
│   ├── booking/          # Booking-specific components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                  # Utilities and configurations
├── scripts/              # Database scripts
└── public/               # Static assets
\`\`\`

### Key Components
- `SeatSelection`: Interactive seat map with real-time updates
- `AuthProvider`: Authentication context and state management
- `Header`: Navigation with user menu
- `BookingConfirmation`: Ticket display and download

### API Integration
- Supabase client for database operations
- Real-time subscriptions for seat updates
- Row Level Security for data protection
- Optimistic updates for better UX

## 💰 M-Pesa Setup

### Prerequisites
1. **Safaricom Developer Account**: Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. **M-Pesa App**: Create app with "Lipa Na M-Pesa Online" product
3. **Business Shortcode**: Paybill or Till Number from Safaricom
4. **Public HTTPS URL**: For M-Pesa callbacks

### Required Environment Variables
\`\`\`env
# M-Pesa API Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=your_business_shortcode
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
\`\`\`

### Getting M-Pesa Credentials

#### 1. Safaricom Developer Portal
- Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
- Create new app and select "Lipa Na M-Pesa Online"
- Copy Consumer Key and Consumer Secret

#### 2. Business Shortcode
- **Sandbox**: Use `174379` for testing
- **Production**: Your actual Paybill/Till Number

#### 3. Passkey
- **Sandbox**: Provided test passkey
- **Production**: Obtained after Safaricom approval

#### 4. Callback URL
- Must be publicly accessible HTTPS URL
- Example: `https://your-app.vercel.app/api/mpesa/callback`
- For local development, use ngrok or similar

### Testing M-Pesa Integration

#### Sandbox Test Numbers
\`\`\`
254708374149 - Successful payment
254711111111 - Insufficient funds
254722222222 - General test number
\`\`\`

#### Test Scenarios
1. **Successful Payment**: Use test numbers with sufficient balance
2. **Failed Payment**: Use insufficient funds number
3. **Timeout**: Don't respond to STK push
4. **Cancelled**: Cancel payment on phone

### Local Development Setup
\`\`\`bash
# Install ngrok for local callback testing
npm install -g ngrok

# Start your app
npm run dev

# In another terminal, expose local server
ngrok http 3000

# Use the HTTPS URL for MPESA_CALLBACK_URL
# Example: https://abc123.ngrok.io/api/mpesa/callback
\`\`\`

### Production Deployment
1. Deploy app to Vercel/your hosting platform
2. Update `MPESA_CALLBACK_URL` with production URL
3. Switch to production M-Pesa credentials
4. Test with real phone numbers and small amounts

### M-Pesa API Endpoints
- **POST /api/mpesa/stk-push**: Initiate STK Push payment
- **POST /api/mpesa/callback**: Handle M-Pesa payment callbacks
- **POST /api/mpesa/status**: Check payment status manually

### Security Considerations
- Never commit M-Pesa credentials to version control
- Use HTTPS only for callback URLs
- Validate all callback requests
- Implement proper error handling and logging
- Configure IP whitelisting in Safaricom portal

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# M-Pesa Configuration (Optional - falls back to demo mode)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_business_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
\`\`\`

## 🧪 Demo Credentials

### User Account
- **Email**: user@demo.com
- **Password**: password123

### Admin Account  
- **Email**: admin@kututa.com
- **Password**: admin123

## 📈 Future Enhancements

### Planned Features
- **Real Payment Integration**: Stripe, M-Pesa API
- **Email Notifications**: Booking confirmations and reminders
- **SMS Integration**: Ticket delivery via SMS
- **Multi-language Support**: Swahili and English
- **Loyalty Program**: Points and rewards system
- **Advanced Analytics**: Revenue and usage reports
- **Mobile App**: React Native companion app
- **Multi-Payment Gateway**: Stripe, PayPal integration alongside M-Pesa
- **Payment Analytics**: Detailed payment success rates and analytics
- **Recurring Payments**: Subscription-based travel packages
- **Payment Reconciliation**: Advanced financial reporting tools

### Technical Improvements
- **Caching**: Redis for improved performance
- **CDN**: Image and asset optimization
- **Monitoring**: Error tracking and performance monitoring
- **Testing**: Unit and integration tests
- **CI/CD**: Automated testing and deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: support@kututa.com
- **Documentation**: [docs.kututa.com](https://docs.kututa.com)
- **Issues**: GitHub Issues tab
- **M-Pesa Issues**: apisupport@safaricom.co.ke
- **Payment Support**: payments@kututa.com

## 🙏 Acknowledgments

- **Supabase**: For the excellent backend-as-a-service platform
- **shadcn/ui**: For the beautiful component library
- **Vercel**: For seamless deployment and hosting
- **Tailwind CSS**: For the utility-first CSS framework

---

**Built with ❤️ for modern railway transportation in Kenya**
# Railways
