# Sistema de Gestión de Riego Automatizado - IoT Agrícola 🌾💧

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?logo=react)](frontend/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?logo=tailwindcss)](frontend/)
[![Axios](https://img.shields.io/badge/HTTP%20Client-Axios-5a29e4?logo=axios)](frontend/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.3-6db33f?logo=springboot)](backend/)
[![Hardware](https://img.shields.io/badge/Microcontroller-ESP32-blue.svg)](https://www.espressif.com/en/products/socs/esp32)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistema integral de automatización, monitoreo y control inteligente de riego agrícola con arquitectura **Full-Stack moderna**:
- **Frontend**: Desarrollado en **React 19** con **Vite**, estilizado con **Tailwind CSS** y consumo de servicios REST mediante **Axios**.
- **Backend**: Desarrollado en **Spring Boot 3.3 (Java)** con endpoints RESTful, validación, CORS y servicios de estado en tiempo real.
- **Hardware / IoT**: Controladores ESP32 con sensores capacitivos de humedad de suelo, relés de bombeo, histéresis y protección de seguridad (*watchdog timer*).

---

## 🏗️ Arquitectura del Sistema

```text
EMPRENDIEMINTO/
├── frontend/                     # Aplicación React + Vite + Tailwind CSS + Axios
│   ├── src/
│   │   ├── components/           # Componentes modulares (Navbar, Gauge, PumpControl, Tabs, Tables, Modals)
│   │   ├── services/api.js       # Cliente Axios centralizado con interceptores y fallback
│   │   ├── App.jsx               # Contenedor principal de la aplicación y lógica de control
│   │   ├── index.css             # Tailwind CSS y animaciones (olas de agua, gauge)
│   │   └── main.jsx              # Punto de entrada React
│   ├── package.json              # Dependencias (react, tailwindcss, axios, lucide-react)
│   └── vite.config.js            # Configuración de Vite y proxy /api hacia Spring Boot (8080)
│
├── backend/                      # Backend Spring Boot 3.3 (Java)
│   ├── src/main/java/com/agrosmart/iot/
│   │   ├── AgroSmartApplication.java  # Clase principal Spring Boot
│   │   ├── config/CorsConfig.java    # Configuración de CORS para clientes web
│   │   ├── controller/               # Controladores REST (Auth, Places, Zones, History, Alerts)
│   │   ├── model/                    # Modelos de datos (User, Place, Zone, Schedule, etc.)
│   │   └── service/DataStoreService  # Servicio de persistencia y reglas de negocio
│   ├── src/main/resources/
│   │   └── application.properties    # Configuración del servidor (puerto 8080)
│   ├── pom.xml                       # Descriptor Maven de dependencias Spring Boot
│   └── start-backend.ps1             # Script PowerShell para iniciar Spring Boot fácilmente
│
├── package.json                  # Scripts globales para ejecutar Frontend y Backend
└── README.md                     # Documentación general
```

---

## 🚀 Guía de Inicio Rápido

### 1. Iniciar el Frontend (React + Tailwind + Axios)
En la terminal principal ejecuta:
```bash
# Iniciar servidor de desarrollo Vite
npm run frontend
# o también:
cd frontend
npm run dev
```
La aplicación abrirá en: **`http://localhost:5173`**

### 2. Iniciar el Backend (Spring Boot 3.3)
En otra ventana de terminal:
```powershell
cd backend
.\start-backend.ps1
```
*(Si ya tienes Maven instalado en el PATH, también puedes ejecutar `mvn spring-boot:run`)*.  
El backend REST responderá en: **`http://localhost:8080/api`**

---

## 🔑 Credenciales Demo
Para acceder al dashboard desde el formulario de inicio de sesión:
- **Email:** `admin@agrosmart.io`
- **Contraseña:** `admin123`
*(O haz clic directamente en el botón **"Cargar Demo"** del modal de bienvenida)*.

---

## 📡 Endpoints de la API REST (Spring Boot)

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión y obtener token |
| `POST` | `/api/auth/register` | Registro de nuevos operadores/ingenieros |
| `GET` | `/api/places` | Listado de fincas o parcelas |
| `POST` | `/api/places` | Crear nueva finca o lugar |
| `GET` | `/api/zones` | Listado de todas las zonas de cultivo |
| `GET` | `/api/zones?placeId={id}` | Zonas filtradas por finca |
| `PUT` | `/api/zones/{id}/mode` | Cambiar modo (`AUTO`, `MANUAL`, `SCHEDULED`) |
| `PUT` | `/api/zones/{id}/config` | Modificar umbrales $H_{\text{mín}}$, $H_{\text{máx}}$, watchdog y frecuencia |
| `POST` | `/api/zones/{id}/pump` | Accionar bomba de agua (`{ "state": true \| false }`) |
| `POST` | `/api/zones/{id}/telemetry`| Transmitir lectura de humedad y estado de sensores |
| `POST` | `/api/zones/{id}/schedules`| Registrar nuevo turno de riego programado |
| `DELETE`| `/api/zones/{id}/schedules/{id}` | Eliminar turno programado |
| `GET` | `/api/history` | Obtener historial de activaciones |
| `DELETE`| `/api/history` | Vaciar historial de eventos |
| `GET` | `/api/alerts` | Listado de alertas y advertencias de seguridad |

---

## 💧 Características de la Aplicación

1. **Indicador de Humedad SVG con Histéresis:**
   - Visualización circular en tiempo real con degradado reactivo.
   - Umbrales configurables $H_{\text{mín}}$ y $H_{\text{máx}}$.
   - Control deslizante interactivo y botón de simulación de desecamiento (**"Auto Secar"**).

2. **Controlador de Actuador (Bomba de Agua):**
   - Animación de olas fluidas en CSS durante el riego activo.
   - Botones rápidos de control manual (*Encender Riego* / *Detener Riego*).
   - Sensor de seguridad de depósito con alerta de cavitación y temporizador Watchdog.

3. **Gestión de Turnos y Alertas:**
   - Programación de turnos por días de la semana y duración en minutos.
   - Notificaciones y registro de eventos en tabla histórica con exportación de estado.
