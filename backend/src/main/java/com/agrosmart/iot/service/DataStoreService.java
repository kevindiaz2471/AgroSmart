package com.agrosmart.iot.service;

import com.agrosmart.iot.model.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class DataStoreService {

    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, Place> places = new ConcurrentHashMap<>();
    private final Map<String, Zone> zones = new ConcurrentHashMap<>();
    private final List<HistoryEvent> history = new CopyOnWriteArrayList<>();
    private final List<SystemAlert> alerts = new CopyOnWriteArrayList<>();

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter TIME_ONLY = DateTimeFormatter.ofPattern("HH:mm:ss");
    private final ObjectMapper mapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    private final Path storePath = Paths.get("data", "agrosmart-store.json");

    @PostConstruct
    public void initDefaultData() {
        if (loadFromDisk()) {
            return;
        }

        // Users
        User admin = new User("usr-1", "admin@agrosmart.io", "admin123", "Ing. Kevin Díaz", "Administrador Agrícola");
        User operator = new User("usr-2", "operador@upec.edu.ec", "user123", "Carlos Mendoza", "Operador de Riego");
        users.put(admin.getId(), admin);
        users.put(operator.getId(), operator);

        // Places
        Place p1 = new Place("place-1", "usr-1", "Finca El Paraíso - Invernaderos", "Sector La Cocha, Parcela 12", "0.8123, -77.7145", "Invernaderos de cultivo de hortalizas con riego por goteo automatizado (Simulado).");
        Place p2 = new Place("place-2", "usr-1", "Huerto Experimental UPEC Sur", "Campus Universitario, Parcela B", "0.8245, -77.7210", "Zona experimental de cultivos de maíz y frutales de clima frío.");
        places.put(p1.getId(), p1);
        places.put(p2.getId(), p2);

        String nowStr = now();

        // Zones
        Zone z1 = new Zone("zone-1", "place-1", "Zona 1 - Tomates Cherry", "Tomate Cherry", "AUTO", 30, 70, 15, 15, 44, false, true, true);
        z1.setCooldownSec(30);
        z1.setFlowRateLpm(12.0);
        z1.setLastTelemetryTime(nowStr);
        z1.getSchedules().add(new Schedule("sch-1", "LUN, MIÉ, VIE", "06:00", 10, true));
        z1.getSchedules().add(new Schedule("sch-2", "MAR, JUE", "18:00", 15, false));
        seedZoneMoistureSeries(z1, new int[]{52, 49, 46, 42, 38, 34, 29, 45, 62, 71, 66, 58, 51, 47, 44});

        Zone z2 = new Zone("zone-2", "place-1", "Zona 2 - Pimientos Morrón", "Pimiento Morrón", "AUTO", 35, 75, 20, 30, 58, false, true, true);
        z2.setCooldownSec(45);
        z2.setFlowRateLpm(15.0);
        z2.setLastTelemetryTime(nowStr);
        z2.getSchedules().add(new Schedule("sch-4", "LUN, JUE", "07:30", 12, true));
        seedZoneMoistureSeries(z2, new int[]{64, 62, 60, 57, 54, 50, 46, 41, 37, 34, 52, 68, 76, 65, 58});

        Zone z3 = new Zone("zone-3", "place-2", "Zona 1 - Maíz Forrajero", "Maíz Forrajero", "SCHEDULED", 25, 65, 30, 60, 36, false, true, true);
        z3.setCooldownSec(60);
        z3.setFlowRateLpm(18.0);
        z3.setLastTelemetryTime(nowStr);
        z3.getSchedules().add(new Schedule("sch-3", "DIARIO", "07:00", 20, true));
        seedZoneMoistureSeries(z3, new int[]{48, 45, 42, 39, 35, 31, 28, 44, 59, 64, 56, 49, 43, 39, 36});

        zones.put(z1.getId(), z1);
        zones.put(z2.getId(), z2);
        zones.put(z3.getId(), z3);

        // Seed realistic simulated history across Today, Last 7 days, and Last 30 days
        LocalDateTime now = LocalDateTime.now();
        history.add(new HistoryEvent("h-1", "zone-1", "Zona 1 - Tomates Cherry",
                now.minusHours(3).format(FORMATTER), now.minusHours(3).plusMinutes(8).format(FORMATTER),
                480, 28, 71, "AUTO", "COMPLETADO", 96.0));
        history.add(new HistoryEvent("h-2", "zone-2", "Zona 2 - Pimientos Morrón",
                now.minusHours(6).format(FORMATTER), now.minusHours(6).plusMinutes(10).format(FORMATTER),
                600, 33, 75, "AUTO", "COMPLETADO", 150.0));
        history.add(new HistoryEvent("h-3", "zone-1", "Zona 1 - Tomates Cherry",
                now.minusDays(1).withHour(6).withMinute(0).withSecond(0).format(FORMATTER),
                now.minusDays(1).withHour(6).withMinute(10).withSecond(0).format(FORMATTER),
                600, 38, 69, "SCHEDULED", "COMPLETADO", 120.0));
        history.add(new HistoryEvent("h-4", "zone-3", "Zona 1 - Maíz Forrajero",
                now.minusDays(2).withHour(7).withMinute(0).withSecond(0).format(FORMATTER),
                now.minusDays(2).withHour(7).withMinute(15).withSecond(0).format(FORMATTER),
                900, 24, 65, "SCHEDULED", "COMPLETADO", 270.0));
        history.add(new HistoryEvent("h-5", "zone-2", "Zona 2 - Pimientos Morrón",
                now.minusDays(4).withHour(16).withMinute(20).withSecond(0).format(FORMATTER),
                now.minusDays(4).withHour(16).withMinute(26).withSecond(0).format(FORMATTER),
                360, 41, 72, "MANUAL", "COMPLETADO", 90.0));
        history.add(new HistoryEvent("h-6", "zone-1", "Zona 1 - Tomates Cherry",
                now.minusDays(12).withHour(14).withMinute(10).withSecond(0).format(FORMATTER),
                now.minusDays(12).withHour(14).withMinute(19).withSecond(0).format(FORMATTER),
                540, 29, 70, "AUTO", "COMPLETADO", 108.0));

        // Initial Alert
        alerts.add(new SystemAlert(
                "alt-1",
                "zone-1",
                "Zona 1 - Tomates Cherry",
                "INFO",
                "BAJA",
                "SYSTEM_START",
                "Motor de simulación y automatización AgroSmart IoT activo.",
                "Verifique los umbrales de humedad o utilice el Laboratorio de Simulación para evaluar escenarios.",
                nowStr,
                true
        ));

        saveToDisk();
    }

    private void seedZoneMoistureSeries(Zone zone, int[] values) {
        LocalDateTime base = LocalDateTime.now().minusMinutes(values.length * 5L);
        List<Map<String, Object>> points = new ArrayList<>();
        for (int i = 0; i < values.length; i++) {
            LocalDateTime t = base.plusMinutes(i * 5L);
            Map<String, Object> pt = new LinkedHashMap<>();
            pt.put("time", t.format(TIME_ONLY));
            pt.put("moisture", values[i]);
            pt.put("pumpState", i >= 6 && i <= 9);
            points.add(pt);
        }
        zone.setMoistureHistory(points);
    }

    public synchronized void saveToDisk() {
        try {
            if (storePath.getParent() != null) {
                Files.createDirectories(storePath.getParent());
            }
            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("users", new ArrayList<>(users.values()));
            snapshot.put("places", new ArrayList<>(places.values()));
            snapshot.put("zones", new ArrayList<>(zones.values()));
            snapshot.put("history", new ArrayList<>(history));
            snapshot.put("alerts", new ArrayList<>(alerts));
            mapper.writeValue(storePath.toFile(), snapshot);
        } catch (Exception e) {
            System.err.println("No se pudo guardar el estado en disco: " + e.getMessage());
        }
    }

    private boolean loadFromDisk() {
        File file = storePath.toFile();
        if (!file.exists()) return false;
        try {
            Map<String, Object> raw = mapper.readValue(file, new TypeReference<Map<String, Object>>() {});
            if (raw == null) return false;

            List<User> loadedUsers = mapper.convertValue(raw.getOrDefault("users", List.of()), new TypeReference<List<User>>() {});
            List<Place> loadedPlaces = mapper.convertValue(raw.getOrDefault("places", List.of()), new TypeReference<List<Place>>() {});
            List<Zone> loadedZones = mapper.convertValue(raw.getOrDefault("zones", List.of()), new TypeReference<List<Zone>>() {});
            List<HistoryEvent> loadedHistory = mapper.convertValue(raw.getOrDefault("history", List.of()), new TypeReference<List<HistoryEvent>>() {});
            List<SystemAlert> loadedAlerts = mapper.convertValue(raw.getOrDefault("alerts", List.of()), new TypeReference<List<SystemAlert>>() {});

            if (loadedUsers.isEmpty() || loadedZones.isEmpty()) return false;

            users.clear();
            loadedUsers.forEach(u -> users.put(u.getId(), u));
            places.clear();
            loadedPlaces.forEach(p -> places.put(p.getId(), p));
            zones.clear();
            loadedZones.forEach(z -> zones.put(z.getId(), z));
            history.clear();
            history.addAll(loadedHistory);
            alerts.clear();
            alerts.addAll(loadedAlerts);
            return true;
        } catch (Exception e) {
            System.err.println("Error al cargar persistencia previa, usando datos iniciales: " + e.getMessage());
            return false;
        }
    }

    public String now() {
        return LocalDateTime.now().format(FORMATTER);
    }

    // --- Deduplicated Alert Creation ---
    public SystemAlert addOrUpdateAlert(String zoneId, String type, String priority, String code, String message, String recommendation) {
        Zone zone = zoneId != null ? zones.get(zoneId) : null;
        String zoneName = zone != null ? zone.getName() : "Sistema General";

        if (code != null && !code.isBlank()) {
            for (SystemAlert existing : alerts) {
                if (!existing.isResolved()
                        && Objects.equals(existing.getZoneId(), zoneId)
                        && code.equalsIgnoreCase(existing.getCode())) {
                    existing.setTimestamp(now());
                    existing.setMessage(message);
                    existing.setRecommendation(recommendation);
                    saveToDisk();
                    return existing;
                }
            }
        }

        SystemAlert alert = new SystemAlert(
                "alt-" + UUID.randomUUID().toString().substring(0, 8),
                zoneId,
                zoneName,
                type,
                priority,
                code != null ? code : "GENERAL",
                message,
                recommendation,
                now(),
                false
        );
        alerts.add(0, alert);
        saveToDisk();
        return alert;
    }

    public void resolveAlertsByCode(String zoneId, String code) {
        boolean changed = false;
        for (SystemAlert a : alerts) {
            if (!a.isResolved() && Objects.equals(a.getZoneId(), zoneId) && code.equalsIgnoreCase(a.getCode())) {
                a.setResolved(true);
                changed = true;
            }
        }
        if (changed) saveToDisk();
    }

    // --- Users ---
    public Optional<User> findUserByEmail(String email) {
        return users.values().stream().filter(u -> u.getEmail().equalsIgnoreCase(email)).findFirst();
    }

    public User createUser(String name, String email, String password, String role) {
        String id = "usr-" + UUID.randomUUID().toString().substring(0, 8);
        User u = new User(id, email, password, name, role != null ? role : "Operador de Riego");
        users.put(id, u);
        saveToDisk();
        return u;
    }

    public Collection<User> getAllUsers() {
        return users.values();
    }

    // --- Places ---
    public Collection<Place> getAllPlaces() {
        return places.values();
    }

    public Optional<Place> getPlaceById(String id) {
        return Optional.ofNullable(places.get(id));
    }

    public Place savePlace(Place place) {
        if (place.getId() == null || place.getId().isBlank()) {
            place.setId("place-" + UUID.randomUUID().toString().substring(0, 8));
        }
        places.put(place.getId(), place);
        saveToDisk();
        return place;
    }

    public boolean deletePlace(String id) {
        if (places.size() <= 1) return false;
        Place removed = places.remove(id);
        if (removed != null) {
            zones.values().removeIf(z -> id.equals(z.getPlaceId()));
            saveToDisk();
            return true;
        }
        return false;
    }

    // --- Zones ---
    public Collection<Zone> getAllZones() {
        return zones.values();
    }

    public List<Zone> getZonesByPlace(String placeId) {
        List<Zone> res = new ArrayList<>();
        for (Zone z : zones.values()) {
            if (z.getPlaceId().equals(placeId)) {
                res.add(z);
            }
        }
        return res;
    }

    public Optional<Zone> getZoneById(String id) {
        return Optional.ofNullable(zones.get(id));
    }

    public Zone saveZone(Zone zone) {
        if (zone.getId() == null || zone.getId().isBlank()) {
            zone.setId("zone-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (zone.getCooldownSec() <= 0) zone.setCooldownSec(30);
        if (zone.getFlowRateLpm() <= 0) zone.setFlowRateLpm(12.0);
        if (zone.getLastTelemetryTime() == null) zone.setLastTelemetryTime(now());
        if (zone.getMoistureHistory() == null || zone.getMoistureHistory().isEmpty()) {
            appendMoisturePoint(zone, zone.getCurrentMoisture());
        }
        zones.put(zone.getId(), zone);
        saveToDisk();
        return zone;
    }

    public boolean deleteZone(String id) {
        Zone removed = zones.remove(id);
        if (removed != null) {
            saveToDisk();
            return true;
        }
        return false;
    }

    private void appendMoisturePoint(Zone zone, int moisture) {
        if (zone.getMoistureHistory() == null) {
            zone.setMoistureHistory(new ArrayList<>());
        }
        Map<String, Object> pt = new LinkedHashMap<>();
        pt.put("time", LocalDateTime.now().format(TIME_ONLY));
        pt.put("moisture", moisture);
        pt.put("pumpState", zone.isPumpState());
        zone.getMoistureHistory().add(pt);
        while (zone.getMoistureHistory().size() > 30) {
            zone.getMoistureHistory().remove(0);
        }
    }

    public boolean updateZonePump(String zoneId, boolean state) {
        return updateZonePump(zoneId, state, "", null, null);
    }

    public boolean updateZonePump(String zoneId, boolean state, String reason) {
        return updateZonePump(zoneId, state, reason, null, null);
    }

    public boolean updateZonePump(String zoneId, boolean state, String reason, String triggerOverride, Integer plannedDurationMin) {
        Zone zone = zones.get(zoneId);
        if (zone == null) return false;

        // Safety validation before turning ON
        if (state) {
            if (!zone.isTankOk()) {
                addOrUpdateAlert(
                        zoneId,
                        "CRITICAL",
                        "ALTA",
                        "TANK_EMPTY",
                        "Intento de encendido bloqueado en " + zone.getName() + ": Nivel bajo en el tanque simulado.",
                        "Rellene el depósito o restablezca el nivel del tanque en el panel de simulación antes de iniciar el riego."
                );
                return false;
            }
            if (!zone.isSensorOk() && "AUTO".equalsIgnoreCase(zone.getMode()) && (triggerOverride == null || "AUTO".equalsIgnoreCase(triggerOverride))) {
                addOrUpdateAlert(
                        zoneId,
                        "CRITICAL",
                        "ALTA",
                        "SENSOR_OFFLINE",
                        "Riego automático pausado en " + zone.getName() + ": Sensor de humedad simulado desconectado.",
                        "Verifique el estado del sensor en la sección de Simulación y Diagnóstico o utilice el Modo Manual."
                );
                return false;
            }
            if ("AUTO".equalsIgnoreCase(zone.getMode()) && (triggerOverride == null || "AUTO".equalsIgnoreCase(triggerOverride))) {
                if (zone.getCurrentMoisture() > zone.getMinMoisture()) {
                    zone.setPumpState(false);
                    return false;
                }
            }
            if ("AUTO".equalsIgnoreCase(zone.getMode()) && zone.getCurrentMoisture() >= zone.getMaxMoisture()) {
                zone.setPumpState(false);
                return false;
            }
        }

        boolean previousState = zone.isPumpState();
        if (state == previousState) {
            return true;
        }

        zone.setPumpState(state);

        if (state) {
            zone.setPumpStartTime(System.currentTimeMillis());
            zone.setPumpStartTimeFormatted(now());
            zone.setPumpStartMoisture(zone.getCurrentMoisture());
            zone.setActiveTriggerType(triggerOverride != null && !triggerOverride.isBlank() ? triggerOverride : zone.getMode());
            zone.setPlannedDurationMin(plannedDurationMin);

            String msg = (reason != null && !reason.isBlank())
                    ? "Riego iniciado en " + zone.getName() + " (" + reason + "). Humedad inicial: " + zone.getCurrentMoisture() + "%."
                    : "Riego iniciado en " + zone.getName() + " (Modo: " + zone.getActiveTriggerType() + "). Humedad inicial: " + zone.getCurrentMoisture() + "%.";
            addOrUpdateAlert(
                    zoneId,
                    "INFO",
                    "BAJA",
                    "PUMP_START_" + System.currentTimeMillis(),
                    msg,
                    "Monitoree el incremento de humedad o espere la detención automática."
            );
        } else {
            long startMs = zone.getPumpStartTime() != null ? zone.getPumpStartTime() : (System.currentTimeMillis() - 60000);
            int durationSec = Math.max(5, (int) Math.round((System.currentTimeMillis() - startMs) / 1000.0));
            String startFormatted = zone.getPumpStartTimeFormatted() != null ? zone.getPumpStartTimeFormatted() : now();
            int initialM = zone.getPumpStartMoisture() != null ? zone.getPumpStartMoisture() : zone.getCurrentMoisture();
            int finalM = zone.getCurrentMoisture();
            String triggerUsed = zone.getActiveTriggerType() != null ? zone.getActiveTriggerType() : zone.getMode();

            double flowLpm = zone.getFlowRateLpm() > 0 ? zone.getFlowRateLpm() : 12.0;
            double waterUsedLiters = Math.round((durationSec / 60.0) * flowLpm * 10.0) / 10.0;

            zone.setPumpStartTime(null);
            zone.setPumpStartTimeFormatted(null);
            zone.setPumpStartMoisture(null);
            zone.setActiveTriggerType(null);
            zone.setPlannedDurationMin(null);
            zone.setLastPumpStopTime(System.currentTimeMillis());

            String statusLabel = (reason != null && !reason.isBlank()) ? "CORTE (" + reason + ")" : "COMPLETADO";

            HistoryEvent event = new HistoryEvent(
                    "h-" + UUID.randomUUID().toString().substring(0, 8),
                    zoneId,
                    zone.getName(),
                    startFormatted,
                    now(),
                    durationSec,
                    initialM,
                    finalM,
                    triggerUsed,
                    statusLabel,
                    waterUsedLiters
            );
            history.add(0, event);

            boolean isAbnormal = reason != null && !reason.isBlank()
                    && !reason.toLowerCase().contains("umbral")
                    && !reason.toLowerCase().contains("programado")
                    && !reason.toLowerCase().contains("manual");

            String alertType = isAbnormal ? "WARNING" : "SUCCESS";
            String priority = isAbnormal ? "MEDIA" : "BAJA";
            String alertMsg = (reason != null && !reason.isBlank())
                    ? "Riego finalizado en " + zone.getName() + " (" + reason + "). Consumo simulado: " + waterUsedLiters + " L."
                    : "Riego completado en " + zone.getName() + " (" + durationSec + "s, " + initialM + "% -> " + finalM + "%). Consumo simulado: " + waterUsedLiters + " L.";

            addOrUpdateAlert(
                    zoneId,
                    alertType,
                    priority,
                    isAbnormal ? "PUMP_CUTOFF" : "PUMP_DONE_" + System.currentTimeMillis(),
                    alertMsg,
                    isAbnormal
                            ? "Revise las condiciones operativas de la zona y el estado de los sensores simulados."
                            : "Ciclo registrado correctamente en el historial estadístico."
            );
        }

        appendMoisturePoint(zone, zone.getCurrentMoisture());
        saveToDisk();
        return true;
    }

    public boolean updateZoneMoisture(String zoneId, int moisture) {
        Zone zone = zones.get(zoneId);
        if (zone == null) return false;

        int clamped = Math.max(0, Math.min(100, moisture));
        zone.setCurrentMoisture(clamped);
        zone.setLastTelemetryTime(now());
        appendMoisturePoint(zone, clamped);

        // Threshold alerts
        if (clamped <= zone.getMinMoisture()) {
            addOrUpdateAlert(
                    zoneId,
                    "WARNING",
                    "MEDIA",
                    "LOW_MOISTURE",
                    "Humedad baja detectada en " + zone.getName() + " (" + clamped + "% <= mínimo " + zone.getMinMoisture() + "%).",
                    "AUTO".equalsIgnoreCase(zone.getMode())
                            ? "El sistema automático gestionará el encendido tras validar tanque y tiempo de espera (cooldown)."
                            : "La zona está en modo " + zone.getMode() + ". Considere activar el riego manualmente o cambiar a modo Automático."
            );
            resolveAlertsByCode(zoneId, "HIGH_MOISTURE");
        } else if (clamped >= zone.getMaxMoisture()) {
            resolveAlertsByCode(zoneId, "LOW_MOISTURE");
            if (clamped > zone.getMaxMoisture()) {
                addOrUpdateAlert(
                        zoneId,
                        "WARNING",
                        "MEDIA",
                        "HIGH_MOISTURE",
                        "Saturación de humedad detectada en " + zone.getName() + " (" + clamped + "% > máximo " + zone.getMaxMoisture() + "%).",
                        "El riego automático ha sido detenido para evitar asfixia radicular y desperdicio de agua."
                );
            } else {
                resolveAlertsByCode(zoneId, "HIGH_MOISTURE");
            }
        } else {
            resolveAlertsByCode(zoneId, "LOW_MOISTURE");
            resolveAlertsByCode(zoneId, "HIGH_MOISTURE");
        }

        // Hysteresis control in AUTO mode
        if ("AUTO".equalsIgnoreCase(zone.getMode())) {
            if (clamped >= zone.getMaxMoisture()) {
                if (zone.isPumpState()) {
                    updateZonePump(zoneId, false, "Umbral máximo alcanzado (" + clamped + "% >= " + zone.getMaxMoisture() + "%)", "AUTO", null);
                }
            } else if (clamped <= zone.getMinMoisture() && !zone.isPumpState()) {
                if (zone.isTankOk() && zone.isSensorOk() && isCooldownElapsed(zone)) {
                    updateZonePump(zoneId, true, "Histéresis: Humedad en o bajo " + zone.getMinMoisture() + "%", "AUTO", null);
                }
            }
        }

        saveToDisk();
        return true;
    }

    public boolean isCooldownElapsed(Zone zone) {
        if (zone.getLastPumpStopTime() == null || zone.getCooldownSec() <= 0) return true;
        long elapsedMs = System.currentTimeMillis() - zone.getLastPumpStopTime();
        return elapsedMs >= zone.getCooldownSec() * 1000L;
    }

    @Scheduled(fixedRate = 5000)
    public void evaluateWatchdogAndSchedules() {
        LocalDateTime nowTime = LocalDateTime.now();
        String currentHHMM = nowTime.format(DateTimeFormatter.ofPattern("HH:mm"));
        String currentTriggerKey = nowTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        String currentDay = mapDayOfWeek(nowTime.getDayOfWeek());

        for (Zone zone : zones.values()) {
            // 1. Safety priority: Tank empty, sensor offline, or target moisture reached in AUTO mode
            if (zone.isPumpState()) {
                if (!zone.isTankOk()) {
                    updateZonePump(zone.getId(), false, "Seguridad: Nivel bajo del tanque");
                    continue;
                }
                if (!zone.isSensorOk() && "AUTO".equalsIgnoreCase(zone.getMode())) {
                    updateZonePump(zone.getId(), false, "Seguridad: Sensor desconectado");
                    continue;
                }
                if ("AUTO".equalsIgnoreCase(zone.getMode()) && zone.getCurrentMoisture() >= zone.getMaxMoisture()) {
                    updateZonePump(zone.getId(), false, "Umbral máximo alcanzado (" + zone.getCurrentMoisture() + "% >= " + zone.getMaxMoisture() + "%)", "AUTO", null);
                    continue;
                }
            }

            // 2. Watchdog & Scheduled Duration Cutoff
            if (zone.isPumpState() && zone.getPumpStartTime() != null) {
                long elapsedMs = System.currentTimeMillis() - zone.getPumpStartTime();

                // Check individual schedule duration first
                if (zone.getPlannedDurationMin() != null && zone.getPlannedDurationMin() > 0) {
                    if (elapsedMs >= zone.getPlannedDurationMin() * 60_000L) {
                        updateZonePump(zone.getId(), false, "Turno programado completado (" + zone.getPlannedDurationMin() + " min)");
                        continue;
                    }
                }

                // Check Watchdog maximum duration
                if (zone.getMaxDurationMin() > 0 && elapsedMs >= zone.getMaxDurationMin() * 60_000L) {
                    addOrUpdateAlert(
                            zone.getId(),
                            "CRITICAL",
                            "ALTA",
                            "WATCHDOG_TIMEOUT",
                            "Tiempo máximo de riego excedido (Watchdog: " + zone.getMaxDurationMin() + " min) en " + zone.getName() + ".",
                            "Inspeccione posibles fugas en la línea o revise la respuesta del sensor de humedad."
                    );
                    updateZonePump(zone.getId(), false, "Watchdog Timer excedido (" + zone.getMaxDurationMin() + " min)");
                    continue;
                }

                // Check water consumption anomaly (running > 90s without moisture increase)
                if (elapsedMs >= 90_000L && zone.getPumpStartMoisture() != null
                        && zone.getCurrentMoisture() <= zone.getPumpStartMoisture()) {
                    addOrUpdateAlert(
                            zone.getId(),
                            "WARNING",
                            "ALTA",
                            "CONSUMPTION_ANOMALY",
                            "Anomalía en consumo estimado en " + zone.getName() + ": La bomba está activa pero la humedad no sube (" + zone.getCurrentMoisture() + "%).",
                            "Active la subida de humedad en el simulador o verifique si existe una obstrucción/fuga simulada."
                    );
                }
            }

            // 3. Scheduled irrigation trigger
            if ("SCHEDULED".equalsIgnoreCase(zone.getMode()) && !zone.isPumpState() && zone.isTankOk()) {
                for (Schedule s : zone.getSchedules()) {
                    if (s.isActive() && currentHHMM.equals(s.getTime())) {
                        if (currentTriggerKey.equals(s.getLastTriggeredKey())) {
                            continue; // Already executed in this minute
                        }
                        String daysUpper = s.getDays() != null ? s.getDays().toUpperCase() : "";
                        if (daysUpper.contains("DIARIO") || daysUpper.contains(currentDay)) {
                            s.setLastTriggeredKey(currentTriggerKey);
                            updateZonePump(
                                    zone.getId(),
                                    true,
                                    "Programación horaria " + s.getTime() + " (" + s.getDuration() + " min)",
                                    "SCHEDULED",
                                    s.getDuration()
                            );
                            break;
                        }
                    }
                }
            }
        }
    }

    private String mapDayOfWeek(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> "LUN";
            case TUESDAY -> "MAR";
            case WEDNESDAY -> "MIÉ";
            case THURSDAY -> "JUE";
            case FRIDAY -> "VIE";
            case SATURDAY -> "SÁB";
            case SUNDAY -> "DOM";
        };
    }

    // --- Schedules ---
    public Schedule addSchedule(String zoneId, Schedule schedule) {
        Zone zone = zones.get(zoneId);
        if (zone == null) return null;
        if (schedule.getId() == null || schedule.getId().isBlank()) {
            schedule.setId("sch-" + UUID.randomUUID().toString().substring(0, 6));
        }
        zone.getSchedules().add(schedule);
        saveToDisk();
        return schedule;
    }

    public Schedule updateSchedule(String zoneId, String scheduleId, Schedule updated) {
        Zone zone = zones.get(zoneId);
        if (zone == null) return null;
        for (Schedule s : zone.getSchedules()) {
            if (s.getId().equals(scheduleId)) {
                if (updated.getDays() != null) s.setDays(updated.getDays());
                if (updated.getTime() != null) s.setTime(updated.getTime());
                if (updated.getDuration() > 0) s.setDuration(updated.getDuration());
                s.setActive(updated.isActive());
                saveToDisk();
                return s;
            }
        }
        return null;
    }

    public boolean removeSchedule(String zoneId, String scheduleId) {
        Zone zone = zones.get(zoneId);
        if (zone == null) return false;
        boolean removed = zone.getSchedules().removeIf(s -> s.getId().equals(scheduleId));
        if (removed) saveToDisk();
        return removed;
    }

    // --- History & Alerts ---
    public List<HistoryEvent> getHistory() {
        return history;
    }

    public void clearHistory() {
        history.clear();
        saveToDisk();
    }

    public List<SystemAlert> getAlerts() {
        return alerts;
    }

    public void addAlert(SystemAlert alert) {
        if (alert.getId() == null) alert.setId("alt-" + UUID.randomUUID().toString().substring(0, 8));
        if (alert.getTimestamp() == null) alert.setTimestamp(now());
        if (alert.getPriority() == null) alert.setPriority("MEDIA");
        alerts.add(0, alert);
        saveToDisk();
    }

    public boolean resolveAlert(String alertId) {
        for (SystemAlert a : alerts) {
            if (a.getId().equals(alertId)) {
                a.setResolved(true);
                saveToDisk();
                return true;
            }
        }
        return false;
    }

    public void resolveAllAlerts() {
        for (SystemAlert a : alerts) {
            a.setResolved(true);
        }
        saveToDisk();
    }

    public void clearResolvedAlerts() {
        alerts.removeIf(SystemAlert::isResolved);
        saveToDisk();
    }
}
