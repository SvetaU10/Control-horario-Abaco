-- =========================================================================
-- STEP 1: PREPARACIÓN DE TIPOS DE DATOS PERSONALIZADOS (ENUMS)
-- Los ENUMs obligan a la base de datos a aceptar SOLO las palabras definidas aquí.
-- =========================================================================

-- Define que un fichaje solo puede ser de ENTRADA o de SALIDA.
CREATE TYPE tipo_fichaje AS ENUM ('ENTRADA', 'SALIDA');

-- Define las tres jerarquías o roles de personas dentro de la plataforma.
CREATE TYPE rol_usuario AS ENUM ('EMPLEADO', 'ADMIN', 'RRHH');

-- Define los estados por los que pasa una solicitud de fichaje olvidado.
CREATE TYPE estado_solicitud AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');


-- =========================================================================
-- STEP 2: CREACIÓN DE TABLAS
-- =========================================================================

-- TABLA 1: USUARIOS (Guarda los datos de los trabajadores y su organización)
CREATE TABLE usuarios (
    -- ID numérico autoincremental (1, 2, 3...) único para cada persona.
    id SERIAL PRIMARY KEY,
    
    -- Datos personales básicos
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    
    -- Email único por empleado (no se pueden duplicar cuentas con el mismo correo).
    email VARCHAR(150) UNIQUE NOT NULL,
    
    -- Contraseña protegida (aquí guardaremos el hash seguro de bcrypt).
    password_hash VARCHAR(255) NOT NULL,
    
    -- Rol dentro del sistema (por defecto es un empleado normal).
    rol rol_usuario DEFAULT 'EMPLEADO',
    
    -- Permite desactivar a un usuario si se va de la empresa sin borrar su historial legal.
    activo BOOLEAN DEFAULT TRUE,
    
    -- 🆕 CAMPOS ORGANIZATIVOS EMPRESARIALES
    centro VARCHAR(100) NOT NULL,        -- Ejemplo: 'Oficina Madrid', 'Fábrica Barcelona', 'Almacén Sur'
    org_ventas VARCHAR(100),             -- Ejemplo: 'Ventas España', 'Ventas UE', 'Soporte Comercial'
    departamento VARCHAR(100) NOT NULL,  -- Ejemplo: 'Comercial', 'Logística', 'IT', 'Recursos Humanos'
    
    -- Fecha automática en la que se da de alta al usuario en el sistema.
    fecha_alta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- TABLA 2: FICHAJES (Inmutable: Guarda cada clic real de entrada o salida)
CREATE TABLE fichajes (
    -- ID único de cada registro de tiempo.
    id SERIAL PRIMARY KEY,
    
    -- Vincula el fichaje al usuario. Si el usuario desaparece, se borran sus fichajes.
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Identifica si es una 'ENTRADA' o una 'SALIDA'.
    tipo tipo_fichaje NOT NULL,
    
    -- 🛡️ ANTIFRAUDE: Guarda la hora exacta del servidor en formato global UTC.
    -- Ignora por completo la hora que tenga el teléfono o PC del usuario.
    timestamp_servidor TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Registra desde dónde fichó (Ej: 'Chrome en Windows 11' o 'Safari en iPhone').
    dispositivo TEXT,
    
    -- Geolocalización opcional (Guarda coordenadas si la empresa lo exige y el usuario da permiso).
    latitud NUMERIC(10, 8),
    longitud NUMERIC(11, 8)
);


-- TABLA 3: SOLICITUDES DE MODIFICACIÓN (Para solucionar olvidos sin alterar registros existentes)
-- Si un empleado olvidó fichar la Entrada ayer a las 09:00, no puede editar la tabla 'fichajes'.
-- Envía una solicitud aquí. Si el jefe la aprueba, el sistema inserta un fichaje limpio.
CREATE TABLE solicitudes_modificacion (
    -- ID único de la solicitud de corrección.
    id SERIAL PRIMARY KEY,
    
    -- Quién es el empleado que olvidó fichar.
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Qué tipo de fichaje le faltó ('ENTRADA' o 'SALIDA').
    tipo_fichaje_solicitado tipo_fichaje NOT NULL,
    
    -- La hora y fecha real a la que el empleado asegura que comenzó o terminó de trabajar.
    nueva_fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Justificación obligatoria del trabajador: 'Olvidé fichar por atender llamada urgente al entrar'.
    motivo_empleado TEXT NOT NULL,
    
    -- Estado de la solicitud (empieza siempre esperando revisión).
    estado estado_solicitud DEFAULT 'PENDIENTE',
    
    -- Guarda el ID del responsable o jefe que revisó esta petición.
    revisado_por INT REFERENCES usuarios(id),
    
    -- Si el jefe la deniega, debe escribir obligatoriamente la razón aquí.
    motivo_rechazo TEXT,
    
    -- Cuándo se creó esta solicitud de ayuda.
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================================
-- STEP 3: OPTIMIZACIÓN (ÍNDICES)
-- Actúan como el índice de un libro, haciendo las búsquedas en la base de datos ultra rápidas.
-- =========================================================================

-- Agiliza enormemente las búsquedas cuando un usuario quiere ver su historial mensual de fichajes.
CREATE INDEX idx_fichajes_usuario ON fichajes (usuario_id, timestamp_servidor);

-- Permite a los responsables de un centro filtrar rápido las solicitudes 'PENDIENTES' de su equipo.
CREATE INDEX idx_solicitudes_estado ON solicitudes_modificacion (estado);