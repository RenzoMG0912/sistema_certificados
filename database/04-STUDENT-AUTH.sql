-- Archivo: database/04-STUDENT-AUTH.sql
-- Agregar autenticación estudiantil a la tabla participantes

-- Agregar columna password (bcrypt hash del DNI)
ALTER TABLE participantes ADD COLUMN password VARCHAR(255) NULL AFTER examen_medico;

-- Actualizar registros existentes: password = bcrypt(dni)
-- Nota: Ejecutar después del seed inicial o usar el script de migración
-- UPDATE participantes SET password = '$2a$10$Y5L3kWD9zdf/jqiMWB4D1evozZM05WCikRLVWOgasIaQa./BGiqr6' WHERE dni = '00000000';
