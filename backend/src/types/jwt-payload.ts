import type { RolUsuario } from "../repositories/usuario.repository.js";

export interface JwtPayload {
    sub: number;
    email: string;
    rol: RolUsuario;
}
