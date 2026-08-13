-- Archivo generado: scripts/import-certificados.js
-- Importa participantes, ediciones, matriculas y certificados de PDFs ya emitidos.
-- Idempotente: usar INSERT IGNORE / bases de datos que ya tengan los registros.
-- Ejecutar contra la BD de producción (Vercel), ejemplo:
--   mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < scripts/import.sql


-- EDICION aislamiento-bloqueo (2026-05-18)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'aislamiento-bloqueo-2026-05-18', '2026-05-18', NULL
FROM cursos cur WHERE cur.codigo_curso = 'aislamiento-bloqueo';

-- EDICION elevacion-izaje (2026-05-19)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'elevacion-izaje-2026-05-19', '2026-05-19', NULL
FROM cursos cur WHERE cur.codigo_curso = 'elevacion-izaje';

-- EDICION equipos-moviles (2026-05-17)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'equipos-moviles-2026-05-17', '2026-05-17', NULL
FROM cursos cur WHERE cur.codigo_curso = 'equipos-moviles';

-- EDICION herramientas-manuales (2026-05-19)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'herramientas-manuales-2026-05-19', '2026-05-19', NULL
FROM cursos cur WHERE cur.codigo_curso = 'herramientas-manuales';

-- EDICION incendio-explosion (2026-05-19)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'incendio-explosion-2026-05-19', '2026-05-19', NULL
FROM cursos cur WHERE cur.codigo_curso = 'incendio-explosion';

-- EDICION respuesta-emergencias (2026-05-17)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'respuesta-emergencias-2026-05-17', '2026-05-17', NULL
FROM cursos cur WHERE cur.codigo_curso = 'respuesta-emergencias';

-- EDICION seguridad-electrica (2026-05-18)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'seguridad-electrica-2026-05-18', '2026-05-18', NULL
FROM cursos cur WHERE cur.codigo_curso = 'seguridad-electrica';

-- EDICION sustancias-quimicas (2026-05-18)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'sustancias-quimicas-2026-05-18', '2026-05-18', NULL
FROM cursos cur WHERE cur.codigo_curso = 'sustancias-quimicas';

-- EDICION trabajo-altura (2026-05-17)
INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)
SELECT cur.id, 'trabajo-altura-2026-05-17', '2026-05-17', NULL
FROM cursos cur WHERE cur.codigo_curso = 'trabajo-altura';

-- PARTICIPANTES
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('ALEX TRINIDAD SOLIS', '73125622');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('ARIAS ROSALES JUAN CARLOS', '20108604');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('BERROSPI AGUILAR SERGIO ENRIQUE', '70843243');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('CAJAHUANCA ORONCOY FERNANDO MIGUEL', '71991533');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('CALLUPE ALMERCO ROY MIGUEL', '44090378');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('EDWIN C REFULIO VALLADARES', '40433699');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('GOMEZ VERGARA MANUEL ANGEL', '76345274');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('ILDEFONSO SAAVEDRA MAYCOL', '70923022');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('JAVIER BALDEON LUIS JHONATAN', '77268846');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('JUAN YALICO GONZALES', '04056666');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('LUCAS QUISPE KEVIN RUDY', '70225514');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('MENDOZA ORTEGA JERSON JUNIOR', '72960935');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('PUERTAS UBALDO CRISTHIAN YORDI', '77350183');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('ROBERTO CESPEDES LOAYZA', '20106190');
INSERT IGNORE INTO participantes (nombres, dni) VALUES ('SOLANO BASILIO LELIS DANIEL', '70249043');

-- MATRICULAS + CERTIFICADOS

-- aislamiento-bloqueo/ALEX TRINIDAD SOLIS.pdf (PE-955-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-955-26', '1393d88d1f274fc2dcf55191dd29ff41120aaba3b7fe6efd59139b34cb46dd4c', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/73125622_PE-955-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/ARIAS ROSALES JUAN CARLOS.pdf (PE-949-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-949-26', '61992ae2bb88e0cc849caf90b8532477a91f88b598c86556b6a3a3f16a0ba53b', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/20108604_PE-949-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-960-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-960-26', '719280316797e7be1781cd99f800f7f7e2c2ec86568fd96c138018efd6c8015a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/70843243_PE-960-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/CAJAHUANCA ORONCOY FERNANDO MIGUEL.pdf (PE-963-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-963-26', '403381cd7b5a5c9f2be3862ea1fa3adf4f30153723b2e6e42931a2ec236976d8', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/71991533_PE-963-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-953-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-953-26', '652089d650eee82c676b57c787ec782a6be36feefa5f1f35712a35a400e52c5d', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/44090378_PE-953-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/EDWIN C REFULIO VALLADARES.pdf (PE-962-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-962-26', '2223b8b6f8d09329273091ca77d6a912edc2381372e3e64778a12d6df4daea53', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/40433699_PE-962-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-958-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-958-26', '28b53d566b15130a60e319a636879e04adf122451064f47203a2123806525648', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/76345274_PE-958-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-959-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-959-26', 'da5b0a5966e871a9c0b2e13ee2eca1ef2144b112a54b8af89130926f9df5ab1c', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/70923022_PE-959-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/JAVIER BALDEON LUIS JHONATAN.pdf (PE-954-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-954-26', '74836f50cef1525b396c09efda32cc188f3c3e16a62d732484c83f9061b98348', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/77268846_PE-954-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/JUAN YALICO GONZALES.pdf (PE-951-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-951-26', '87f67dbd0181a85b9607112699caee3ab9d556d394ea6e5441e2eebfaad9dbeb', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/04056666_PE-951-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/LUCAS QUISPE KEVIN RUDY.pdf (PE-957-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-957-26', '8b0d2cabab9000f533ab3201df71bf5e1389e7d38851cd537c5a517731985ee1', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/70225514_PE-957-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-961-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-961-26', 'd8703fb029247bdd118831e2c8b840d920b83f17da5afc941303f562a08eb46f', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/72960935_PE-961-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-952-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-952-26', '382b96b1165a8ab6e158ede01d21edaf15bfebde7d887431e988d5d63e98e68f', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/77350183_PE-952-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/ROBERTO CESPEDES LOAYZA.pdf (PE-950-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-950-26', '3dadfb7e98d6abcb04e3e95b8c07652fa4004f6b8e7bb8360711687b0d50f9e3', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/20106190_PE-950-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- aislamiento-bloqueo/SOLANO BASILIO LELIS DANIEL.pdf (PE-956-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-956-26', '34334e955e87c063a9e9d04cdb44e615afba5ead7d368fa771be7ea1c46bf27e', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-22', '2027-05-22', '/certificados/aislamiento-bloqueo/70249043_PE-956-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'aislamiento-bloqueo-2026-05-18';

-- elevacion-izaje/ALEX TRINIDAD SOLIS.pdf (PE-987-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-987-26', '3e1b24b03076509643f7dcfbb978cb6582aff0828cd2c17099cb6aea0ed9b6a5', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/73125622_PE-987-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/ARIAS ROSALES JUAN CARLOS.pdf (PE-981-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-981-26', '7b15f7dc4e092c52a298166da3fc7b7ba106ba05741aac1b3701de4ddd95e761', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/20108604_PE-981-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-992-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-992-26', '573e55c818b2ac35d4c897dd2de39fad37e33e299dfd80d780256cb4aad188d5', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/70843243_PE-992-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/CAJAHUANCA ORONCOY FERNANDO MIGUEL.pdf (PE-996-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-996-26', '4de6be6d72bd8de528bdb8a9cb4b807a138d70cea6fe3bb9931353ae4081cdec', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/71991533_PE-996-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-985-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-985-26', 'f0d5226af9b3110cf7ee41ad39fa990daedc1a10d762236cec450a718a9f3b11', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/44090378_PE-985-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/EDWIN C REFULIO VALLADARES.pdf (PE-994-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-994-26', 'dc6804f562b1f9847f5d7aa9737cc260776dfacecf0074851b2162f7253ffabe', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/40433699_PE-994-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-990-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-990-26', '187ccd4e2146cf4b192314871a36a0c64ac9d96246d5121eda8d8af806d3995f', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/76345274_PE-990-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-991-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-991-26', '06452f4013c15955174207dadaae74e2067d04da09cefe1d61674e7526684ea0', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/70923022_PE-991-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/JAVIER BALDEON LUIS JHONATAN.pdf (PE-986-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-986-26', 'c15c426220c207a44c42b813790a6fe3683ab124666ec0e7846853e565e7b1b5', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/77268846_PE-986-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/JUAN YALICO GONZALES.pdf (PE-983-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-983-26', '3bdb23f3f4adbe92dca2e4ae6756bcd6b3f2d036ff5e6a0f0b6a7c2f04ee68bd', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/04056666_PE-983-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/LUCAS QUISPE KEVIN RUDY.pdf (PE-989-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-989-26', '42e222701b636d620faafb68b89493ee6dffcbb955933db1073e963beab595b4', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/70225514_PE-989-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-993-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-993-26', '78d337e118e0e3742f12b835315212d62312c0fa24ba78d0459b344a68f8cc5b', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/72960935_PE-993-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-984-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-984-26', 'a1ea2800df60904015525fb163ae6c02db39c2b024cec3f1f48eda36f31a4a37', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/77350183_PE-984-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/ROBERTO CESPEDES LOAYZA.pdf (PE-982-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-982-26', '257817b6c1b8b18cdd6f0989abe2cff1454bf67c92eec6a6d3855640f596f090', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/20106190_PE-982-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- elevacion-izaje/SOLANO BASILIO LELIS DANIEL.pdf (PE-988-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-988-26', '7dd74f2bc983ce8c92060a572a27bcdd7e2d2a4cb718504edbd0ecf7540ca425', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/elevacion-izaje/70249043_PE-988-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'elevacion-izaje-2026-05-19';

-- equipos-moviles/ALEX TRINIDAD SOLIS.pdf (PE-939-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-939-26', '29acc09257954a8387ab81567273004540eb6a4843850840b9f77919bca66221', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/73125622_PE-939-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/ARIAS ROSALES JUAN CARLOS.pdf (PE-933-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-933-26', 'cb0c1e402805a3b83d71cbd2e1f34bb44fb571a6b86c1359c2a21f28a16d9b08', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/20108604_PE-933-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-944-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-944-26', '986a35d61d3acccbf7b16042f11e6f728f478fa18f52411cb8085aeb9511de80', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/70843243_PE-944-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/CAJAHUANCA ORONCOY FERNANDO MIGUEL.pdf (PE-948-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-948-26', '0b57c34aeb0916da168c385730ef92bb531594d4559673ee22e9f2afb1f68c95', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/71991533_PE-948-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-937-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-937-26', 'dcec24c52625ddd728c53b5a99aa469e6f1784bfe8bf6da59ebfea4ed429cdf6', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/44090378_PE-937-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/EDWIN C REFULIO VALLADARES.pdf (PE-946-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-946-26', '07a36636f96f2bd53e6966c428c3c89909fad1eb9a2a366cd324a4676384a7f7', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/40433699_PE-946-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-942-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-942-26', '473ded51359fb5cb404788ec2c82343f5f80decd073f2b3a964ba036089ac82c', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/76345274_PE-942-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-943-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-943-26', 'be3c1f6633fe7b45745fb082cf04b3ee63d0acc9f5d1e6d88e44d66e09f3a30c', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/70923022_PE-943-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/JAVIER BALDEON LUIS JHONATAN.pdf (PE-938-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-938-26', '6cf2b5afcac5bc32c4e5372f47cb10635d5ed1085013de7af690059467e3479a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/77268846_PE-938-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/JUAN YALICO GONZALES.pdf (PE-935-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-935-26', '9669d5eb34a465303dfa85a741eef870bc35fc336931de9bc49307639c9690bf', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/04056666_PE-935-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/LUCAS QUISPE KEVIN RUDY.pdf (PE-941-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-941-26', '0baa7d8e6011a9404074e6926231595c886f3f0bcd4085766b12cee5ad9556ff', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/70225514_PE-941-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-945-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-945-26', 'e296ffdc547ef7d504819c163ff1a6442f4763ef3677515ee567391c0f53fe85', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/72960935_PE-945-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-936-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-936-26', '413c4aa64b9a584f5afa9434c50fa2265a7bd5ea142cc2dc02ea4f7db8b8f904', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/77350183_PE-936-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/ROBERTO CESPEDES LOAYZA.pdf (PE-934-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-934-26', 'bb9ae50ca86eefffc1aa6cbdb6e7d06ddfbef849924843a814cde4f47688d7b8', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/20106190_PE-934-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- equipos-moviles/SOLANO BASILIO LELIS DANIEL.pdf (PE-940-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-940-26', '559ec41281ef89913ca089fdd243208b3be286a1fbd883edc220ddb97f5b015f', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/equipos-moviles/70249043_PE-940-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'equipos-moviles-2026-05-17';

-- herramientas-manuales/ALEX TRINIDAD SOLIS.pdf (PE-1019-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1019-26', '03f7ccc62fb4a4334bb470745f27fc88346974acc419cbdb8efc8145f5b9b632', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/73125622_PE-1019-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/ARIAS ROSALES JUAN CARLOS.pdf (PE-1013-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1013-26', 'd6dc0a34232891f4f0365e1831d67e16dba4bb35a2e9c657c3e8e28fe0ffcf7e', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/20108604_PE-1013-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-1024-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1024-26', '936a158b7b0cb8066ce60a53ddd6a193b36be070deac0d1df1c753ee435ad28e', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/70843243_PE-1024-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/CAJAHUANCA ORONCOY FERNANDO MIGUEL.pdf (PE-1028-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1028-26', '314b623b16d2be74537d0bc23d4abba7acb62b1e84a2d5962e767324014aedeb', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/71991533_PE-1028-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-1017-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1017-26', '0700e7f4f6d2d6ed0e1bdc90b51b9618d4f78c50f8b0c25847520096e79d2fc7', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/44090378_PE-1017-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/EDWIN C REFULIO VALLADARES.pdf (PE-1026-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1026-26', '97f4dd4de108d6039c00874750576c4f51cf6b91b801a4aaffebc45d796fe08a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/40433699_PE-1026-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-1022-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1022-26', '13be0053e661d05d609b20658bc708901e01aeabc2975b61612a1326cfe20b83', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/76345274_PE-1022-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-1023-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1023-26', '013edecc9721ae4e246588e8592b57560c959d6869a0b9a837e38ca8305eedca', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/70923022_PE-1023-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/JAVIER BALDEON LUIS JHONATAN.pdf (PE-1018-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1018-26', '0123fcb4e89920b9465b98a7a8b13fbc2484b4fc2ac51a2401202313d1c3218f', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/77268846_PE-1018-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/JUAN YALICO GONZALES.pdf (PE-1015-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1015-26', '1c4ca3869a828e689ff08878361a2c02213669d8ca42b00dd6284e9e3789029d', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/04056666_PE-1015-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/LUCAS QUISPE KEVIN RUDY.pdf (PE-1021-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1021-26', '265870eae6cb71bc910d398feb574f631469dc8361d5fc814cfd53ba95f4d62c', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/70225514_PE-1021-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-1025-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1025-26', '99635e21fee29ca49d97ccdb6ec5f73dd3a3b46e673c89aa152b6b77f33df31a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/72960935_PE-1025-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-1016-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1016-26', '062b10f0e05c0fd0e1fa7dd095a644bf8c8b2a88c0f015d23e0f59ffad6bf38c', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/77350183_PE-1016-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/ROBERTO CESPEDES LOAYZA.pdf (PE-1014-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1014-26', '1b95e4209f2d82647dcb6a308fd2b543c7bcc05c16ee72bae4205054e79819f1', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/20106190_PE-1014-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- herramientas-manuales/SOLANO BASILIO LELIS DANIEL.pdf (PE-1020-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1020-26', '21a56ecd3db1c776c2e15c740e7dde74d92bcbcf0334ad2eef431caf4c0d5feb', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/herramientas-manuales/70249043_PE-1020-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'herramientas-manuales-2026-05-19';

-- incendio-explosion/ALEX TRINIDAD SOLIS.pdf (PE-1003-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1003-26', '44ac9fac75c8fad2a30aa5605b7a101d0e4f30071e9617d3775151a687f61298', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/73125622_PE-1003-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/ARIAS ROSALES JUAN CARLOS.pdf (PE-997-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-997-26', '3da60a0161e03b1bde73e378b2a951b97af517a0d5579e03eaec15896e26e80b', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/20108604_PE-997-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-1008-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1008-26', '695ed7a11f7df22814e57b81a62cdced242f66703081e908980634c6a678dea1', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/70843243_PE-1008-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/CAJAHUANCA ORONCOY FERNANDO MIGUEL.pdf (PE-1012-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1012-26', '861ef4857f7a17c415aee029fbb797725c130e6632413a9402e9569dc2613c6a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/71991533_PE-1012-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-1001-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1001-26', 'cf719fed9c8824ad44fb04eadcd9c8fd6a09fc77fd68c12714c66c37c8464e62', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/44090378_PE-1001-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/EDWIN C REFULIO VALLADARES.pdf (PE-1010-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1010-26', 'a49155a07151017e69846a83ed7d2f30fdda88bc8fdfc91b282153ddda7eb6dc', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/40433699_PE-1010-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-1006-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1006-26', '27836a60941e48c6ad02e01241f3ab8e91c180ec63fb6a6fd9d7a90fa3a3d668', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/76345274_PE-1006-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-1007-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1007-26', 'daa3c1c48bdeec07fd189ef643fbd87349dfcadefea599d11fdca8ef57b2399b', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/70923022_PE-1007-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/JAVIER BALDEON LUIS JHONATAN.pdf (PE-1002-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1002-26', 'b6c078d8c9f86c4a345988a0c9c19c5bf7beac30cc8097a51c3882b8ae9d3017', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/77268846_PE-1002-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/JUAN YALICO GONZALES.pdf (PE-999-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-999-26', '321f7c938d29ce6e37d95db3cefd412f419657f2a0d88170cb72c00ff85faa0a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/04056666_PE-999-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/LUCAS QUISPE KEVIN RUDY.pdf (PE-1005-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1005-26', 'f06cb3dbb7c88fcd4244dac9db804e96f25dd4d144cd14df89defa30fd1c5f99', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/70225514_PE-1005-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-1009-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1009-26', '7dce77f03b3393ef7f482deba220c970c4474f3c5257bd8099986e21fe6709d9', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/72960935_PE-1009-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-1000-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1000-26', 'baedf8b244f9f02d5288249ab77f5222eb7e1d75f11805a3653da6d932043653', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/77350183_PE-1000-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/ROBERTO CESPEDES LOAYZA.pdf (PE-998-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-998-26', '197fbadc9d4effb460a39e555a56d53b568d243af87c9fbf00c522fc5883ffae', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/20106190_PE-998-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- incendio-explosion/SOLANO BASILIO LELIS DANIEL.pdf (PE-1004-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1004-26', '0114c3621f8864112bfc00892fe7e26a8fe052f3cd8945014f92816c315291fd', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/incendio-explosion/70249043_PE-1004-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'incendio-explosion-2026-05-19';

-- respuesta-emergencias/ALEX TRINIDAD SOLIS.pdf (PE-907-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-907-26', '4048185be14217d8bdc0eccfde0dc8290fb35d4aac35e4e8c922f2ff17e3e6ef', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/73125622_PE-907-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/ARIAS ROSALES JUAN CARLOS.pdf (PE-901-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-901-26', 'dff0e2a812d091b2d48ecf007a889ac0595d741db8b55235bbfa8016a9251af6', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/20108604_PE-901-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-912-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-912-26', '259e16bc02380b362f4fee5b8fe8b9b1402e576f20889c90d1997087100b58a5', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/70843243_PE-912-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/CAJAHUANCA ORONCOY FERNANDO MIGUEL.pdf (PE-915-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-915-26', '3885075f13ac08620c5479fa9345e8d0670140ac5cdee3a6bf5a7124d4f32b07', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/71991533_PE-915-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-905-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-905-26', '8bacdcb7914e2e8a2c6a0f538d8ec14d4c9169a0c9e06780ed713f0ed446738c', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/44090378_PE-905-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/EDWIN C REFULIO VALLADARES.pdf (PE-914-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-914-26', '9738e53b6d9e8c56e4369a1cf6610b642b295685b328455b7c30b837343485d7', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/40433699_PE-914-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-910-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-910-26', '20f203712816cf79f319e7fa185744ce48e0d19f86ff0e8022e1b75ea6f80bfd', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/76345274_PE-910-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-911-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-911-26', '5247afff08c6ae509dc4b243436439dff5165c16d9eb9042e0a110ccb808bf3c', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/70923022_PE-911-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/JAVIER BALDEON LUIS JHONATAN.pdf (PE-906-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-906-26', '207951509ff4f24f92a2af421c1f45606663deb345a267e0033a77a8882d3ac7', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/77268846_PE-906-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/JUAN YALICO GONZALES.pdf (PE-903-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-903-26', '61e577084884a7f371c4c4f02e553c04da63de355996a7d6e89e12def8e7f3b2', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/04056666_PE-903-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/LUCAS QUISPE KEVIN RUDY.pdf (PE-909-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-909-26', '85511c1b47732e525400de84d62ffb8b345bdcd6d246a466efe4408424c7afbe', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/70225514_PE-909-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-913-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-913-26', '3585636f558b15e1e80105acf5857e60f5134d40b822aeaf75f54445ceb830b1', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/72960935_PE-913-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-904-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-904-26', '1662c812f752b6f925c1226a69f7e15a9b7ad8ff354aa41f694f832c21d94ec9', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/77350183_PE-904-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/ROBERTO CESPEDES LOAYZA.pdf (PE-902-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-902-26', '7259eb0eff5fd375a3a0e1ebe1da2798524c45814d89c35ec29bede1ac80a837', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/20106190_PE-902-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- respuesta-emergencias/SOLANO BASILIO LELIS DANIEL.pdf (PE-908-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-908-26', '1cbef2e1b9259c6d55c8de09e7b7a8eb07c01c35dc6499d898820a4956c3aeab', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/respuesta-emergencias/70249043_PE-908-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'respuesta-emergencias-2026-05-17';

-- seguridad-electrica/ALEX TRINIDAD SOLIS.pdf (PE-971-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-971-26', 'c6efe7fdd9662b12d13cf9bb93c11d443dcf9ea6055d806062b31ac5216859fe', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/73125622_PE-971-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/ARIAS ROSALES JUAN CARLOS.pdf (PE-965-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-965-26', 'e3efa099a41a2035abe77e31bcd41ca34832f6df1f3bc2399eb56eb5e03db5f5', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/20108604_PE-965-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-976-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-976-26', 'f6928311be5512ce5ee97751f771a9c5353316a7f5e2c264e0ad009ae79fef0a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/70843243_PE-976-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/CAJAHUANCA ORONCOY FERNANDO MIGUEL.pdf (PE-980-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-980-26', 'a9bb3161eb2177db579b9945786bb35a75ca183ff3bfd73d1a0409ece38a55fd', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/71991533_PE-980-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-969-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-969-26', 'a2801b53a644b5a05daefecb469ca1f4907894ace2f4f2baf8cef2b49c1c267d', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/44090378_PE-969-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/EDWIN C REFULIO VALLADARES.pdf (PE-978-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-978-26', '38f1770e993caf443d758513bef6f6e6d656f3cd06a98cc824df0d551d749729', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/40433699_PE-978-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-974-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-974-26', 'f4263e25a005dea0e8f7020d4f1947ff38da7c3c74811188435195592cda7501', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/76345274_PE-974-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-975-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-975-26', 'f424f432898f6ad295954cbee8660468eacd41c6a9eac68b6fce088f4d403f91', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/70923022_PE-975-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/JAVIER BALDEON LUIS JHONATAN.pdf (PE-970-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-970-26', '4e5bfccc057856eb8fe26df958694de3d30b5d2165d374c5f7fd946f9b23779f', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/77268846_PE-970-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/JUAN YALICO GONZALES.pdf (PE-967-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-967-26', 'ed8b1ffdd41987f82b6ac23c9f937c81070b43ec9a8e82bb912cd3dc2b95e536', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/04056666_PE-967-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/LUCAS QUISPE KEVIN RUDY.pdf (PE-973-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-973-26', '8fe9e0fbeeb9c8ff6c0780fdbe61c2879d3f7beb5957dcde52055f4164dd91db', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/70225514_PE-973-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-977-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-977-26', '02fe1441f131c10e93822cf39c694ad6d435e2a0e0814117e7ad69f08adc4c1a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/72960935_PE-977-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-968-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-968-26', 'f1c2db8cb3421b4410ef7ede10086102addb3b139ace7718da00a04098e31647', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/77350183_PE-968-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/ROBERTO CESPEDES LOAYZA.pdf (PE-966-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-966-26', '1954024d0dff338d67b58823697cd6f5708ed866930a47f4013cca6aabf9bc71', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/20106190_PE-966-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- seguridad-electrica/SOLANO BASILIO LELIS DANIEL.pdf (PE-972-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-972-26', '03ae520290b184b263256b1449e27f992e3d2dff359b970f77e51d6534b4d0cd', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/seguridad-electrica/70249043_PE-972-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'seguridad-electrica-2026-05-18';

-- sustancias-quimicas/ALEX TRINIDAD SOLIS.pdf (PE-1051-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1051-26', 'be3f13c27e31ce100b5ebe9cc6d4cbfe6c4b40f4063d3f6b942de6d38d7b803f', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/73125622_PE-1051-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/ARIAS ROSALES JUAN CARLOS.pdf (PE-1045-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1045-26', 'd7bc10fec2cd35db4e165587a2dd4350fd5a98287a1e0f6a8434e56fce1871f6', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/20108604_PE-1045-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-1056-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1056-26', '3c4cd82bb770305127c8fe2b9b1449e6209689536b034ef27a857a4434900d53', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/70843243_PE-1056-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/CAJAHUANCA ORONCOY FERNANDO MIGUEL.pdf (PE-1060-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1060-26', '1c784729d531e2b644df31438436e832eea6b93224243e50e58876a906dcfdca', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/71991533_PE-1060-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-1049-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1049-26', '6b17b342d3dee7343569df725d0efcd20612d3c22d7fb29683feca73061c0634', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/44090378_PE-1049-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/EDWIN C REFULIO VALLADARES.pdf (PE-1058-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1058-26', '17a6e76be5eaf217d06c3854b0f34284e2e295849c6353b450297046b7f25e72', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/40433699_PE-1058-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-1054-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1054-26', 'a0ac3abea4846d1939ded3ad16a729ff3122f1f27232fef89a80ac805f126e85', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/76345274_PE-1054-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-1055-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1055-26', '297002c25f8b80768ba850a246544c6013c50f3e87196ac843d30563e75dd0a1', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/70923022_PE-1055-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/JAVIER BALDEON LUIS JHONATAN.pdf (PE-1050-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1050-26', 'c6d5c07dd7a9f86d71f22184bf775df502b5299f191d12f16b9e4877e9848685', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/77268846_PE-1050-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/JUAN YALICO GONZALES.pdf (PE-1047-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1047-26', '682e8bf9b08c59e7d449a1d250cc21e42b18938d532bd5d39a2496175c91f2fa', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/04056666_PE-1047-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/LUCAS QUISPE KEVIN RUDY.pdf (PE-1053-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1053-26', 'bfc198ce34e4af5b5beb07e8e81ac6af3dca95516b456a95353459800161a13b', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/70225514_PE-1053-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-1057-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1057-26', '8668183ab22bbb18807e6530fa154b3443da524eb7af8225ef961ef098186967', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/72960935_PE-1057-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-1048-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1048-26', 'a5c041043924d3e033bc9c2f2b7ae88848987ba9a94d5d921108bc453e2f66be', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/77350183_PE-1048-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/ROBERTO CESPEDES LOAYZA.pdf (PE-1046-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1046-26', '116e3d00533fabf4e2c1be0e5aecc77544392f20f0fccb8346159b1fb673e408', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/20106190_PE-1046-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- sustancias-quimicas/SOLANO BASILIO LELIS DANIEL.pdf (PE-1052-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-1052-26', 'ddf2e1161283edd3c56f02d984ddc444e45861c300aed3c50ea7577a7713d4a5', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/sustancias-quimicas/70249043_PE-1052-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'sustancias-quimicas-2026-05-18';

-- trabajo-altura/ALEX TRINIDAD SOLIS.pdf (PE-923-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '73125622' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-923-26', '025e3b616fb52a23d33a800a47cadf47355944591a70423c3e7e18f57c61d16b', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/73125622_PE-923-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '73125622' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/ARIAS ROSALES JUAN CARLOS.pdf (PE-917-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20108604' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-917-26', '38798fb9c213b949873794b3b89b6e39deea6f5b1de4fd2a78401ef1fa621083', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/20108604_PE-917-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20108604' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/BERROSPI AGUILAR SERGIO ENRIQUE.pdf (PE-928-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70843243' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-928-26', '6806649b71a69c871a304d26d3071985fb727a689daa2cb40606073950326b36', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/70843243_PE-928-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70843243' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/CAJAHUANCA ORONCOY FERNANDO MIGUE L.pdf (PE-931-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '71991533' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-931-26', 'eb1e92cc791e1b55a9340723315e1ec6d0608ac112aec292c939117854cdb8b3', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/71991533_PE-931-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '71991533' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/CALLUPE ALMERCO ROY MIGUEL.pdf (PE-921-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '44090378' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-921-26', 'ae21ba01f8c5632cfe9516413e4d538bb1b2ed1d820cba8db547208022b8d78f', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/44090378_PE-921-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '44090378' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/EDWIN C REFULIO VALLADARES.pdf (PE-930-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '40433699' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-930-26', 'ce7ac13b812380b2c6313d85d48d2d4dfbbe10311f7f8d8320e015e0cea9dcb3', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/40433699_PE-930-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '40433699' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/GOMEZ VERGARA MANUEL ANGEL.pdf (PE-926-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '76345274' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-926-26', '084e7a37134cdbd9c5a7acad3ead3b9dc34d4f577a03127e595d3c49704b2bd9', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/76345274_PE-926-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '76345274' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/ILDEFONSO SAAVEDRA MAYCOL.pdf (PE-927-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70923022' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-927-26', '513d31e82db58d8d8cdc094fd283fee0b300b250dbc2f74583fffeed655abd57', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/70923022_PE-927-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70923022' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/JAVIER BALDEON LUIS JHONATAN.pdf (PE-922-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77268846' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-922-26', 'd08fbb9a56535d392d76e6f21cc5d09ef4e7ec87db938f9bf30d46da2b9a9ec1', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/77268846_PE-922-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77268846' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/JUAN YALICO GONZALES.pdf (PE-919-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '04056666' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-919-26', 'ef4dce0f6426bf21293e3d23323986c226460ca56ab65f4b5cd3379216d1a321', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/04056666_PE-919-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '04056666' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/LUCAS QUISPE KEVIN RUDY.pdf (PE-925-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70225514' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-925-26', 'c09ed464541aa5ae20772cf137f68ea762820988f8609625f7a9206202e23e31', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/70225514_PE-925-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70225514' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/MENDOZA ORTEGA JERSON JUNIOR.pdf (PE-929-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '72960935' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-929-26', 'c7890cbb33bd850636414067d6047535c34f4bd8d8738b622aa3e4f920803db2', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/72960935_PE-929-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '72960935' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/PUERTAS UBALDO CRISTHIAN YORDI.pdf (PE-920-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '77350183' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-920-26', '8998cd7c0d03a1b93c5b082103ee2a3d9e8ee717d7ee71e4a7545b5516719538', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/77350183_PE-920-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '77350183' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/ROBERTO CESPEDES LOAYZA.pdf (PE-918-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '20106190' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-918-26', 'd6a96c8516435bcdc104152c17f3382f876ccb1328968ac12a7543e4ef0b783a', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/20106190_PE-918-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '20106190' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

-- trabajo-altura/SOLANO BASILIO LELIS DANIEL.pdf (PE-924-26)
INSERT IGNORE INTO matriculas (participante_id, edicion_id)
SELECT p.id, e.id FROM participantes p, ediciones e
WHERE p.dni = '70249043' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';

INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
SELECT 'PE-924-26', '7899058c458eb867f208701c8253fa09cc450a4f93adeac648857e3099f709c4', m.id,
  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),
  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),
  '2026-05-21', '2027-05-21', '/certificados/trabajo-altura/70249043_PE-924-26.pdf'
FROM matriculas m
JOIN participantes p ON m.participante_id = p.id
JOIN ediciones e ON m.edicion_id = e.id
WHERE p.dni = '70249043' AND e.codigo_edicion = 'trabajo-altura-2026-05-17';
