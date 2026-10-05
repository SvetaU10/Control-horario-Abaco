(function initLiveClock() {
    const timeElement = document.getElementById("current-time");
    const dateElement = document.getElementById("current-date");

    if (!timeElement) {
        return;
    }

    const timeFormatter = new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const dateFormatter = new Intl.DateTimeFormat("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    function updateClock() {
        const now = new Date();
        timeElement.textContent = timeFormatter.format(now);

        if (dateElement) {
            dateElement.textContent = dateFormatter.format(now);
        }
    }

    updateClock();
    window.setInterval(updateClock, 1000);
})();
