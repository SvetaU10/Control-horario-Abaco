(function () {
    function initLogin() {
        const form = document.getElementById("login-form");
        if (!form) {
            return;
        }

        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const statusElement = document.getElementById("status");

        if (!usernameInput || !passwordInput || !statusElement) {
            console.warn("Login: faltan campos en la página.");
            return;
        }

        if (typeof loginWithApi !== "function" || typeof setUserSessionFromApi !== "function") {
            console.error("Login: carga auth.js antes que login.js.");
            return;
        }

        if (isUserLoggedIn()) {
            window.location.replace("index.html");
            return;
        }

        function showStatus(message, isError = false) {
            statusElement.textContent = message;
            statusElement.classList.toggle("error", isError);
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                showStatus("Completa email y contraseña.", true);
                return;
            }

            showStatus("Comprobando...");

            try {
                const data = await loginWithApi(email, password);
                setUserSessionFromApi(data.token, data.user);
                showStatus("Acceso correcto. Redirigiendo...");
                setTimeout(() => window.location.replace("index.html"), 400);
            } catch (error) {
                showStatus(error.message, true);
                passwordInput.value = "";
                passwordInput.focus();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLogin);
    } else {
        initLogin();
    }
})();
