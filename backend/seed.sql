-- Datos de ejemplo para desarrollo (6 usuarios, 5 fichajes y 5 solicitudes).
-- Contraseña de los usuarios de ejemplo: Demo1234
-- Usuario de prueba: prueba / 1111
-- Ejecutar: docker exec -i fichajes_postgres psql -U postgres -d fichajes_db < seed.sql

TRUNCATE solicitudes_modificacion, fichajes, usuarios RESTART IDENTITY CASCADE;

INSERT INTO usuarios (
    nombre, apellidos, email, password_hash, rol, activo, centro, org_ventas, departamento, fecha_alta
) VALUES
    ('Laura', 'García Ruiz', 'laura.garcia@empresa.com', '$2b$10$4UuOVL42DK.Dj2k/bauMF.TdaEpN5Nh.ieKaSdGEMwaFR29nkXuxO', 'ADMIN', TRUE, 'Oficina Madrid', NULL, 'IT', '2025-01-15 09:00:00+01'),
    ('Miguel', 'Santos López', 'miguel.santos@empresa.com', '$2b$10$4UuOVL42DK.Dj2k/bauMF.TdaEpN5Nh.ieKaSdGEMwaFR29nkXuxO', 'RRHH', TRUE, 'Oficina Madrid', NULL, 'Recursos Humanos', '2025-02-01 10:30:00+01'),
    ('Ana', 'Martínez Vega', 'ana.martinez@empresa.com', '$2b$10$4UuOVL42DK.Dj2k/bauMF.TdaEpN5Nh.ieKaSdGEMwaFR29nkXuxO', 'EMPLEADO', TRUE, 'Oficina Madrid', 'Ventas España', 'Comercial', '2025-03-10 08:00:00+01'),
    ('Carlos', 'Fernández Díaz', 'carlos.fernandez@empresa.com', '$2b$10$4UuOVL42DK.Dj2k/bauMF.TdaEpN5Nh.ieKaSdGEMwaFR29nkXuxO', 'EMPLEADO', TRUE, 'Fábrica Barcelona', 'Ventas UE', 'Logística', '2025-04-20 11:00:00+02'),
    ('Elena', 'Ruiz Moreno', 'elena.ruiz@empresa.scom', '$2b$10$4UuOVL42DK.Dj2k/bauMF.TdaEpN5Nh.ieKaSdGEMwaFR29nkXuxO', 'EMPLEADO', TRUE, 'Almacén Sur', 'Soporte Comercial', 'Comercial', '2025-06-01 09:15:00+02'),
    ('Usuario', 'De Prueba', 'prueba', '$2b$10$/T86SPPwsfqj8JBAUCZ6k.3Kwy5w/smIw/Im.N69O2Qyt75XstPT6', 'EMPLEADO', TRUE, 'Oficina Madrid', NULL, 'IT', CURRENT_TIMESTAMP);

INSERT INTO fichajes (usuario_id, tipo, timestamp_servidor, dispositivo, latitud, longitud) VALUES
    (3, 'ENTRADA', '2026-09-29 08:02:00+02', 'Chrome en Windows 11', 40.41677500, -3.70379000),
    (3, 'SALIDA', '2026-09-29 17:05:00+02', 'Chrome en Windows 11', 40.41677500, -3.70379000),
    (4, 'ENTRADA', '2026-09-29 07:58:00+02', 'Safari en iPhone', 41.38739700, 2.16856800),
    (5, 'ENTRADA', '2026-09-29 09:10:00+02', 'Firefox en Ubuntu', 37.38909200, -5.98445900),
    (2, 'ENTRADA', '2026-09-29 08:30:00+02', 'Edge en Windows 11', NULL, NULL);

INSERT INTO solicitudes_modificacion (
    usuario_id, tipo_fichaje_solicitado, nueva_fecha_hora, motivo_empleado, estado, revisado_por, motivo_rechazo, fecha_creacion
) VALUES
    (3, 'ENTRADA', '2026-09-28 08:55:00+02', 'Olvidé fichar al entrar por una reunión urgente con un cliente.', 'PENDIENTE', NULL, NULL, '2026-09-29 09:00:00+02'),
    (4, 'SALIDA', '2026-09-27 18:00:00+02', 'Salí a las 18:00 pero no pude fichar; el móvil no tenía cobertura.', 'APROBADA', 2, NULL, '2026-09-28 08:15:00+02'),
    (5, 'ENTRADA', '2026-09-26 09:00:00+02', 'Entré puntual pero la app no cargaba.', 'RECHAZADA', 2, 'No hay registro en cámaras de acceso a esa hora.', '2026-09-27 10:00:00+02'),
    (4, 'ENTRADA', '2026-09-25 08:00:00+02', 'Fichaje olvidado por incidencia en almacén.', 'PENDIENTE', NULL, NULL, '2026-09-26 07:45:00+02'),
    (5, 'SALIDA', '2026-09-28 17:30:00+02', 'Me fui en transporte compartido y no fiché la salida.', 'PENDIENTE', NULL, NULL, '2026-09-29 08:20:00+02');
