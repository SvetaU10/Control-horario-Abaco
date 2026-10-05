import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { getJwtExpiresIn, getJwtSecret } from "../config/env.js";
import {
    UsuarioPublico,
    UsuarioRepository
} from "../repositories/usuario.repository.js";

export class AuthError extends Error {
    constructor(
        message: string,
        readonly statusCode: number
    ) {
        super(message);
        this.name = "AuthError";
    }
}

export interface LoginResult {
    token: string;
    user: UsuarioPublico;
}

export class AuthService {
    constructor(private readonly usuarios = new UsuarioRepository()) {}

    async login(email: string, password: string): Promise<LoginResult> {
        if (!email?.trim() || !password) {
            throw new AuthError("Email y contraseña son obligatorios.", 400);
        }

        const usuario = await this.usuarios.buscarPorEmail(email);

        if (!usuario || !usuario.activo) {
            throw new AuthError("Email o contraseña incorrectos.", 401);
        }

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            throw new AuthError("Email o contraseña incorrectos.", 401);
        }

        const signOptions: SignOptions = {
            expiresIn: getJwtExpiresIn() as SignOptions["expiresIn"]
        };

        const token = jwt.sign(
            {
                sub: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            getJwtSecret(),
            signOptions
        );

        const { password_hash: _hash, ...user } = usuario;

        return { token, user };
    }

    async obtenerPerfil(usuarioId: number): Promise<UsuarioPublico> {
        const usuario = await this.usuarios.buscarPorId(usuarioId);

        if (!usuario || !usuario.activo) {
            throw new AuthError("Sesión no válida.", 401);
        }

        return usuario;
    }
}
