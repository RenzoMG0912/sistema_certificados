-- Archivo: database/02-SCHEMA.sql
-- Definición del esquema para la base de datos de TEAM HSEC (Versión MySQL)

-- Tabla de Usuarios (Administradores)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Participantes (Estudiantes)
CREATE TABLE IF NOT EXISTS participantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(150) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150),
  cargo VARCHAR(150),
  telefono VARCHAR(50),
  procedencia VARCHAR(150),
  induccion VARCHAR(50),
  examen_medico VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Cursos
CREATE TABLE IF NOT EXISTS cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_curso VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  duracion VARCHAR(50) NOT NULL,
  categoria VARCHAR(100),
  entrenador VARCHAR(150),
  firma_id INT DEFAULT NULL,
  temario TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_curso_firma FOREIGN KEY (firma_id) REFERENCES firmas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Firmas Autorizadas
CREATE TABLE IF NOT EXISTS firmas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  cargo VARCHAR(150) NOT NULL,
  firma_url VARCHAR(255) NOT NULL,
  cip VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Matrículas (Relación entre Alumno y Curso)
CREATE TABLE IF NOT EXISTS matriculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participante_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_inicio DATE DEFAULT NULL,
  fecha_fin DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_p_c (participante_id, curso_id),
  CONSTRAINT fk_mat_participante FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_mat_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Certificados Emitidos
CREATE TABLE IF NOT EXISTS certificados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  hash VARCHAR(64) UNIQUE NOT NULL,
  matricula_id INT NOT NULL,
  firma_id_1 INT DEFAULT NULL,
  firma_id_2 INT DEFAULT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  pdf_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cert_matricula FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
  CONSTRAINT fk_cert_firma_1 FOREIGN KEY (firma_id_1) REFERENCES firmas(id) ON DELETE SET NULL,
  CONSTRAINT fk_cert_firma_2 FOREIGN KEY (firma_id_2) REFERENCES firmas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_tipo ENUM('admin', 'alumno') NOT NULL,
  usuario_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT,
  tipo VARCHAR(50) DEFAULT 'info',
  leida TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_noti_usuario (usuario_tipo, usuario_id, leida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Historial de Verificaciones
CREATE TABLE IF NOT EXISTS verificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificado_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  verificado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ver_certificado FOREIGN KEY (certificado_id) REFERENCES certificados(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
