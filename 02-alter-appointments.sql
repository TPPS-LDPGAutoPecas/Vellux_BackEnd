-- Adiciona o valor 'rejected' no ENUM 'appointment_status' se não existir
DO $$ 
BEGIN
    ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'rejected';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adiciona a coluna 'rejection_reason' na tabela 'appointments'
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
