-- =====================================================
-- VELLUX MOTORS DATABASE
-- PostgreSQL
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'mechanic', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'requested',
        'confirmed',
        'cancelled',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_status AS ENUM (
        'pending',
        'in_progress',
        'awaiting_parts',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'info',
        'alert',
        'success'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 1. USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL,
    phone_number VARCHAR(20),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. VEHICLES
-- =====================================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(100),
    model VARCHAR(100) NOT NULL,
    year INT CHECK (
        year >= 1900
        AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1
    ),
    plate VARCHAR(20) UNIQUE,
    color VARCHAR(50),
    vin VARCHAR(100) UNIQUE,
    last_maintenance TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. APPOINTMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP NOT NULL,
    service_type VARCHAR(150) NOT NULL,
    notes TEXT,
    google_calendar_id VARCHAR(255),
    status appointment_status DEFAULT 'requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. SERVICES
-- =====================================================

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    client_id UUID NOT NULL REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status service_status DEFAULT 'pending',
    scheduled_date TIMESTAMP NOT NULL,
    start_date TIMESTAMP,
    finished_at TIMESTAMP,
    budget DECIMAL(10,2),
    evaluation_rating INT CHECK (
        evaluation_rating BETWEEN 1 AND 5
    ),
    evaluation_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. SERVICE MECHANICS
-- =====================================================

CREATE TABLE IF NOT EXISTS service_mechanics (
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    mechanic_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, mechanic_id)
);

-- =====================================================
-- 6. SERVICE LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS service_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    mechanic_id UUID NOT NULL REFERENCES users(id),
    status service_status NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. TECHNICAL REPORTS
-- =====================================================

CREATE TABLE IF NOT EXISTS technical_reports (
    service_id UUID PRIMARY KEY
        REFERENCES services(id) ON DELETE CASCADE,
    service_name VARCHAR(150) NOT NULL,
    procedures JSONB NOT NULL,
    diagnostics TEXT,
    recommendations TEXT,
    observations TEXT,
    final_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. SPARE PARTS
-- =====================================================

CREATE TABLE IF NOT EXISTS spare_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL
        REFERENCES technical_reports(service_id)
        ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(100),
    brand VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- =====================================================
-- 9. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);

CREATE INDEX IF NOT EXISTS idx_vehicles_owner
ON vehicles(owner_id);

CREATE INDEX IF NOT EXISTS idx_appointments_client
ON appointments(client_id);

CREATE INDEX IF NOT EXISTS idx_appointments_vehicle
ON appointments(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_services_vehicle
ON services(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_services_client
ON services(client_id);

CREATE INDEX IF NOT EXISTS idx_logs_service
ON service_logs(service_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);