package com.agrosmart.iot.controller;

import com.agrosmart.iot.model.HistoryEvent;
import com.agrosmart.iot.service.DataStoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final DataStoreService dataStore;

    public HistoryController(DataStoreService dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public List<HistoryEvent> getHistory() {
        return dataStore.getHistory();
    }

    @DeleteMapping
    public ResponseEntity<?> clearHistory() {
        dataStore.clearHistory();
        return ResponseEntity.ok(Map.of("message", "Historial limpiado exitosamente"));
    }
}
