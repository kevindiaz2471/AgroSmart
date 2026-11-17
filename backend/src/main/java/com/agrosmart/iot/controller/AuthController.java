package com.agrosmart.iot.controller;

import com.agrosmart.iot.model.User;
import com.agrosmart.iot.service.DataStoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DataStoreService dataStore;

    public AuthController(DataStoreService dataStore) {
        this.dataStore = dataStore;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        String email = creds.get("email");
        String password = creds.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email y contraseña requeridos"));
        }

        Optional<User> userOpt = dataStore.findUserByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Credenciales incorrectas. Verifique su email y contraseña."));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "token", "bearer-token-" + System.currentTimeMillis()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String name = body.get("name");
        String role = body.get("role");

        if (email == null || password == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Todos los campos son obligatorios"));
        }

        if (dataStore.findUserByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "El correo ya está registrado"));
        }

        User newUser = dataStore.createUser(name, email, password, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", newUser.getId(),
                "name", newUser.getName(),
                "email", newUser.getEmail(),
                "role", newUser.getRole(),
                "token", "bearer-token-" + System.currentTimeMillis()
        ));
    }

    @GetMapping("/users")
    public Collection<User> getAllUsers() {
        return dataStore.getAllUsers();
    }
}
