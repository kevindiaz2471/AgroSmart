package com.agrosmart.iot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AgroSmartApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgroSmartApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("  🌾 AgroSmart IoT - Backend Spring Boot Activo 💧");
        System.out.println("  URL Base: http://localhost:8080/api");
        System.out.println("  API Auth: http://localhost:8080/api/auth/users");
        System.out.println("  API Zonas: http://localhost:8080/api/zones");
        System.out.println("=======================================================\n");
    }
}
