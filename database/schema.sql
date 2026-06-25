CREATE TABLE IF NOT EXISTS participantes (
  id SERIAL PRIMARY KEY,
  nombres VARCHAR(150) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150),
  cargo VARCHAR(150),
  telefono VARCHAR(50),
  procedencia VARCHAR(150),
  induccion VARCHAR(50),
  examen_medico VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
