-- =====================================================
-- INSERT USERS
-- =====================================================

TRUNCATE TABLE users RESTART IDENTITY CASCADE;

INSERT INTO users (email, password_hash, display_name, role, phone_number)
VALUES
('admin@vellux.com', 'hash_admin_123', 'Administrador Vellux', 'admin', '61999990000'),
('mecanico1@vellux.com', 'hash_mec_1', 'Carlos Mecânico', 'mechanic', '61999990001'),
('mecanico2@vellux.com', 'hash_mec_2', 'Fernanda Técnica', 'mechanic', '61999990002'),
('mecanico3@vellux.com', 'hash_mec_3', 'João Especialista', 'mechanic', '61999990003'),
('cliente1@email.com', 'hash_cli_1', 'Marcela Souza', 'client', '61999991001'),
('cliente2@email.com', 'hash_cli_2', 'Lucas Pereira', 'client', '61999991002'),
('cliente3@email.com', 'hash_cli_3', 'Ana Costa', 'client', '61999991003');

-- =====================================================
-- INSERT VEHICLES
-- =====================================================

INSERT INTO vehicles (owner_id, make, model, year, plate, color, vin)
VALUES
(5, 'Toyota', 'Corolla', 2022, 'ABC1D23', 'Prata', 'CHASSI000000000001'),
(6, 'Honda', 'Civic', 2021, 'XYZ9K88', 'Preto', 'CHASSI000000000002'),
(7, 'Volkswagen', 'Gol', 2020, 'QWE4R56', 'Branco', 'CHASSI000000000003');