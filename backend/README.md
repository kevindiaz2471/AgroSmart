# 🌾 AgroSmart IoT - Backend Spring Boot

Backend desarrollado con **Spring Boot 3.3** en Java para la gestión integral de riego automatizado con sensores IoT y microcontroladores ESP32.

---

## 🚀 Cómo Ejecutar el Backend

### Opción 1: Con el script automático (Windows PowerShell)
```powershell
cd backend
.\start-backend.ps1
```
*(Si no tienes Maven instalado, el script descargará una copia portable automáticamente sin necesidad de configurar variables de entorno).*

### Opción 2: Con Maven instalado
```bash
cd backend
mvn spring-boot:run
```

El servidor iniciará en: **`http://localhost:8080`**

---

## 📡 Endpoints de la API REST

### 1. Autenticación (`/api/auth`)
- `POST /api/auth/login`: Autenticación de usuarios (Email y Password)
- `POST /api/auth/register`: Registro de nuevos ingenieros/operadores
- `GET /api/auth/users`: Listado de usuarios autorizados

### 2. Lugares / Fincas (`/api/places`)
- `GET /api/places`: Listar todas las fincas o parcelas
- `GET /api/places/{id}`: Obtener detalles de una finca
- `POST /api/places`: Registrar o actualizar finca

### 3. Zonas de Riego (`/api/zones`)
- `GET /api/zones`: Listar todas las zonas
- `GET /api/zones?placeId={id}`: Listar zonas pertenecientes a un lugar
- `GET /api/zones/{id}`: Obtener estado actual de una zona
- `POST /api/zones`: Registrar nueva zona de cultivo
- `PUT /api/zones/{id}/mode`: Cambiar modo de operación (`AUTO`, `MANUAL`, `SCHEDULED`)
- `PUT /api/zones/{id}/config`: Actualizar umbrales ($H_{\text{mín}}$, $H_{\text{máx}}$, tiempo máx de seguridad, frecuencia de muestreo)
- `POST /api/zones/{id}/pump`: Activar o desactivar bomba (`{ "state": true | false }`)
- `POST /api/zones/{id}/telemetry`: Enviar telemetría desde sensor/simulador (`{ "moisture": 45, "tankOk": true, "sensorOk": true }`)
- `POST /api/zones/{id}/schedules`: Agregar horario de riego programado
- `DELETE /api/zones/{id}/schedules/{scheduleId}`: Eliminar horario programado

### 4. Historial (`/api/history`)
- `GET /api/history`: Obtener registro histórico de activaciones de riego
- `DELETE /api/history`: Limpiar historial de eventos

### 5. Alertas (`/api/alerts`)
- `GET /api/alerts`: Listar alertas de seguridad y advertencias del sistema
- `POST /api/alerts`: Emitir una nueva alerta
