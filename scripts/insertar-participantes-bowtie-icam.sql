-- Archivo: scripts/insertar-participantes-bowtie-icam.sql
-- Inserta SOLO los participantes (usuarios) de los cursos Bow Tie e ICAM (agosto 2026).
-- 5 participantes unicos (los mismos alumnos en ambos cursos).
-- Idempotente: usa INSERT IGNORE (no duplica si el DNI ya existe).
-- Ejecutar contra la BD de produccion (Plesk), ejemplo:
--   mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < scripts/insertar-participantes-bowtie-icam.sql

INSERT IGNORE INTO participantes (nombres, dni, cargo, telefono, procedencia, induccion, examen_medico, password)
VALUES ('ALIAGA CHAMBERGO CRISTHIAM SMITH', '46705970', 'supervisor O&M', '979 839 438', 'HUANCAYO', 'APTO', 'APTO', '$2a$10$EtJOp27SXII7eAEbA6e.MeQ3k0aX.VGcBZVyLf7dWdNT0xS2T9fJ2');

INSERT IGNORE INTO participantes (nombres, dni, cargo, telefono, procedencia, induccion, examen_medico, password)
VALUES ('COTERA CORONEL EDGAR', '46457296', 'supervisor civil', '973 191 083', 'HUANCAYO', 'APTO', 'APTO', '$2a$10$9ZxOODHHDsPZ8co/JTH2w.vRECUKpZ7lAQn.tx9wm6zy3Krad/eai');

INSERT IGNORE INTO participantes (nombres, dni, cargo, telefono, procedencia, induccion, examen_medico, password)
VALUES ('VILCAPOMA CAPCHA FRANK DINO', '44055232', 'supervisor de seguridad', '989 672 776', 'HUANCAYO', 'APTO', 'APTO', '$2a$10$FBciH/rJmTKq01BHAfcbB.k3XhjooeKqXIgZVxLTigsL.5FQLLiuS');

INSERT IGNORE INTO participantes (nombres, dni, cargo, telefono, procedencia, induccion, examen_medico, password)
VALUES ('ASTO PINO ALEXANDER JHON', '40644366', 'supervisor de seguridad', '904 742 917', 'HUANCAYO', 'APTO', 'APTO', '$2a$10$TRumZFp8UKYOSDAKFD3B8e5ynemfw.hGiZ6KCj7SmoVrrAJLI8HrW');

INSERT IGNORE INTO participantes (nombres, dni, cargo, telefono, procedencia, induccion, examen_medico, password)
VALUES ('FERNANDEZ EVANGELISTA LENIN', '73461387', 'supervisor de seguridad', '948 998 334', 'PASCO', 'APTO', 'APTO', '$2a$10$WE9Nl5QSy5cc/bDVSDvfp.ENCzVmIK.G3OV3zyWjpBDnjsigsNRJ2');