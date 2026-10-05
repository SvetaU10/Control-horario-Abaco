import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { AuthError, AuthService } from "../services/auth.service.js";

const router = Router();
const authService = new AuthService();

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        if (usuarioId === undefined) {
            res.status(401).json({ error: "Token no proporcionado." });
            return;
        }

        const user = await authService.obtenerPerfil(usuarioId);
        res.json({ user });
    } catch (error) {
        if (error instanceof AuthError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        console.error("[auth/me]", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        const result = await authService.login(
            typeof email === "string" ? email : "",
            typeof password === "string" ? password : ""
        );
        res.json(result);
    } catch (error) {
        if (error instanceof AuthError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }

        console.error("[auth/login]", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

export default router;
