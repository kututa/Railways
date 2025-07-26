-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE train_class AS ENUM ('economy', 'first_class', 'business');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stations table
CREATE TABLE public.stations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes table
CREATE TABLE public.routes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    origin_station_id UUID REFERENCES stations(id),
    destination_station_id UUID REFERENCES stations(id),
    distance_km INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trains table
CREATE TABLE public.trains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    number TEXT NOT NULL UNIQUE,
    route_id UUID REFERENCES routes(id),
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Train classes table
CREATE TABLE public.train_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    train_id UUID REFERENCES trains(id),
    class_type train_class NOT NULL,
    total_seats INTEGER NOT NULL,
    price_per_km DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seats table
CREATE TABLE public.seats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    train_class_id UUID REFERENCES train_classes(id),
    seat_number TEXT NOT NULL,
    is_window BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(train_class_id, seat_number)
);

-- Passengers table (saved passenger info for quick rebooking)
CREATE TABLE public.passengers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    full_name TEXT NOT NULL,
    id_number TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    train_id UUID REFERENCES trains(id),
    passenger_id UUID REFERENCES passengers(id),
    seat_id UUID REFERENCES seats(id),
    travel_date DATE NOT NULL,
    class_type train_class NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_reference TEXT NOT NULL UNIQUE,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    status payment_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seat locks table (for preventing double booking during selection)
CREATE TABLE public.seat_locks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seat_id UUID REFERENCES seats(id),
    train_id UUID REFERENCES trains(id),
    travel_date DATE NOT NULL,
    user_id UUID REFERENCES users(id),
    locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seat_id, train_id, travel_date)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_locks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Passengers policies
CREATE POLICY "Users can view own passengers" ON passengers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own passengers" ON passengers FOR ALL USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments 
FOR SELECT USING (auth.uid() = (SELECT user_id FROM bookings WHERE id = booking_id));

-- Seat locks policies
CREATE POLICY "Users can manage own seat locks" ON seat_locks FOR ALL USING (auth.uid() = user_id);

-- Admin policies (users with admin role can access everything)
CREATE POLICY "Admins can view all data" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage all bookings" ON bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
