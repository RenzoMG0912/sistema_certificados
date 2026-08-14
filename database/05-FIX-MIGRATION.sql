-- Archivo: database/05-FIX-MIGRATION.sql
-- Migración de corretivo para la base teamhsec en Plesk
-- Corrige:
--   1) Columna password faltante en participantes (causa del modo "Mock DB")
--   2) Password bcrypt(DNI) para alumnos ya existentes
--   3) cursos.firma_id en NULL (el certificado nuevo salía con 1 sola firma)
--   4) cursos.temario en NULL (el reverso del certificado salía vacío)

-- 1. Agregar columna password a participantes (seguridad: bcrypt del DNI del alumno)
-- IF NOT EXISTS: MariaDB 10.4+ (lo usa Plesk). Si tu BD es MySQL y da "Duplicate column",
-- significa que la columna ya existe y puedes continuar sin problema.
ALTER TABLE participantes ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL AFTER examen_medico;

-- 2. Asignar password = bcrypt(DNI) a los alumnos ya registrados
UPDATE participantes SET password = '$2a$10$r.Oj0jeTJc93PKb7qZa0BOz4t9lcsZOERbK3p32YzBDIEKu36IyLa' WHERE dni = '00000000';
UPDATE participantes SET password = '$2a$10$ZPXwW3gLzAi02IkdWT6VcOCztYsV5xX1/y/MWx/Cq161MJ3a/S6LC' WHERE dni = '87654321';
UPDATE participantes SET password = '$2a$10$w8WLb2cyWCWOyqIuvs5kp.9833ar9thgJ7BPDoxj7dSJCn1t6aQZa' WHERE dni = '23456789';
UPDATE participantes SET password = '$2a$10$Tci1bgPHuUawTSxVWq5MBOxPQzI6SyGY9ttHdbC5TzARh5nMiA1jm' WHERE dni = '34567890';
UPDATE participantes SET password = '$2a$10$PP51.vuopaZndpm89TeEyO2Z/yWUmd42bHg8CI7tOvaunL9.cbvLy' WHERE dni = '45678901';
UPDATE participantes SET password = '$2a$10$YumFU/M1XMpVdCBi3ADGROs4oZUrKf/3QCfgTc3UbLZgRgjbql77C' WHERE dni = '56789012';
UPDATE participantes SET password = '$2a$10$plYuFmlKRf5JBsl19hJPFex/4PgaI9Qqcn1ZQj06MrMDX6knbJdoy' WHERE dni = '67890123';
UPDATE participantes SET password = '$2a$10$yM9Qij.JPZyk5UP5GB/qNu9TmJ2wxX7cvKDYFlATDurgFRceZcaBC' WHERE dni = '78901234';
UPDATE participantes SET password = '$2a$10$lhJmck0bpTpNA41uCJM1h.By0.f8qEDE7/jruLQd7K3QGvq7mgeVy' WHERE dni = '89012345';
UPDATE participantes SET password = '$2a$10$J7MiLdDbfv2ch4XgSWUpGu9Z.ft10ielpwepecQBJg67wxXqxf7cu' WHERE dni = '90123456';
UPDATE participantes SET password = '$2a$10$VRUlX2TK4SLAK843GNCy5e3A4nphqrs8KKIJD6st9oVHR196yLi9u' WHERE dni = '01234567';
UPDATE participantes SET password = '$2a$10$9hWk5nsvDyees2Gnw2/WRek5uys/FG40XEx/XOS7Z15EyrYmR4luK' WHERE dni = '12345098';
UPDATE participantes SET password = '$2a$10$Q0ZaPFEbrsRgzGz7CPNWZepUblcBQXO48I47/dVdnPzlXh6vCCgwK' WHERE dni = '23456109';
UPDATE participantes SET password = '$2a$10$d.ANAfIt9G7MvS8K.DFl2umz7696Fn0OST2hmijNGMFLwqg.WqQ/S' WHERE dni = '34567120';
UPDATE participantes SET password = '$2a$10$7NT0NRQyebYb14qMBTMDnePA.vUUyr0nXhipOYYzX4bKEKdSiaaY.' WHERE dni = '73125622';
UPDATE participantes SET password = '$2a$10$rkmUOw3ubl08IKKJmDKpg.iG93oXbEzHTDWgk5nAcTjrAA1yR4zPe' WHERE dni = '20108604';
UPDATE participantes SET password = '$2a$10$sQ5oFS1R2j5MmMJJvM56Ze2bkyB0UHKxha7yBkanz9/hgDtBhjeya' WHERE dni = '70843243';
UPDATE participantes SET password = '$2a$10$3QrmOOVv.vO5MgkfOivBc.NiziH25S2VxAoChllP0m0Q80pnZYxoS' WHERE dni = '71991533';
UPDATE participantes SET password = '$2a$10$xyvBlQaI/UojSmulslTuiObz2oR/wkeIRZ/C0N3B6ERkv9YrRWcAC' WHERE dni = '44090378';
UPDATE participantes SET password = '$2a$10$Gc8X9XBBU1NR9S8pypWNeukUKPzSwkx3r22ReY310JcdMzB0mJOua' WHERE dni = '40433699';
UPDATE participantes SET password = '$2a$10$IwK3lwe1JOjm5jpbmI2YwOKoGlccFZd3lpxGxl40nDYRHl9.gbckK' WHERE dni = '76345274';
UPDATE participantes SET password = '$2a$10$0tQoEjmDcf.12C1Si3Qryutb8dNQBsIOgSOaNY3eS5MEtqyVZuyqS' WHERE dni = '70923022';
UPDATE participantes SET password = '$2a$10$TtFUwwp4CERj7HI/dbO.AOEhe0apyvz2vEC0DiYcXNSJaDbvJqOxC' WHERE dni = '77268846';
UPDATE participantes SET password = '$2a$10$7pTcEj9e0vQEOmTNx8.jpeCqY53dksB7/BUqQbs6Z5MnJ3E5iBqQK' WHERE dni = '04056666';
UPDATE participantes SET password = '$2a$10$7iNLjpEnyoy2xJc3YA.8lO.Ru5/GxEUHCu.g1b8f7dfYRyGUvaGJC' WHERE dni = '70225514';
UPDATE participantes SET password = '$2a$10$dZiQO.0z7fds1sDFqBMhMePVxd1d9/Y3FzSJBsVh6mZDHf4xF080G' WHERE dni = '72960935';
UPDATE participantes SET password = '$2a$10$1ergh4D/lkV1iitj4VdGSOuOGF6g9i3Qxx.ubU6f7EkM/LLxOs0Am' WHERE dni = '77350183';
UPDATE participantes SET password = '$2a$10$n8dK1pvuFx3N3Bbd7JxB7OhOoZ6eajtdmVeYBvJUfpxNl2YyDwpmq' WHERE dni = '20106190';
UPDATE participantes SET password = '$2a$10$oiBz85c/HRfj0Lc19K2ZluFtPOHXjRiyCtfM6SWmIqUTzLwoU9AuW' WHERE dni = '70249043';

-- 3. Vincular a todos los cursos la firma del Entrenador (id 2) para la firma 2 del certificado
UPDATE cursos SET firma_id = 2 WHERE firma_id IS NULL;

-- 4. Cargar el temario de cada curso (reverso del certificado)
UPDATE cursos SET temario = '1. Introducción a la respuesta a emergencias\n2. Tipos de emergencias mineras\n3. Plan de emergencia\n4. Evacuación y procedimientos\n5. Primeros auxilios\n6. Simulacros' WHERE codigo_curso = 'respuesta-emergencias';
UPDATE cursos SET temario = '1. Normativa de trabajo en altura\n2. Equipos de protección contra caídas\n3. Inspección de equipos\n4. Anclajes y sistemas de detención\n5. Uso de plataformas elevadas' WHERE codigo_curso = 'trabajo-altura';
UPDATE cursos SET temario = '1. Clasificación de equipos móviles\n2. Operación segura\n3. Mantenimiento preventivo\n4. Cambio de llantas\n5. Riesgos y prevención' WHERE codigo_curso = 'equipos-moviles';
UPDATE cursos SET temario = '1. Conceptos de LOTO\n2. Procedimiento de aislamiento\n3. Dispositivos de bloqueo\n4. Verificación de energía cero\n5. Retirada de candados' WHERE codigo_curso = 'aislamiento-bloqueo';
UPDATE cursos SET temario = '1. Riesgos eléctricos\n2. Normativa eléctrica\n3. EPP dieléctrico\n4. Bloqueo y etiquetado\n5. Trabajo seguro con energía' WHERE codigo_curso = 'seguridad-electrica';
UPDATE cursos SET temario = '1. Conceptos de izaje\n2. Eslingas y accesorios\n3. Carga y descarga\n4. Señalización\n5. Riesgos en izaje' WHERE codigo_curso = 'elevacion-izaje';
UPDATE cursos SET temario = '1. Triángulo del fuego\n2. Agentes extintores\n3. Uso de extintores\n4. Evacuación por incendio\n5. Simulacros de incendio' WHERE codigo_curso = 'incendio-explosion';
UPDATE cursos SET temario = '1. Clasificación de herramientas\n2. Uso correcto\n3. Inspección y mantenimiento\n4. EPP para herramientas\n5. Riesgos y prevención' WHERE codigo_curso = 'herramientas-manuales';
UPDATE cursos SET temario = '1. Introducción\n2. Normativa aplicable\n3. Definición de Materiales Peligrosos\n4. Accidentes con Materiales Peligrosos\n5. Incidente con Materiales Peligrosos\n6. Niveles de Entrenamiento\n7. Sistema de Reconocimiento\n8. Clasificación de Materiales Peligrosos\n9. Rombo NFPA 704\n10. Comportamiento de Sustancias Peligrosas\n11. Placa DOT\n12. Comunidad Europea\n13. Ficha de Datos de Seguridad (FDS)\n14. Uso de Guía GRE' WHERE codigo_curso = 'sustancias-quimicas';