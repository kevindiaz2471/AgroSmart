# Design System: AgroSmart IoT — Identidad Visual AgTech Comercial

## 1. Filosofía Visual y Propósito
- **Identidad:** Plataforma comercial de tecnología agrícola (*AgTech*) e irrigación inteligente.
- **Sensación:** Agricultura moderna, naturaleza, confianza técnica, claridad en campo y facilidad de uso para agricultores, ingenieros agrónomos y operadores.
- **Tema Predeterminado:** **Modo Claro Agrícola** (con soporte completo y persistente para **Modo Oscuro Agrícola Elegante**).

## 2. Paleta Oficial de Colores (AgTech Natural)

| Token / Rol | Color Hex | Variable CSS | Aplicación en la Interfaz |
| :--- | :---: | :--- | :--- |
| **Verde Bosque** | `#244C36` | `--agro-forest` | Barra de navegación principal, cabeceras destacadas, títulos primarios en modo claro. |
| **Verde Hoja** | `#6A994E` | `--agro-leaf` | Botones principales de acción, controles activos, acentos interactivos. |
| **Verde Cultivo** | `#A7C957` | `--agro-crop` | Indicadores positivos, estado óptimo de humedad, badges de éxito. |
| **Crema Natural** | `#F2EFE6` | `--agro-cream` | Fondo general de la aplicación en Modo Claro. |
| **Blanco Cálido** | `#FFFFFF` | `--agro-white` | Superficie principal de tarjetas y paneles en Modo Claro. |
| **Tierra** | `#B87543` | `--agro-earth` | Elementos secundarios, etiquetas de variedad de cultivo, metadatos geográficos. |
| **Amarillo Cosecha** | `#E9A23B` | `--agro-harvest` | Advertencias, modo manual, tiempos de espera (*Cooldown*). |
| **Rojo de Alerta** | `#D9534F` | `--agro-alert` | Errores críticos, tanque vacío, sensor desconectado, humedad crítica baja. |
| **Gris de Texto** | `#526052` | `--agro-text-muted` | Texto secundario, descripciones, etiquetas de soporte con alto contraste. |
| **Azul Verdoso Agua** | `#2A9D8F` | `--agro-water` | Humedad alta/saturación, flujo de agua en bomba y litros estimados. |

## 3. Especificación de Modos (Claro y Oscuro)

### Modo Claro (Predeterminado)
- **Fondo General:** Crema natural (`#F2EFE6`).
- **Tarjetas (`.glass-panel` / `.agro-card`):** Blanco cálido (`#FFFFFF`) con bordes suaves (`#DDE2D6`) y sombra orgánica sutil.
- **Navegación Superior:** Verde bosque (`#244C36`) con textos claros y pestañas activas en Verde hoja (`#6A994E`).
- **Textos:** Verde bosque profundo (`#1B3B2B`) para títulos y valores; Gris botánico (`#526052`) para subtítulos.

### Modo Oscuro (Estética Agrícola Elegante)
- **Fondo General:** Verde bosque muy oscuro (`#0E1D14`).
- **Tarjetas (`.glass-panel` / `.agro-card`):** Verde carbón (`#162A1F`) con superficies secundarias (`#1D3528`) y bordes (`#2B4C3A`).
- **Navegación Superior:** Verde bosque nocturno (`#12241A`) con acentos en Verde hoja (`#6A994E`) y Verde cultivo (`#A7C957`).
- **Textos:** Crema claro (`#F2EFE6`) para títulos y Verde grisáceo claro (`#A8BCA8`) para textos secundarios.
