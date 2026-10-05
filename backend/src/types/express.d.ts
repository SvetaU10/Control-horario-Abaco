import type { RolUsuario } from "../repositories/usuario.repository.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                rol: RolUsuario;
            };
        }
    }
}

export {};
