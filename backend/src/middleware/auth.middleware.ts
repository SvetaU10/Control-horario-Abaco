import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";
import type { JwtPayload } from "../types/jwt-payload.js";
import type { RolUsuario } from "../repositories/usuario.repository.js";
import { ROLES_USUARIO } from "../repositories/usuario.repository.js";

function esRolUsuario(valor: unknown): valor is RolUsuario {
    return typeof valor === "string" && (ROLES_USUARIO as readonly string[]).includes(valor);
}

function parsePayload(decoded: unknown): JwtPayload | null {
    if (typeof decoded !== "object" || decoded === null) {
        return null;
    }

    const { sub, email, rol } = decoded as Record<string, unknown>;

    if (typeof sub !== "number" || typeof email !== "string" || !esRolUsuario(rol)) {
        return null;
    }

    return { sub, email, rol };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token no proporcionado." });
        return;
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
        res.status(401).json({ error: "Token no proporcionado." });
        return;
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        const payload = parsePayload(decoded);

        if (!payload) {
            res.status(401).json({ error: "Token inválido." });
            return;
        }

        req.user = {
            id: payload.sub,
            email: payload.email,
            rol: payload.rol
        };

        next();
    } catch {
        res.status(401).json({ error: "Token inválido o expirado." });
    }
}
