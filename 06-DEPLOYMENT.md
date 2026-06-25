# 🚀 GUÍA DE DESPLIEGUE - TEAM HSEC (MySQL en Plesk)

Esta guía explica paso a paso cómo crear la base de datos MySQL, importar las tablas, configurar las credenciales de conexión y desplegar la aplicación de Node.js en un servidor que utilice **Plesk Panel**.

---

## 🗄️ PASO 1: Crear la Base de Datos y Usuario en Plesk

1. Inicia sesión en tu **Plesk Panel**.
2. Ve a la sección **Bases de datos** (Databases) en la barra lateral del dominio correspondiente.
3. Haz clic en **Añadir base de datos** (Add Database).
4. Configura los siguientes campos:
   - **Nombre de la base de datos**: Escribe `teamhsec` (Plesk le añadirá un prefijo, quedando como `usuario_teamhsec`).
   - **Servidor de bases de datos**: Selecciona `localhost` o la versión MySQL/MariaDB activa.
   - **Crear un usuario de base de datos**: Activa la casilla.
   - **Nombre de usuario**: Escribe un nombre (ej. `usuario_hsec`).
   - **Contraseña**: Genera una contraseña segura y **cópiala**, la necesitarás en el paso 3.
5. Haz clic en **Aceptar**.

---

## 📥 PASO 2: Importar las Tablas desde phpMyAdmin

Plesk integra **phpMyAdmin** para gestionar bases de datos visualmente.

1. Dentro de la página de bases de datos de Plesk, busca la base de datos que acabas de crear y haz clic en el enlace **phpMyAdmin**.
2. Una vez dentro de phpMyAdmin, asegúrate de que la base de datos (`usuario_teamhsec`) esté seleccionada en la barra de la izquierda.
3. Ve a la pestaña **Importar** (Import) en el menú superior.
4. Haz clic en **Seleccionar archivo** (Choose File) y carga en orden los siguientes archivos que están en tu proyecto:
   - 1º: `database/02-SCHEMA.sql` (Crea las 7 tablas y sus relaciones).
   - 2º: `database/03-SEED.sql` (Inserta el administrador, cursos y firmas de prueba).
5. Haz clic en **Importar** (o el botón **Continuar** al final de la página) para cada archivo.
6. Deberías ver un mensaje en verde confirmando que las consultas se ejecutaron correctamente y verás las 7 tablas creadas.

### 📋 Referencia de Tablas Creadas:
1. `usuarios`: Almacena las cuentas administrativas (para acceder al login).
2. `participantes`: Datos de los alumnos (DNI, Nombres, Email).
3. `cursos`: Catálogo de los cursos de TEAM HSEC.
4. `firmas`: Registro de firmas autorizadas de los ponentes.
5. `matriculas`: Relación de inscripción de un alumno en un curso.
6. `certificados`: Registros oficiales de certificados emitidos (con su respectivo código correlativo `PE-XXXX-YY`, hash y ruta del PDF).
7. `verificaciones`: Historial de auditoría de cuándo y desde qué IP se escaneó o verificó cada certificado.

---

## 🔌 PASO 3: Configurar las Conexiones y Variables de Entorno en Plesk

Plesk administra las variables de entorno de Node.js de dos formas. Puedes usar cualquiera de las siguientes opciones:

### Opción A: A través de la interfaz de Node.js en Plesk (Recomendado)
1. En Plesk, ve a **Sitios web y dominios** y entra en la herramienta **Node.js**.
2. En la sección **Variables de entorno de la aplicación** (Application Environment Variables), haz clic en **Añadir variable** para agregar las siguientes:
   - `DB_HOST` = `localhost`
   - `DB_USER` = `tu_usuario_de_plesk` (ej. `usuario_hsec`)
   - `DB_PASSWORD` = `la_contrasena_que_creaste_en_plesk`
   - `DB_NAME` = `tu_nombre_de_bd_de_plesk` (ej. `usuario_teamhsec`)
   - `DB_PORT` = `3306`
   - `JWT_SECRET` = `un_texto_secreto_muy_seguro_de_minimo_32_caracteres`
   - `JWT_EXPIRES_IN` = `8h`
   - `JWT_ISSUER` = `teamhsec`
   - `JWT_AUDIENCE` = `teamhsec-admin`
   - `BASE_URL` = `https://tu-dominio.com` (Usa HTTPS de tu dominio en Plesk)
3. Haz clic en **Guardar** o **Aplicar**.

### Opción B: Mediante archivo `.env`
1. Abre el **Administrador de Archivos** de Plesk.
2. Navega a la raíz de tu aplicación.
3. Edita o crea el archivo `.env` con las credenciales que creaste en el paso 1:
   ```env
   PORT=3000
   NODE_ENV=production
   DB_HOST=localhost
   DB_USER=usuario_hsec
   DB_PASSWORD=tu_contrasena_de_bd
   DB_NAME=usuario_teamhsec
   DB_PORT=3306
   JWT_SECRET=clave_secreta_para_los_tokens_jwt_minimo_32_chars
   JWT_EXPIRES_IN=8h
   JWT_ISSUER=teamhsec
   JWT_AUDIENCE=teamhsec-admin
   BASE_URL=https://tu-dominio.com
   ```

---

## 🚀 PASO 4: Iniciar la Aplicación en Plesk

1. En la herramienta **Node.js** de Plesk:
   - **Versión de Node.js**: Selecciona una versión estable (se recomienda v18 o superior).
   - **Raíz del documento** (Document Root): `/public`
   - **Archivo de inicio de la aplicación** (Application Startup File): `server.js`
2. Haz clic en el botón **Instalación de NPM** (NPM Install) para instalar las dependencias (`express`, `mysql2`, `pdfkit`, etc.) en el servidor.
3. Haz clic en **Reiniciar aplicación** (Restart App).
4. ¡Listo! Tu sistema estará en línea.

---

## 🔑 Credenciales para Iniciar Sesión en Plesk

Una vez inicializado, dirígete a:
👉 `https://tu-dominio.com/admin/login.html`

E introduce las credenciales predeterminadas (sembradas por `03-SEED.sql`):
- **Usuario**: `admin@teamhsec.com`
- **Contraseña**: `Admin123!`

> Por seguridad, el acceso temporal fue eliminado. El login solo funciona con un usuario existente en la tabla `usuarios` y su contraseña cifrada.
