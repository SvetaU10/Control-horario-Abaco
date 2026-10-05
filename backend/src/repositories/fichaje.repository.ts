import { db } from "../config/database.js";

export const TIPOS_FICHAJE = ["ENTRADA", "SALIDA"] as const;
export type TipoFichaje = (typeof TIPOS_FICHAJE)[number];

/** Fila de la tabla `fichajes` (init.sql). */
export interface Fichaje {
    id: number;
    usuario_id: number;
    tipo: TipoFichaje;
    timestamp_servidor: Date;
    dispositivo: string | null;
    latitud: string | null;
    longitud: string | null;
}

export interface GuardarFichajeDatos {
    usuario_id: number;
    tipo: TipoFichaje;
    /** Si no se envía, PostgreSQL usa DEFAULT CURRENT_TIMESTAMP (hora del servidor). */
    timestamp_servidor: Date;
    dispositivo: string | null;
    latitud: number | string | null;
    longitud: number | string | null;
}

function esTipoFichaje(valor: string): valor is TipoFichaje {
    return (TIPOS_FICHAJE as readonly string[]).includes(valor);
}

export class FichajeRepository {
    async buscarUltimoPorUsuario(usuarioId: number): Promise<Fichaje | null> {
        const result = await db.query<Fichaje>(
            `SELECT id, usuario_id, tipo, timestamp_servidor, dispositivo, latitud, longitud
             FROM fichajes
             WHERE usuario_id = $1
             ORDER BY timestamp_servidor DESC
             LIMIT 1`,
            [usuarioId]
        );

        return result.rows[0] ?? null;
    }

    async guardar(datos: GuardarFichajeDatos): Promise<Fichaje> {
        if (!esTipoFichaje(datos.tipo)) {
            throw new Error(`tipo inválido: debe ser ENTRADA o SALIDA.`);
        }

        if (datos.timestamp_servidor) {
            const result = await db.query<Fichaje>(
                `INSERT INTO fichajes (usuario_id, tipo, timestamp_servidor, dispositivo, latitud, longitud)
                 VALUES ($1, $2::tipo_fichaje, $3, $4, $5, $6)
                 RETURNING id, usuario_id, tipo, timestamp_servidor, dispositivo, latitud, longitud`,
                [
                    datos.usuario_id,
                    datos.tipo,
                    datos.timestamp_servidor,
                    datos.dispositivo,
                    datos.latitud,
                    datos.longitud
                ]
            );

            const creado = result.rows[0];
            if (!creado) {
                throw new Error("No se pudo crear el fichaje.");
            }
            return creado;
        }

        const result = await db.query<Fichaje>(
            `INSERT INTO fichajes (usuario_id, tipo, dispositivo, latitud, longitud)
             VALUES ($1, $2::tipo_fichaje, $3, $4, $5)
             RETURNING id, usuario_id, tipo, timestamp_servidor, dispositivo, latitud, longitud`,
            [datos.usuario_id, datos.tipo, datos.dispositivo, datos.latitud, datos.longitud]
        );

        const creado = result.rows[0];
        if (!creado) {
            throw new Error("No se pudo crear el fichaje.");
        }

        return creado;
    }
    async listarPorUsuario(usuarioId: number, limite = 50): Promise<Fichaje[]> {
        const result = await db.query<Fichaje>(
            `SELECT id, usuario_id, tipo, timestamp_servidor, dispositivo, latitud, longitud
             FROM fichajes
             WHERE usuario_id = $1
             ORDER BY timestamp_servidor DESC
             LIMIT $2`,
            [usuarioId, limite]
        );
    
        return result.rows;
    }
}
