import prisma from "../db.server";

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    const shop = url.searchParams.get("shop");

    console.log("✅ [API/AVAILABILITY] Solicitud:", { city, shop });

    if (!city || !shop) {
      return Response.json(
        { success: false, error: "Ciudad y shop requeridos" },
        { status: 400 }
      );
    }

    // Obtener configuración global de esta tienda
    const globalConfig = await prisma.config.findUnique({
      where: { shop },
    });
    const config = globalConfig || { mode: "mismo_dia", daysAhead: 1 };

    const cityConfig = await prisma.city.findFirst({
      where: { 
        shop,
        name: city, 
        active: true 
      },
    });

    if (!cityConfig) {
      return Response.json(
        { success: false, error: "Ciudad no disponible" },
        { status: 404 }
      );
    }

    const holidays = await prisma.holiday.findMany({
      where: { 
        shop,
        active: true 
      },
      select: { date: true },
    });

    const holidayDates = holidays.map((h) => 
      h.date.toISOString().split("T")[0]
    );

    // Obtener hora actual de Chile (GMT-4)
    const now = new Date();
    const chileTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Santiago" }));
    
    const currentHour = chileTime.getHours();
    const currentMinute = chileTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Parsear hora de corte (formato "HH:MM")
    const [cutoffHour, cutoffMinute] = cityConfig.cutoffTime.split(':').map(Number);
    const cutoffTimeInMinutes = cutoffHour * 60 + cutoffMinute;
    
    // Determinar offset según el modo
    let startDayOffset;
    
    if (config.mode === "mismo_dia") {
      // Modo mismo día: si ya cortó hoy, empezar desde mañana
      startDayOffset = currentTimeInMinutes >= cutoffTimeInMinutes ? 1 : 0;
    } else {
      // Modo día futuro: siempre agregar daysAhead
      // Si ya cortó hoy, agregar 1 día más
      const extraDay = currentTimeInMinutes >= cutoffTimeInMinutes ? 1 : 0;
      startDayOffset = config.daysAhead + extraDay;
    }
    
    console.log("⏰ [API/AVAILABILITY] Debug horario:", {
      modo: config.mode,
      diasAnticipacion: config.daysAhead,
      horaActualChile: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
      horaCorte: cityConfig.cutoffTime,
      minutosActuales: currentTimeInMinutes,
      minutosCorte: cutoffTimeInMinutes,
      yaCortoHoy: currentTimeInMinutes >= cutoffTimeInMinutes,
      offsetCalculado: startDayOffset,
      primeraFechaDesde: `+${startDayOffset} días`
    });

    const availableDates = [];
    const deliveryDays = JSON.parse(cityConfig.days);

    // Calcular fechas disponibles (próximos 365 días desde el offset)
    for (let i = startDayOffset; i < 365 + startDayOffset; i++) {
      const date = new Date(chileTime);
      date.setDate(chileTime.getDate() + i);

      const dateStr = date.toISOString().split("T")[0];
      const dayName = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"][date.getDay()];

      if (deliveryDays[dayName] && !holidayDates.includes(dateStr)) {
        availableDates.push(dateStr);
      }
    }

    console.log("✅ [API/AVAILABILITY] Fechas calculadas:", {
      city,
      total: availableDates.length,
      primeraFecha: availableDates[0],
      ultimaFecha: availableDates[availableDates.length - 1]
    });

    return Response.json({
      success: true,
      city: city,
      availableDates: availableDates,
      cutoffTime: cityConfig.cutoffTime,
      debug: {
        modo: config.mode,
        horaActual: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
        horaCorte: cityConfig.cutoffTime,
        yaCorto: currentTimeInMinutes >= cutoffTimeInMinutes,
        offsetDias: startDayOffset
      }
    });

  } catch (err) {
    console.error("❌ [API/AVAILABILITY] Error:", err);
    return Response.json(
      { success: false, error: "Error al calcular disponibilidad" },
      { status: 500 }
    );
  }
};