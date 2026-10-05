export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET no está definida en el entorno.");
    }
    return secret;
}

export function getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN ?? "12h";
}
