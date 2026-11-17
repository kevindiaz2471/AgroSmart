package com.agrosmart.iot.controller;

import com.agrosmart.iot.model.Place;
import com.agrosmart.iot.service.DataStoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final DataStoreService dataStore;

    public PlaceController(DataStoreService dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public Collection<Place> getAllPlaces() {
        return dataStore.getAllPlaces();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Place> getPlaceById(@PathVariable String id) {
        return dataStore.getPlaceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Place> createOrUpdatePlace(@RequestBody Place place) {
        Place saved = dataStore.savePlace(place);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Place> updatePlace(@PathVariable String id, @RequestBody Place place) {
        place.setId(id);
        Place saved = dataStore.savePlace(place);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlace(@PathVariable String id) {
        boolean ok = dataStore.deletePlace(id);
        if (!ok) {
            return ResponseEntity.badRequest().body(Map.of("message", "No se puede eliminar la única finca activa."));
        }
        return ResponseEntity.noContent().build();
    }
}
