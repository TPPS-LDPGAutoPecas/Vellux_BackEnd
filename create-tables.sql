-- Habilitar a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'mechanic', 'client');
CREATE TYPE appointment_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE service_status AS ENUM ('queued', 'in_progress', 'completed');

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(100),
    model VARCHAR(100) NOT NULL,
    year INT,
    plate VARCHAR(20) UNIQUE,
    color VARCHAR(50),
    vin VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP NOT NULL,
    car_model_info VARCHAR(150) NOT NULL,
    google_calendar_id VARCHAR(255),
    status appointment_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Services (OS / Check-in)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    appointment_id UUID REFERENCES appointments(id),
    status service_status DEFAULT 'queued',
    evaluation_rating INT CHECK (evaluation_rating >= 1 AND evaluation_rating <= 5),
    evaluation_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

-- 5. Service Mechanics (Atribuição)
CREATE TABLE service_mechanics (
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    mechanic_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, mechanic_id)
);

-- 6. Service Logs (Tempo Real)
CREATE TABLE service_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    mechanic_id UUID NOT NULL REFERENCES users(id),
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Service Checkouts (Finalização)
CREATE TABLE service_checkouts (
    service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
    service_type VARCHAR(150) NOT NULL,
    summary TEXT NOT NULL,
    methodology TEXT NOT NULL,
    total_value DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Spare Parts (Peças Trocadas)
CREATE TABLE spare_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL
);
