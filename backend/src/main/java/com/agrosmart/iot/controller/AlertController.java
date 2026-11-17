package com.agrosmart.iot.controller;

import com.agrosmart.iot.model.SystemAlert;
import com.agrosmart.iot.service.DataStoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final DataStoreService dataStore;

    public AlertController(DataStoreService dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public List<SystemAlert> getAlerts() {
        return dataStore.getAlerts();
    }

    @PostMapping
    public ResponseEntity<SystemAlert> createAlert(@RequestBody SystemAlert alert) {
        SystemAlert saved = dataStore.addOrUpdateAlert(
                alert.getZoneId(),
                alert.getType() != null ? alert.getType() : "INFO",
                alert.getPriority() != null ? alert.getPriority() : "MEDIA",
                alert.getCode(),
                alert.getMessage(),
                alert.getRecommendation()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable String id) {
        boolean ok = dataStore.resolveAlert(id);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("id", id, "resolved", true));
    }

    @PutMapping("/resolve-all")
    public ResponseEntity<?> resolveAllAlerts() {
        dataStore.resolveAllAlerts();
        return ResponseEntity.ok(Map.of("message", "Todas las alertas marcadas como resueltas"));
    }

    @DeleteMapping("/resolved")
    public ResponseEntity<?> clearResolvedAlerts() {
        dataStore.clearResolvedAlerts();
        return ResponseEntity.ok(Map.of("message", "Alertas resueltas eliminadas"));
    }
}
