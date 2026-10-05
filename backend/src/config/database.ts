import { Pool, QueryResult, QueryResultRow } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            "DATABASE_URL no está definida. Ejemplo: postgresql://postgres:mi_password_secreto@localhost:5432/fichajes_db"
        );
    }

    if (!pool) {
        pool = new Pool({ connectionString });

        pool.on("error", (error) => {
            console.error("[db] Error inesperado en el pool de PostgreSQL:", error.message);
        });
    }

    return pool;
}

function isConnectionError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    const errno = (error as NodeJS.ErrnoException).code;
    if (errno === "ECONNREFUSED" || errno === "ENOTFOUND" || errno === "ETIMEDOUT") {
        return true;
    }

    const message = error.message.toLowerCase();
    return (
        message.includes("connect") ||
        message.includes("connection terminated") ||
        message.includes("password authentication failed")
    );
}

function wrapConnectionError(error: unknown): Error {
    const hint =
        "No se pudo conectar a PostgreSQL. Comprueba DATABASE_URL y que Docker (servicio db) esté en marcha.";

    if (error instanceof Error) {
        return new Error(`${hint} Detalle: ${error.message}`, { cause: error });
    }

    return new Error(hint);
}

/**
 * Cliente de base de datos. Usa consultas parametrizadas ($1, $2, …) sobre
 * `usuarios`, `fichajes` y el resto de tablas; nunca concatenes valores en el SQL.
 *
 * @example
 * const { rows } = await db.query("SELECT id, email FROM usuarios WHERE id = $1", [userId]);
 * await db.query(
 *   "INSERT INTO fichajes (usuario_id, tipo, dispositivo) VALUES ($1, $2, $3)",
 *   [userId, "ENTRADA", "web"]
 * );
 */
export const db = {
    async query<T extends QueryResultRow = QueryResultRow>(
        text: string,
        params?: unknown[]
    ): Promise<QueryResult<T>> {
        try {
            return await getPool().query<T>(text, params);
        } catch (error) {
            if (isConnectionError(error)) {
                throw wrapConnectionError(error);
            }
            throw error;
        }
    }
};
