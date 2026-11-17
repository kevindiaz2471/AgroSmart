package com.agrosmart.iot.controller;

import com.agrosmart.iot.model.Schedule;
import com.agrosmart.iot.model.Zone;
import com.agrosmart.iot.service.DataStoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final DataStoreService dataStore;

    public ZoneController(DataStoreService dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public Collection<Zone> getZones(@RequestParam(required = false) String placeId) {
        if (placeId != null && !placeId.isBlank()) {
            return dataStore.getZonesByPlace(placeId);
        }
        return dataStore.getAllZones();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Zone> getZoneById(@PathVariable String id) {
        return dataStore.getZoneById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createZone(@RequestBody Zone zone) {
        if (zone.getMinMoisture() >= zone.getMaxMoisture()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "La humedad mínima debe ser menor que la humedad máxima."
            ));
        }
        Zone saved = dataStore.saveZone(zone);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateZone(@PathVariable String id, @RequestBody Zone updated) {
        Optional<Zone> zoneOpt = dataStore.getZoneById(id);
        if (zoneOpt.isEmpty()) return ResponseEntity.notFound().build();

        if (updated.getMinMoisture() >= updated.getMaxMoisture()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "La humedad mínima debe ser menor que la humedad máxima."
            ));
        }

        Zone existing = zoneOpt.get();
        if (updated.getName() != null && !updated.getName().isBlank()) existing.setName(updated.getName());
        if (updated.getCropType() != null && !updated.getCropType().isBlank()) existing.setCropType(updated.getCropType());
        if (updated.getMode() != null) existing.setMode(updated.getMode().toUpperCase());
        existing.setMinMoisture(updated.getMinMoisture());
        existing.setMaxMoisture(updated.getMaxMoisture());
        if (updated.getMaxDurationMin() > 0) existing.setMaxDurationMin(updated.getMaxDurationMin());
        if (updated.getIntervalSec() > 0) existing.setIntervalSec(updated.getIntervalSec());
        if (updated.getCooldownSec() >= 0) existing.setCooldownSec(updated.getCooldownSec());
        if (updated.getFlowRateLpm() > 0) existing.setFlowRateLpm(updated.getFlowRateLpm());

        dataStore.saveToDisk();
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteZone(@PathVariable String id) {
        boolean deleted = dataStore.deleteZone(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/mode")
    public ResponseEntity<?> setZoneMode(@PathVariable String id, @RequestBody Map<String, String> body) {
        String mode = body.get("mode");
        Optional<Zone> zoneOpt = dataStore.getZoneById(id);
        if (zoneOpt.isEmpty()) return ResponseEntity.notFound().build();

        Zone zone = zoneOpt.get();
        String normalizedMode = mode != null ? mode.toUpperCase() : "AUTO";
        zone.setMode(normalizedMode);

        // Immediately evaluate AUTO rule if switching to AUTO
        if ("AUTO".equals(normalizedMode)) {
            dataStore.updateZoneMoisture(id, zone.getCurrentMoisture());
        } else {
            dataStore.saveToDisk();
        }
        return ResponseEntity.ok(zone);
    }

    @PutMapping("/{id}/config")
    public ResponseEntity<?> updateZoneConfig(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<Zone> zoneOpt = dataStore.getZoneById(id);
        if (zoneOpt.isEmpty()) return ResponseEntity.notFound().build();

        Zone zone = zoneOpt.get();
        int newMin = body.containsKey("minMoisture") ? ((Number) body.get("minMoisture")).intValue() : zone.getMinMoisture();
        int newMax = body.containsKey("maxMoisture") ? ((Number) body.get("maxMoisture")).intValue() : zone.getMaxMoisture();

        if (newMin >= newMax) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "La humedad mínima debe ser menor que la humedad máxima."
            ));
        }

        zone.setMinMoisture(newMin);
        zone.setMaxMoisture(newMax);
        if (body.containsKey("maxDurationMin")) zone.setMaxDurationMin(((Number) body.get("maxDurationMin")).intValue());
        if (body.containsKey("intervalSec")) zone.setIntervalSec(((Number) body.get("intervalSec")).intValue());
        if (body.containsKey("cooldownSec")) zone.setCooldownSec(((Number) body.get("cooldownSec")).intValue());
        if (body.containsKey("flowRateLpm")) zone.setFlowRateLpm(((Number) body.get("flowRateLpm")).doubleValue());
        if (body.containsKey("name") && body.get("name") != null) zone.setName(String.valueOf(body.get("name")));
        if (body.containsKey("cropType") && body.get("cropType") != null) zone.setCropType(String.valueOf(body.get("cropType")));

        if ("AUTO".equalsIgnoreCase(zone.getMode())) {
            dataStore.updateZoneMoisture(id, zone.getCurrentMoisture());
        } else {
            dataStore.saveToDisk();
        }
        return ResponseEntity.ok(zone);
    }

    @PostMapping("/{id}/pump")
    public ResponseEntity<?> controlPump(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<Zone> zoneOpt = dataStore.getZoneById(id);
        if (zoneOpt.isEmpty()) return ResponseEntity.notFound().build();

        Zone zone = zoneOpt.get();
        boolean state = Boolean.parseBoolean(String.valueOf(body.get("state")));
        String reason = body.get("reason") != null ? String.valueOf(body.get("reason")) : "";
        String triggerType = body.get("triggerType") != null ? String.valueOf(body.get("triggerType")) : zone.getMode();
        Integer plannedDurationMin = body.get("plannedDurationMin") instanceof Number
                ? ((Number) body.get("plannedDurationMin")).intValue()
                : null;

        boolean ok = dataStore.updateZonePump(id, state, reason, triggerType, plannedDurationMin);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "Operación bloqueada por seguridad: verifique nivel del tanque y estado del sensor."
            ));
        }

        return ResponseEntity.ok(zone);
    }

    @PostMapping("/{id}/telemetry")
    public ResponseEntity<?> updateTelemetry(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<Zone> zoneOpt = dataStore.getZoneById(id);
        if (zoneOpt.isEmpty()) return ResponseEntity.notFound().build();

        Zone zone = zoneOpt.get();
        if (body.containsKey("tankOk")) {
            boolean tankOk = Boolean.parseBoolean(String.valueOf(body.get("tankOk")));
            zone.setTankOk(tankOk);
            if (!tankOk) {
                dataStore.addOrUpdateAlert(
                        id,
                        "CRITICAL",
                        "ALTA",
                        "TANK_EMPTY",
                        "Nivel crítico del tanque de agua simulado en " + zone.getName() + ".",
                        "Restablezca el nivel del tanque en el módulo de Simulación y Diagnóstico para permitir el bombeo."
                );
                if (zone.isPumpState()) {
                    dataStore.updateZonePump(id, false, "Seguridad: Nivel bajo del tanque");
                }
            } else {
                dataStore.resolveAlertsByCode(id, "TANK_EMPTY");
            }
        }

        if (body.containsKey("sensorOk")) {
            boolean sensorOk = Boolean.parseBoolean(String.valueOf(body.get("sensorOk")));
            zone.setSensorOk(sensorOk);
            if (!sensorOk) {
                dataStore.addOrUpdateAlert(
                        id,
                        "CRITICAL",
                        "ALTA",
                        "SENSOR_OFFLINE",
                        "Pérdida de señal con el sensor simulado en " + zone.getName() + ".",
                        "Reconecte el sensor simulado en el módulo de Diagnóstico o cambie temporalmente a Modo Manual."
                );
                if (zone.isPumpState() && "AUTO".equalsIgnoreCase(zone.getMode())) {
                    dataStore.updateZonePump(id, false, "Seguridad: Sensor desconectado");
                }
            } else {
                dataStore.resolveAlertsByCode(id, "SENSOR_OFFLINE");
            }
        }

        if (body.containsKey("moisture")) {
            int moisture = ((Number) body.get("moisture")).intValue();
            dataStore.updateZoneMoisture(id, moisture);
        } else {
            dataStore.saveToDisk();
        }

        return ResponseEntity.ok(zone);
    }

    @PostMapping("/{id}/schedules")
    public ResponseEntity<?> addSchedule(@PathVariable String id, @RequestBody Schedule schedule) {
        Schedule added = dataStore.addSchedule(id, schedule);
        if (added == null) return ResponseEntity.notFound().build();
        return ResponseEntity.status(HttpStatus.CREATED).body(added);
    }

    @PutMapping("/{id}/schedules/{scheduleId}")
    public ResponseEntity<?> updateSchedule(
            @PathVariable String id,
            @PathVariable String scheduleId,
            @RequestBody Schedule schedule
    ) {
        Schedule updated = dataStore.updateSchedule(id, scheduleId, schedule);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/schedules/{scheduleId}")
    public ResponseEntity<?> removeSchedule(@PathVariable String id, @PathVariable String scheduleId) {
        boolean ok = dataStore.removeSchedule(id, scheduleId);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
