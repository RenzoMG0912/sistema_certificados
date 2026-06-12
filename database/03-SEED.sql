-- Archivo: database/03-SEED.sql
-- Datos semilla para inicializar el sistema de certificados de TEAM HSEC (Versión MySQL)

-- 1. Insertar Administrador por defecto
-- Contraseña plana: Admin123!
INSERT IGNORE INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador TEAM HSEC', 'admin@teamhsec.com', '$2a$10$3uZfeKaIhPWE/.pFg3E91OCERgluKSvckiNnx8PGihKATRbTNGKye', 'admin');

-- 2. Insertar Cursos Autorizados
INSERT IGNORE INTO cursos (codigo_curso, nombre, duracion, categoria, entrenador) VALUES
('respuesta-emergencias', 'Respuesta a emergencias', '2 horas', 'Seguridad', 'Ing. Gregorio A. Escajadillo Sarmiento'),
('trabajo-altura', 'Trabajo en altura y plataforma elevada', '4 horas', 'Seguridad', 'Ing. Gregorio A. Escajadillo Sarmiento'),
('equipos-moviles', 'Equipos móviles / Manejo de llantas', '2 horas', 'Operaciones', 'Ing. Gregorio A. Escajadillo Sarmiento'),
('aislamiento-bloqueo', 'Aislamiento y bloqueo (LOTO)', '3 horas', 'Seguridad', 'Ing. Gregorio A. Escajadillo Sarmiento'),
('seguridad-electrica', 'Seguridad eléctrica', '3 horas', 'Seguridad', 'Ing. Gregorio A. Escajadillo Sarmiento'),
('elevacion-izaje', 'Elevación / izaje de cargas', '2 horas', 'Operaciones', 'Ing. Gregorio A. Escajadillo Sarmiento'),
('incendio-explosion', 'Incendio y explosión', '2 horas', 'Seguridad', 'Ing. Gregorio A. Escajadillo Sarmiento'),
('herramientas-manuales', 'Herramientas manuales y de poder', '2 horas', 'Operaciones', 'Ing. Gregorio A. Escajadillo Sarmiento'),
('sustancias-quimicas', 'Sustancias químicas', '2 horas', 'Salud Ocupacional', 'Ing. Gregorio A. Escajadillo Sarmiento');

-- 3. Insertar Firmas Autorizadas de prueba
INSERT IGNORE INTO firmas (nombre, cargo, firma_url) VALUES
('Ing. Gregorio A. Escajadillo Sarmiento', 'Instructor HSEC', '/assets/img/firmas/firma_gregorio.png'),
('Representante Legal', 'Gerente General', '/assets/img/firmas/firma_gerente.png');

-- 4. Participante Demo
INSERT IGNORE INTO participantes (nombres, dni, email) VALUES
('Usuario Demo', '00000000', 'demo@teamhsec.local');
