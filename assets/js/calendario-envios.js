document.addEventListener("DOMContentLoaded", () => {
    const $city = document.querySelector("#ce-city");
    const $date = document.querySelector("#ce-date");
    const $save = document.querySelector("#ce-save-calendar");
    const $msg  = document.querySelector("#ce-calendar-message");

    if (!$city || !$date || !$save) return;

    // Cargar fechas válidas al cambiar la ciudad
    $city.addEventListener("change", async () => {
        const city = $city.value;
        if (!city) return;

        $msg.textContent = "Cargando fechas disponibles...";
        $msg.style.color = "#555";

        try {
            const res = await fetch(`${ceData.ajaxUrl}?action=ce_get_availability&city=${encodeURIComponent(city)}`);
            const data = await res.json();

            if (data.success && Array.isArray(data.dates) && data.dates.length) {
                $date.min = data.dates[0];
                $date.max = data.dates[data.dates.length - 1];
                $msg.textContent = `Fechas actualizadas para ${city}`;
                $msg.style.color = "green";
            } else {
                $msg.textContent = "No hay fechas disponibles para esta ciudad.";
                $msg.style.color = "red";
            }
        } catch (err) {
            console.error("Error cargando fechas:", err);
            $msg.textContent = "Error cargando fechas.";
            $msg.style.color = "red";
        }
    });

    // Guardar selección (ciudad + fecha)
    $save.addEventListener("click", async (e) => {
        e.preventDefault();
        const city = $city.value;
        const date = $date.value;

        if (!city || !date) {
            $msg.textContent = "⚠️ Selecciona ciudad y fecha antes de continuar.";
            $msg.style.color = "red";
            return;
        }

        try {
            const formData = new FormData();
            formData.append("action", "ce_save_selection");
            formData.append("city", city);
            formData.append("date", date);
            formData.append("nonce", ceData.nonce);

            const res = await fetch(ceData.ajaxUrl, { method: "POST", body: formData });
            const data = await res.json();

            if (data.success) {
                $msg.textContent = "✅ Selección guardada correctamente.";
                $msg.style.color = "green";
            } else {
                $msg.textContent = "❌ Error al guardar la selección.";
                $msg.style.color = "red";
            }
        } catch (err) {
            console.error("Error guardando selección:", err);
            $msg.textContent = "Error de conexión.";
            $msg.style.color = "red";
        }
    });
});
