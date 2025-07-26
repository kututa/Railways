-- Insert stations
INSERT INTO stations (name, code, city) VALUES
('Mombasa Central', 'MSA', 'Mombasa'),
('Nairobi Central', 'NRB', 'Nairobi'),
('Naivasha', 'NVS', 'Naivasha');

-- Insert routes
INSERT INTO routes (name, origin_station_id, destination_station_id, distance_km, duration_minutes)
SELECT 
    'Mombasa - Nairobi',
    (SELECT id FROM stations WHERE code = 'MSA'),
    (SELECT id FROM stations WHERE code = 'NRB'),
    485,
    480
UNION ALL
SELECT 
    'Nairobi - Mombasa',
    (SELECT id FROM stations WHERE code = 'NRB'),
    (SELECT id FROM stations WHERE code = 'MSA'),
    485,
    480
UNION ALL
SELECT 
    'Nairobi - Naivasha',
    (SELECT id FROM stations WHERE code = 'NRB'),
    (SELECT id FROM stations WHERE code = 'NVS'),
    90,
    120
UNION ALL
SELECT 
    'Naivasha - Nairobi',
    (SELECT id FROM stations WHERE code = 'NVS'),
    (SELECT id FROM stations WHERE code = 'NRB'),
    90,
    120;

-- Insert trains
INSERT INTO trains (name, number, route_id, departure_time, arrival_time)
SELECT 
    'Madaraka Express',
    'ME001',
    (SELECT id FROM routes WHERE name = 'Mombasa - Nairobi'),
    '08:00:00',
    '16:00:00'
UNION ALL
SELECT 
    'Madaraka Express',
    'ME002',
    (SELECT id FROM routes WHERE name = 'Nairobi - Mombasa'),
    '08:00:00',
    '16:00:00'
UNION ALL
SELECT 
    'Naivasha Commuter',
    'NC001',
    (SELECT id FROM routes WHERE name = 'Nairobi - Naivasha'),
    '07:00:00',
    '09:00:00'
UNION ALL
SELECT 
    'Naivasha Commuter',
    'NC002',
    (SELECT id FROM routes WHERE name = 'Naivasha - Nairobi'),
    '17:00:00',
    '19:00:00';

-- Insert train classes for Madaraka Express (Mombasa-Nairobi)
INSERT INTO train_classes (train_id, class_type, total_seats, price_per_km)
SELECT 
    (SELECT id FROM trains WHERE number = 'ME001'),
    'economy',
    372,
    2.50
UNION ALL
SELECT 
    (SELECT id FROM trains WHERE number = 'ME001'),
    'first_class',
    60,
    5.00
UNION ALL
SELECT 
    (SELECT id FROM trains WHERE number = 'ME001'),
    'business',
    18,
    8.00;

-- Insert train classes for Madaraka Express (Nairobi-Mombasa)
INSERT INTO train_classes (train_id, class_type, total_seats, price_per_km)
SELECT 
    (SELECT id FROM trains WHERE number = 'ME002'),
    'economy',
    372,
    2.50
UNION ALL
SELECT 
    (SELECT id FROM trains WHERE number = 'ME002'),
    'first_class',
    60,
    5.00
UNION ALL
SELECT 
    (SELECT id FROM trains WHERE number = 'ME002'),
    'business',
    18,
    8.00;

-- Insert train classes for Naivasha Commuter
INSERT INTO train_classes (train_id, class_type, total_seats, price_per_km)
SELECT 
    (SELECT id FROM trains WHERE number = 'NC001'),
    'economy',
    200,
    1.80
UNION ALL
SELECT 
    (SELECT id FROM trains WHERE number = 'NC001'),
    'first_class',
    40,
    3.50;

INSERT INTO train_classes (train_id, class_type, total_seats, price_per_km)
SELECT 
    (SELECT id FROM trains WHERE number = 'NC002'),
    'economy',
    200,
    1.80
UNION ALL
SELECT 
    (SELECT id FROM trains WHERE number = 'NC002'),
    'first_class',
    40,
    3.50;

-- Generate seats for Economy class (ME001)
INSERT INTO seats (train_class_id, seat_number, is_window)
SELECT 
    tc.id,
    CONCAT(
        CASE 
            WHEN ((row_number() OVER () - 1) / 4) + 1 <= 9 THEN '0' || (((row_number() OVER () - 1) / 4) + 1)::text
            ELSE (((row_number() OVER () - 1) / 4) + 1)::text
        END,
        CASE (row_number() OVER () - 1) % 4
            WHEN 0 THEN 'A'
            WHEN 1 THEN 'B'
            WHEN 2 THEN 'C'
            WHEN 3 THEN 'D'
        END
    ),
    CASE (row_number() OVER () - 1) % 4 WHEN 0 THEN true WHEN 3 THEN true ELSE false END
FROM 
    train_classes tc,
    generate_series(1, 372) as seat_num
WHERE tc.train_id = (SELECT id FROM trains WHERE number = 'ME001') 
AND tc.class_type = 'economy';

-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
BEGIN
    -- This would typically be done through Supabase Auth UI or API
    -- For demo purposes, we'll create a placeholder
    INSERT INTO users (id, email, full_name, role) 
    VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'admin@kututa.com',
        'System Administrator',
        'admin'
    ) ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT create_admin_user();
