# Sistema de Gestión de Riego Automatizado - IoT Agrícola 🌾💧

[![GitLab CI](https://img.shields.io/badge/GitLab-CI%2FCD-orange?logo=gitlab)](https://gitlab.upec.edu.ec/grupo-sostenibilidad/sistema-de-gestion-de-riego-automatizado)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![IoT Microcontroller](https://img.shields.io/badge/Hardware-ESP32-blue.svg)](https://www.espressif.com/en/products/socs/esp32)

Sistema integral de automatización, monitoreo y control inteligente de riego agrícola basado en microcontroladores ESP32, sensores de humedad de suelo capacitivos, control por histéresis y perro guardián hardware (*watchdog timer*).

---

## 📌 Características Principales

- **Gestión Multi-Lugar y Multi-Zona**: Permite registrar múltiples fincas/invernaderos y subdividirlos en zonas de riego independientes.
- **Automatización por Histéresis**: Activa automáticamente la bomba si la humedad del suelo cae por debajo de $H_{\text{mín}}$ (ej. 30%) y la detiene al alcanzar $H_{\text{máx}}$ (ej. 70%).
- **Protección Fail-Safe & Perro Guardián**: Tiempo de corte automático máximo (watchdog) para prevenir inundación por desborde y protección contra marcha en seco del depósito.
- **Triple Modo de Operación**:
  - 🤖 **Automático**: Controlado por sensor de humedad capacitivo.
  - 🖐️ **Manual**: Accionamiento directo ON/OFF por el usuario.
  - ⏰ **Programado**: Horarios y cronogramas predefinidos.
- **Dashboard Web Interactivo**: Interfaz moderna en modo oscuro para monitoreo en tiempo real, configuración de umbrales y registro de historial.

---

## 📂 Estructura del Repositorio

```text
├── index.html                       # Layout principal del Dashboard Web
├── styles.css                       # Sistema de diseño CSS3 (Dark Mode, responsive)
├── app.js                           # Motor de simulación y lógica de control IoT
├── sistema_riego_iot_propuesta.md   # Documentación técnica completa (18 entregables, PlantUML, SQL, API REST)
├── .gitignore                       # Archivos ignorados por Git
└── README.md                        # Documentación principal del proyecto
```

---

## 🚀 Guía de Inicio Rápido

### 1. Ejecución del Dashboard Web (Local)
No requiere instalación de dependencias pesadas. Abre directamente el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge, Safari):

```bash
# O en la terminal de tu SO:
start index.html   # En Windows
open index.html    # En macOS
xdg-open index.html # En Linux
```

### 2. Vinculación y Envío a GitLab

Si estás clonando o vinculando este repositorio a GitLab UPEC:

```bash
# 1. Inicializar repositorio git local
git init

# 2. Agregar origen del repositorio GitLab
git remote add origin https://gitlab.upec.edu.ec/grupo-sostenibilidad/sistema-de-gestion-de-riego-automatizado.git

# 3. Añadir archivos al stage
git add .

# 4. Crear commit inicial
git commit -m "feat: arquitectura completa de sistema de riego IoT y dashboard interactivo"

# 5. Subir a la rama principal (main / master)
git branch -M main
git push -u origin main
```

---

## 📄 Propuesta Técnica e Ingeniería de Software

Para consultar todos los diagramas **PlantUML** (Casos de Uso, Clases, Secuencia, ERD), el modelo DDL SQL para PostgreSQL/TimescaleDB, las recomendaciones de hardware BOM y el firmware ESP32 en C++, revisa el documento adjunto:

📌 [Ver Propuesta Técnica de Ingeniería (sistema_riego_iot_propuesta.md)](sistema_riego_iot_propuesta.md)

---

## 🔐 Licencia y Créditos

Desarrollado para el **Grupo de Sostenibilidad - UPEC** (Universidad Politécnica Estatal del Carchi).
