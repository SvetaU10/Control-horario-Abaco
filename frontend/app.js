const LEGACY_STORAGE_KEY = "ureche-time-records";

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
});

const logHourFormatter = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
});

function getStorageKey(user) {
    return `${LEGACY_STORAGE_KEY}-${user}`;
}

function initApp() {
    if (typeof isUserLoggedIn !== "function" || !isUserLoggedIn()) {
        window.location.replace("login.html");
        return;
    }

    const currentUser = getLoggedUser();
    const statusElement = document.querySelector("#status");
    const logElement = document.querySelector("#log");
    const clearButton = document.querySelector("#clear-log");
    const logoutButton = document.querySelector("#logout-btn");
    const entradaButton = document.querySelector("#btn-entrada");
    const salidaButton = document.querySelector("#btn-salida");

    if (!logElement || !entradaButton || !salidaButton || !statusElement) {
        console.error("Fichaje: faltan elementos en la página. Recarga con Ctrl+F5.");
        return;
    }

    displaySessionUser();

    function loadRecords() {
        try {
            const storageKey = getStorageKey(currentUser);
            const storedRecords = JSON.parse(localStorage.getItem(storageKey));

            if (Array.isArray(storedRecords)) {
                const normalized = storedRecords
                    .filter((record) => {
                        const worker = record.worker;
                        if (worker === undefined || worker === null || worker === "") {
                            return true;
                        }
                        return String(worker) === String(currentUser);
                    })
                    .map((record) => ({
                        ...record,
                        worker: record.worker || currentUser
                    }));

                const needsSave =
                    normalized.length !== storedRecords.length ||
                    storedRecords.some((record) => !record.worker);

                if (needsSave) {
                    saveRecords(normalized);
                }

                return normalized;
            }

            const legacyRecords = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
            if (!Array.isArray(legacyRecords)) {
                return [];
            }

            const userRecords = legacyRecords.filter((record) => record.worker === currentUser);
            if (userRecords.length > 0) {
                saveRecords(userRecords);
            }

            return userRecords;
        } catch {
            return [];
        }
    }

    function saveRecords(records) {
        try {
            localStorage.setItem(getStorageKey(currentUser), JSON.stringify(records));
            return true;
        } catch {
            return false;
        }
    }

    function dayKey(isoDate) {
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function formatHour(isoDate) {
        return logHourFormatter.format(new Date(isoDate));
    }

    function formatLogDayHeader(isoDate) {
        const date = new Date(isoDate);
        const weekday = date.toLocaleDateString("es-ES", { weekday: "long" }).toUpperCase();
        const day = date.getDate();
        const month = date
            .toLocaleDateString("es-ES", { month: "short" })
            .replace(/\./g, "")
            .toUpperCase();

        return `${weekday} ${day} ${month}`;
    }

    function buildLogGroups(records) {
        const sorted = [...records].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const groups = new Map();

        sorted.forEach((record) => {
            const key = dayKey(record.date);

            if (!groups.has(key)) {
                groups.set(key, {
                    day: record.date,
                    entradas: [],
                    salidas: []
                });
            }

            const group = groups.get(key);
            if (record.action === "entrada") {
                group.entradas.push(record.date);
            } else {
                group.salidas.push(record.date);
            }
        });

        const rows = [];

        groups.forEach((group) => {
            const pairCount = Math.max(group.entradas.length, group.salidas.length, 1);

            for (let index = 0; index < pairCount; index += 1) {
                rows.push({
                    day: group.entradas[index] || group.salidas[index] || group.day,
                    entrada: group.entradas[index] || null,
                    salida: group.salidas[index] || null
                });
            }
        });

        return rows.sort((a, b) => {
            const aTime = new Date(a.salida || a.entrada || a.day).getTime();
            const bTime = new Date(b.salida || b.entrada || b.day).getTime();
            return bTime - aTime;
        });
    }

    function createTimeSlot(label, isoDate) {
        const slot = document.createElement("span");
        slot.className = "log-slot";

        const labelEl = document.createElement("span");
        labelEl.className = "log-label";
        labelEl.textContent = `${label}:`;

        const timeEl = document.createElement("time");
        timeEl.className = "log-time-value";
        if (isoDate) {
            timeEl.dateTime = isoDate;
            timeEl.textContent = formatHour(isoDate);
        } else {
            timeEl.textContent = "—";
        }

        slot.append(labelEl, " ", timeEl);
        return slot;
    }

    function createLogDayItem(row) {
        const item = document.createElement("li");
        item.className = "log-day";

        const dateLine = document.createElement("p");
        dateLine.className = "log-day-date";
        dateLine.textContent = formatLogDayHeader(row.day);

        const times = document.createElement("div");
        times.className = "log-day-times";
        times.append(
            createTimeSlot("Entrada", row.entrada),
            createTimeSlot("Salida", row.salida)
        );

        item.append(dateLine, times);
        return item;
    }

    function renderRecords() {
        const records = loadRecords();
        logElement.replaceChildren();

        if (records.length === 0) {
            const emptyState = document.createElement("li");
            emptyState.className = "empty-log";
            emptyState.textContent = "Todavía no hay fichajes en tu cuenta.";
            logElement.append(emptyState);
            if (clearButton) {
                clearButton.hidden = true;
            }
            updateActionButtons([]);
            return;
        }

        if (clearButton) {
            clearButton.hidden = false;
        }

        buildLogGroups(records)
            .slice(0, 8)
            .forEach((row) => {
                logElement.append(createLogDayItem(row));
            });

        updateActionButtons(records);
    }

    function showStatus(message, isError = false) {
        statusElement.textContent = message;
        statusElement.classList.toggle("error", isError);
    }

    function hasActionToday(records, action) {
        const today = dayKey(new Date().toISOString());
        return records.some(
            (record) => record.action === action && dayKey(record.date) === today
        );
    }

    function updateActionButtons(records) {
        const hasEntrada = hasActionToday(records, "entrada");
        const hasSalida = hasActionToday(records, "salida");

        entradaButton.disabled = false;
        salidaButton.disabled = false;
        entradaButton.classList.toggle("btn-done", hasEntrada);
        salidaButton.classList.toggle("btn-done", hasSalida);
        salidaButton.classList.toggle("btn-wait", !hasEntrada && !hasSalida);
    }

    function registerClock(action) {
        const records = loadRecords();

        if (action === "entrada" && hasActionToday(records, "entrada")) {
            showStatus("Ya has fichado la entrada hoy.", true);
            return;
        }

        if (action === "salida" && !hasActionToday(records, "entrada")) {
            showStatus("Primero debes fichar la entrada hoy.", true);
            return;
        }

        if (action === "salida" && hasActionToday(records, "salida")) {
            showStatus("Ya has fichado la salida hoy.", true);
            return;
        }

        const currentDate = new Date();
        records.unshift({
            worker: currentUser,
            action,
            date: currentDate.toISOString()
        });

        if (!saveRecords(records.slice(0, 50))) {
            showStatus("No se pudo guardar el fichaje.", true);
            return;
        }

        const actionLabel = action === "entrada" ? "Entrada" : "Salida";
        showStatus(`${actionLabel} registrada a las ${timeFormatter.format(currentDate)}.`);
        renderRecords();
    }

    entradaButton.addEventListener("click", () => registerClock("entrada"));
    salidaButton.addEventListener("click", () => registerClock("salida"));

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            localStorage.removeItem(getStorageKey(currentUser));
            showStatus("Se ha borrado tu historial.");
            renderRecords();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            clearUserSession();
            window.location.replace("login.html");
        });
    }

    renderRecords();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
