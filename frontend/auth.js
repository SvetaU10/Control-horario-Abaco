const API_BASE = "http://localhost:3000";
const SESSION_TOKEN = "ureche-auth-token";
const SESSION_FLAG = "ureche-logged-in";
const SESSION_USER = "ureche-username";

/** Token JWT guardado tras el login */
function getAuthToken() {
    return sessionStorage.getItem(SESSION_TOKEN) || "";
}

function isUserLoggedIn() {
    return Boolean(getAuthToken());
}

function getLoggedUser() {
    return sessionStorage.getItem(SESSION_USER) || "";
}

function setUserSessionFromApi(token, user) {
    sessionStorage.setItem(SESSION_TOKEN, token);
    sessionStorage.setItem(SESSION_FLAG, "true");
    const label = user.nombre
        ? `${user.nombre} ${user.apellidos || ""}`.trim()
        : user.email;
    sessionStorage.setItem(SESSION_USER, label);
}

function clearUserSession() {
    sessionStorage.removeItem(SESSION_TOKEN);
    sessionStorage.removeItem(SESSION_FLAG);
    sessionStorage.removeItem(SESSION_USER);
}

/**
 * Llamada genérica a tu API (login, fichajes, etc.)
 */
async function apiFetch(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const token = getAuthToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (typeof notifyServerResponse === "function") {
        notifyServerResponse(response, data);
    }

    if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
    }

    return data;
}

/** POST /api/auth/login — sin token todavía */
async function loginWithApi(email, password) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (typeof notifyServerResponse === "function") {
        notifyServerResponse(response, data);
    }

    if (!response.ok) {
        throw new Error(data.error || "Email o contraseña incorrectos.");
    }

    return data; // { token, user }
}
/** POST /api/fichajes — ENTRADA o SALIDA */
async function fichar(tipo) {
    return apiFetch("/api/fichajes", {
        method: "POST",
        body: JSON.stringify({
            tipo,
            dispositivo: navigator.userAgent
        })
    });
}

/** GET /api/fichajes/ultimo */
async function obtenerUltimoFichaje() {
    return apiFetch("/api/fichajes/ultimo");
}

/** GET /api/fichajes/mios */
async function obtenerMisFichajes(limite = 50) {
    const query = limite ? `?limit=${encodeURIComponent(limite)}` : "";
    return apiFetch(`/api/fichajes/mios${query}`);
}
function displaySessionUser() {
    const el = document.getElementById("session-user");
    if (el) {
        el.textContent = getLoggedUser();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", displaySessionUser);
} else {
    displaySessionUser();
}