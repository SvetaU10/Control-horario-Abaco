import { db } from "../config/database.js";

export const ROLES_USUARIO = ["EMPLEADO", "ADMIN", "RRHH"] as const;
export type RolUsuario = (typeof ROLES_USUARIO)[number];

/** Datos de usuario seguros para API / perfil (sin contraseña). */
export interface UsuarioPublico {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    rol: RolUsuario;
    activo: boolean;
    centro: string;
    org_ventas: string | null;
    departamento: string;
    fecha_alta: Date;
}

/**
 * Solo para login interno en el servicio de auth.
 * No enviar este objeto al frontend.
 */
export interface UsuarioConPassword extends UsuarioPublico {
    password_hash: string;
}

const COLUMNAS_PUBLICAS = `
    id, nombre, apellidos, email, rol, activo,
    centro, org_ventas, departamento, fecha_alta
`;

export class UsuarioRepository {
    /** Login: incluye `password_hash` para comparar con bcrypt. */
    async buscarPorEmail(email: string): Promise<UsuarioConPassword | null> {
        const result = await db.query<UsuarioConPassword>(
            `SELECT ${COLUMNAS_PUBLICAS}, password_hash
             FROM usuarios
             WHERE LOWER(email) = LOWER($1)
             LIMIT 1`,
            [email.trim()]
        );

        return result.rows[0] ?? null;
    }

    /** Perfil: sin `password_hash`. */
    async buscarPorId(id: number): Promise<UsuarioPublico | null> {
        const result = await db.query<UsuarioPublico>(
            `SELECT ${COLUMNAS_PUBLICAS}
             FROM usuarios
             WHERE id = $1
             LIMIT 1`,
            [id]
        );

        return result.rows[0] ?? null;
    }
}
