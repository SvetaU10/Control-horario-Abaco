import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { FichajeError, FichajeService } from "../services/fichaje.service.js";

const router = Router();
const fichajeService = new FichajeService();

router.use(authMiddleware);

router.post("/", async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        if (usuarioId === undefined) {
            res.status(401).json({ error: "Token no proporcionado." });
            return;
        }

        const { tipo, dispositivo, latitud, longitud } = req.body ?? {};
        const fichaje = await fichajeService.registrar(usuarioId, {
            tipo: typeof tipo === "string" ? tipo : "",
            dispositivo: typeof dispositivo === "string" ? dispositivo : null,
            latitud: latitud ?? null,
            longitud: longitud ?? null
        });

        res.status(201).json({ fichaje });
    } catch (error) {
        if (error instanceof FichajeError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        console.error("[fichajes POST]", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

router.get("/ultimo", async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        if (usuarioId === undefined) {
            res.status(401).json({ error: "Token no proporcionado." });
            return;
        }

        const fichaje = await fichajeService.ultimo(usuarioId);
        res.json({ fichaje });
    } catch (error) {
        console.error("[fichajes /ultimo]", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

router.get("/mios", async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        if (usuarioId === undefined) {
            res.status(401).json({ error: "Token no proporcionado." });
            return;
        }

        const limite = Number(req.query.limit) || 50;
        const fichajes = await fichajeService.mios(usuarioId, limite);
        res.json({ fichajes });
    } catch (error) {
        console.error("[fichajes /mios]", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

export default router;