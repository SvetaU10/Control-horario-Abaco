/** Muestra un popup con textos que llegan del backend (éxito o error). */
function showServerPopup(message, isError = false) {
    const text = String(message || "").trim();
    if (!text) {
        return;
    }

    const prefix = isError ? "Servidor (error):\n\n" : "Servidor:\n\n";
    window.alert(prefix + text);
}

function formatServerMessage(data, ok) {
    if (!data || typeof data !== "object") {
        return ok ? "Respuesta recibida." : "Error desconocido.";
    }

    if (typeof data.error === "string" && data.error) {
        return data.error;
    }

    if (typeof data.message === "string" && data.message) {
        return data.message;
    }

    if (data.user && typeof data.user === "object") {
        const u = data.user;
        const name = u.nombre
            ? `${u.nombre}${u.apellidos ? ` ${u.apellidos}` : ""}`.trim()
            : u.email;
        return `Usuario: ${name}${u.rol ? ` (${u.rol})` : ""}`;
    }

    if (data.token) {
        return "Login correcto. Token recibido.";
    }

    if (data.fichaje && data.fichaje.tipo) {
        return `Fichaje registrado: ${data.fichaje.tipo}`;
    }

    if (Array.isArray(data.fichajes)) {
        return `Historial: ${data.fichajes.length} fichaje(s).`;
    }

    if (data.ok === true) {
        return "OK";
    }

    try {
        return JSON.stringify(data, null, 2);
    } catch {
        return ok ? "Operación correcta." : "Error en la operación.";
    }
}

function notifyServerResponse(response, data) {
    const isError = !response.ok;
    showServerPopup(formatServerMessage(data, response.ok), isError);
}
