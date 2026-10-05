import {
    Fichaje,
    FichajeRepository,
    TIPOS_FICHAJE,
    type TipoFichaje
} from "../repositories/fichaje.repository.js";

export class FichajeError extends Error {
    constructor(
        message: string,
        readonly statusCode: number
    ) {
        super(message);
        this.name = "FichajeError";
    }
}

export interface CrearFichajeInput {
    tipo: string;
    dispositivo?: string | null;
    latitud?: number | string | null;
    longitud?: number | string | null;
}

function esTipoFichaje(valor: string): valor is TipoFichaje {
    return (TIPOS_FICHAJE as readonly string[]).includes(valor);
}

export class FichajeService {
    constructor(private readonly fichajes = new FichajeRepository()) {}

    async registrar(usuarioId: number, input: CrearFichajeInput): Promise<Fichaje> {
        if (!esTipoFichaje(input.tipo)) {
            throw new FichajeError("tipo debe ser ENTRADA o SALIDA.", 400);
        }

        const ultimo = await this.fichajes.buscarUltimoPorUsuario(usuarioId);

        if (ultimo?.tipo === input.tipo) {
            throw new FichajeError(
                `Ya tienes una ${input.tipo}; el siguiente debe ser ${input.tipo === "ENTRADA" ? "SALIDA" : "ENTRADA"}.`,
                409
            );
        }

        return this.fichajes.guardar({
            usuario_id: usuarioId,
            tipo: input.tipo,
            timestamp_servidor: new Date(), 
            dispositivo: input.dispositivo ?? null,
            latitud: input.latitud ?? null,
            longitud: input.longitud ?? null
        });
    }

    async ultimo(usuarioId: number): Promise<Fichaje | null> {
        return this.fichajes.buscarUltimoPorUsuario(usuarioId);
    }

    async mios(usuarioId: number, limite = 50): Promise<Fichaje[]> {
        return this.fichajes.listarPorUsuario(usuarioId, limite);
    }
}