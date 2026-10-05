// Ruta RELATIVA al proyecto (ej: "imagen.jpg" o "assets/logo.png").
// No uses rutas absolutas de Windows como C:\Users\...
// Si dejas la variable vacía, se muestra el reloj dinámico.
const CUSTOM_LOGO = "imagen.jpg";

const CLOCK_LOGO_SVG = `
<svg viewBox="0 0 48 48" class="logo-svg" aria-hidden="true">
    <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7c5cff"/>
            <stop offset="100%" stop-color="#22d3ee"/>
        </linearGradient>
    </defs>
    <circle class="logo-face" cx="24" cy="24" r="18"/>
    <circle class="logo-ring" cx="24" cy="24" r="20"/>
    <g class="logo-ticks">
        <line class="logo-tick" x1="24" y1="6" x2="24" y2="9"/>
        <line class="logo-tick" x1="24" y1="39" x2="24" y2="42"/>
        <line class="logo-tick" x1="6" y1="24" x2="9" y2="24"/>
        <line class="logo-tick" x1="39" y1="24" x2="42" y2="24"/>
    </g>
    <line class="logo-hand logo-hour" x1="24" y1="24" x2="24" y2="15"/>
    <line class="logo-hand logo-minute" x1="24" y1="24" x2="24" y2="11"/>
    <line class="logo-hand logo-second" x1="24" y1="26" x2="24" y2="10"/>
    <circle class="logo-center" cx="24" cy="24" r="2"/>
</svg>`;

function normalizeLogoPath(path) {
    const trimmed = path.trim();
    if (!trimmed) {
        return "";
    }

    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
        return trimmed;
    }

    if (/^[a-zA-Z]:[\\/]/.test(trimmed) || trimmed.includes("\\")) {
        const parts = trimmed.split(/[/\\]/).filter(Boolean);
        const projectIndex = parts.findIndex((part) => part.toLowerCase() === "cursor");

        if (projectIndex !== -1 && projectIndex < parts.length - 1) {
            return parts.slice(projectIndex + 1).join("/");
        }

        return parts[parts.length - 1];
    }

    return trimmed;
}

function setHandRotation(hand, degrees) {
    hand.setAttribute("transform", `rotate(${degrees} 24 24)`);
}

function updateLogoClock(svg) {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    setHandRotation(svg.querySelector(".logo-hour"), hours * 30 + minutes * 0.5);
    setHandRotation(svg.querySelector(".logo-minute"), minutes * 6 + seconds * 0.1);
    setHandRotation(svg.querySelector(".logo-second"), seconds * 6);
}

function renderCustomLogo(container, logoSrc) {
    container.classList.add("brand-logo--custom");
    container.replaceChildren();

    const img = document.createElement("img");
    img.className = "logo-custom";
    img.src = logoSrc;
    img.alt = "Logo";

    img.addEventListener("error", () => {
        console.warn(`No se pudo cargar el logo: ${logoSrc}`);
        renderClockLogo(container);
    });

    container.append(img);
}

function renderClockLogo(container) {
    container.classList.remove("brand-logo--custom");
    container.innerHTML = CLOCK_LOGO_SVG;

    const svg = container.querySelector(".logo-svg");
    updateLogoClock(svg);

    if (container._clockInterval) {
        window.clearInterval(container._clockInterval);
    }

    container._clockInterval = window.setInterval(() => updateLogoClock(svg), 1000);
}

function renderLogo(container) {
    const logoSrc = normalizeLogoPath(CUSTOM_LOGO);

    if (logoSrc) {
        renderCustomLogo(container, logoSrc);
        return;
    }

    renderClockLogo(container);
}

function initDynamicLogos() {
    document.querySelectorAll("[data-dynamic-logo]").forEach(renderLogo);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDynamicLogos);
} else {
    initDynamicLogos();
}
