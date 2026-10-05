import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import fichajesRoutes from "./routes/fichajes.routes.js";

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/api/health", (_req, res) => {
        res.json({ ok: true });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/fichajes", fichajesRoutes);

    return app;
}
