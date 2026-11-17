import React, { useState } from 'react';
import {
  Droplets,
  ShieldCheck,
  Smartphone,
  Layers,
  Gauge,
  Sprout,
  CheckCircle2,
  XCircle,
  Calculator,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Sun,
  Trees,
  Warehouse
} from 'lucide-react';

export default function LandingPage({ onGoToDashboard }) {
  // Calculadora interactiva de ahorro hídrico y económico
  const [hectares, setHectares] = useState(30);
  const [waterSource, setWaterSource] = useState('pozo'); // pozo, canal, reservorio
  const [cropType, setCropType] = useState('frutales'); // hortalizas, frutales, maiz, flores

  // Factores de cálculo agronómico
  const baseWaterPerHa = {
    hortalizas: 6500, // m3/ha/año
    frutales: 8200,
    maiz: 7400,
    flores: 9500
  };

  const pumpingCostMultiplier = {
    pozo: 0.18, // USD por m3 bombeado (electricidad/diesel pozo profundo)
    canal: 0.08, // gravedad + bombeo secundario
    reservorio: 0.12 // bombeo presurizado
  };

  const waterConsumptionPerYear = hectares * (baseWaterPerHa[cropType] || 7500);
  const waterSavedM3 = Math.round(waterConsumptionPerYear * 0.42); // 42% promedio de ahorro
  const annualSavingsUSD = Math.round(waterSavedM3 * (pumpingCostMultiplier[waterSource] || 0.15));
  const roiMonths = Math.max(2, Math.round((hectares * 85) / (annualSavingsUSD / 12)));

  return (
    <div className="min-h-screen bg-[#F2EFE6] text-[#1B3B2B] antialiased selection:bg-emerald-200">
      {/* =========================================================================
          1. HEADER / NAVEGACIÓN PROMOCIONAL
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#244C36]/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo y Marca */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#244C36] to-[#163022] text-white flex items-center justify-center shadow-md shadow-[#244C36]/20">
              <Sprout className="w-6 h-6 text-[#A7C957]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#244C36]">AgroSmart</span>
                <span className="bg-[#6A994E] text-white text-[11px] font-bold px-2 py-0.5 rounded-full tracking-wider">IoT</span>
              </div>
              <p className="text-[11px] text-[#526052] font-medium hidden sm:block">Tecnología de Riego de Precisión</p>
            </div>
          </div>

          {/* Menú de Navegación de la Landing */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#526052]">
            <a href="#beneficios" className="hover:text-[#244C36] transition-colors">Beneficios</a>
            <a href="#aplicaciones" className="hover:text-[#244C36] transition-colors">Usos en Campo</a>
            <a href="#ayuda-agricultor" className="hover:text-[#244C36] transition-colors">Ayuda al Agricultor</a>
            <a href="#calculadora" className="hover:text-[#244C36] transition-colors">Calculadora de Ahorro</a>
            <a href="#testimonios" className="hover:text-[#244C36] transition-colors">Casos de Éxito</a>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#244C36] hover:bg-[#1B3828] text-white font-bold text-sm shadow-md shadow-[#244C36]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="w-4 h-4 text-[#A7C957]" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION DE ALTO IMPACTO
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Elementos decorativos orgánicos */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#A7C957]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#6A994E]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Columna Izquierda: Mensaje y Propuesta de Valor */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Badge superior */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6A994E]/15 border border-[#6A994E]/30 text-[#244C36] font-semibold text-xs mb-6">
                <Sparkles className="w-4 h-4 text-[#6A994E]" />
                <span>Sistema Inteligente de Automatización Agrícola</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#244C36] tracking-tight leading-[1.15] mb-6">
                Riego Inteligente que Cuida tu Cosecha y <span className="text-[#6A994E] underline decoration-[#A7C957] decoration-wavy decoration-2">Multiplica tu Agua</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#526052] font-normal leading-relaxed mb-8 max-w-2xl">
                AgroSmart IoT monitorea la humedad en tiempo real, activa el riego únicamente cuando la planta lo necesita y apaga la bomba automáticamente al alcanzar el nivel óptimo. <strong>Ahorra agua, reduce la factura eléctrica y elimina el estrés del agricultor.</strong>
              </p>

              {/* Botones CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                <button
                  onClick={onGoToDashboard}
                  className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-[#244C36] hover:bg-[#1B3828] text-white font-bold text-base shadow-lg shadow-[#244C36]/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Gauge className="w-5 h-5 text-[#A7C957]" />
                  <span>Probar Sistema en Vivo</span>
                </button>

                <a
                  href="#calculadora"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white border-2 border-[#244C36]/20 hover:border-[#244C36] text-[#244C36] font-bold text-base transition-all hover:bg-[#F2EFE6]"
                >
                  <Calculator className="w-5 h-5 text-[#6A994E]" />
                  <span>Calcular Mi Ahorro</span>
                </a>
              </div>

              {/* Métricas Destacadas */}
              <div className="grid grid-cols-3 gap-4 w-full pt-6 border-t border-[#244C36]/15">
                <div className="bg-white/80 p-3.5 sm:p-4 rounded-xl border border-[#244C36]/10 shadow-xs">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-[#6A994E]">45%</span>
                  <span className="text-xs text-[#526052] font-semibold">Ahorro hídrico verificado</span>
                </div>
                <div className="bg-white/80 p-3.5 sm:p-4 rounded-xl border border-[#244C36]/10 shadow-xs">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-[#244C36]">24/7</span>
                  <span className="text-xs text-[#526052] font-semibold">Protección de la bomba</span>
                </div>
                <div className="bg-white/80 p-3.5 sm:p-4 rounded-xl border border-[#244C36]/10 shadow-xs">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-[#B87543]">+30%</span>
                  <span className="text-xs text-[#526052] font-semibold">Calidad de cosecha</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Simulador en Vivo de Telemetría */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-[#244C36]/10 border border-[#244C36]/15 relative">
                {/* Cabecera del mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold text-sm text-[#244C36]">Zona Activa: Tomate Tecnificado</span>
                  </div>
                  <span className="bg-[#A7C957]/20 text-[#244C36] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Modo Auto Activo
                  </span>
                </div>

                {/* Dial de Humedad Interactivo */}
                <div className="py-6 flex flex-col items-center">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#E5E7EB"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#6A994E"
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset="75"
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-extrabold text-[#244C36] font-mono">68%</span>
                      <span className="text-xs font-semibold text-[#6A994E] flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5" /> Humedad Óptima
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#526052] mt-2 text-center max-w-xs">
                    Umbrales programados: Riego en <strong>30%</strong> • Apagado seguro en <strong>70%</strong>
                  </p>
                </div>

                {/* Estratos de Humedad */}
                <div className="bg-[#F2EFE6]/70 rounded-2xl p-4 space-y-3 mb-5 border border-[#244C36]/10">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#526052]">
                    <span>Estrato Radicular</span>
                    <span>Humedad</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-[#244C36] font-medium">
                        <Layers className="w-3.5 h-3.5 text-[#6A994E]" /> Superficie (-10 cm)
                      </span>
                      <span className="font-mono font-bold text-[#244C36]">62%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#A7C957] h-2 rounded-full" style={{ width: '62%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-[#244C36] font-medium">
                        <Layers className="w-3.5 h-3.5 text-[#6A994E]" /> Zona Radicular (-30 cm)
                      </span>
                      <span className="font-mono font-bold text-[#6A994E]">68%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#6A994E] h-2 rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>
                </div>

                {/* Estado de Seguridad de la Bomba */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#244C36] text-white flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#A7C957]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#244C36]">Protección Marcha en Seco</h4>
                      <p className="text-[11px] text-emerald-800">Tanque con nivel óptimo (85%)</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Bomba Segura
                  </span>
                </div>

                {/* Botón interactivo para probar */}
                <button
                  onClick={onGoToDashboard}
                  className="w-full mt-4 py-3 rounded-xl bg-slate-100 hover:bg-[#244C36] hover:text-white text-[#244C36] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Explorar Dashboard Completo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. BENEFICIOS CLAVE PARA EL AGRICULTOR
          ========================================================================= */}
      <section id="beneficios" className="py-20 bg-white border-y border-[#244C36]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#6A994E] font-bold text-xs uppercase tracking-wider bg-[#6A994E]/10 px-3 py-1 rounded-full">
              ¿Por qué elegir AgroSmart IoT?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#244C36] tracking-tight mt-3">
              Beneficios que Transforman la Realidad de tu Campo
            </h2>
            <p className="text-base sm:text-lg text-[#526052] mt-3">
              Un sistema desarrollado para dar soluciones directas a los dolores cotidianos del agricultor: escasez de agua, gastos excesivos de energía y daño en bombas de riego.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Beneficio 1 */}
            <div className="bg-[#F2EFE6]/60 rounded-2xl p-6 border border-[#244C36]/10 hover:border-[#6A994E] transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#244C36] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Droplets className="w-6 h-6 text-[#A7C957]" />
                </div>
                <h3 className="text-lg font-bold text-[#244C36] mb-2">Ahorro Drástico de Agua</h3>
                <p className="text-sm text-[#526052] leading-relaxed">
                  Elimina el riego a ciegas. El sistema riega únicamente la cantidad exacta que absorbe la raíz, reduciendo el desperdicio de agua entre un <strong>35% y un 50%</strong>.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#244C36]/10 flex items-center gap-2 text-xs font-bold text-[#6A994E]">
                <CheckCircle2 className="w-4 h-4" /> Hasta 45% menos consumo hídrico
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-[#F2EFE6]/60 rounded-2xl p-6 border border-[#244C36]/10 hover:border-[#6A994E] transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#244C36] text-white flex items-center justify-center mb-5 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-[#A7C957]" />
                </div>
                <h3 className="text-lg font-bold text-[#244C36] mb-2">Cero Bombas Quemadas</h3>
                <p className="text-sm text-[#526052] leading-relaxed">
                  Protección inteligente contra marcha en seco. Si el nivel del pozo o tanque baja o un sensor falla, la bomba se detiene al instante, evitando reparaciones costosas.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#244C36]/10 flex items-center gap-2 text-xs font-bold text-[#6A994E]">
                <CheckCircle2 className="w-4 h-4" /> Desconexión preventiva en 3 segundos
              </div>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-[#F2EFE6]/60 rounded-2xl p-6 border border-[#244C36]/10 hover:border-[#6A994E] transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#244C36] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Smartphone className="w-6 h-6 text-[#A7C957]" />
                </div>
                <h3 className="text-lg font-bold text-[#244C36] mb-2">Control en Tu Teléfono</h3>
                <p className="text-sm text-[#526052] leading-relaxed">
                  Revisa el estado de la finca desde cualquier lugar. Puedes encender o apagar sectores de riego, modificar horarios y consultar lecturas sin tener que desplazarte a la caseta.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#244C36]/10 flex items-center gap-2 text-xs font-bold text-[#6A994E]">
                <CheckCircle2 className="w-4 h-4" /> Compatible con cualquier celular
              </div>
            </div>

            {/* Beneficio 4 */}
            <div className="bg-[#F2EFE6]/60 rounded-2xl p-6 border border-[#244C36]/10 hover:border-[#6A994E] transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#244C36] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Zap className="w-6 h-6 text-[#A7C957]" />
                </div>
                <h3 className="text-lg font-bold text-[#244C36] mb-2">Menor Gasto Eléctrico</h3>
                <p className="text-sm text-[#526052] leading-relaxed">
                  Configura el riego automático en horarios de menor tarifa eléctrica o en la noche, reduciendo la evaporación solar y ahorrando dinero en cada ciclo de producción.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#244C36]/10 flex items-center gap-2 text-xs font-bold text-[#6A994E]">
                <CheckCircle2 className="w-4 h-4" /> Ahorro directo en la factura de luz
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. USOS Y APLICACIONES EN EL CAMPO
          ========================================================================= */}
      <section id="aplicaciones" className="py-20 bg-[#F2EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-[#6A994E] font-bold text-xs uppercase tracking-wider bg-[#6A994E]/10 px-3 py-1 rounded-full">
                Versatilidad Agronómica
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#244C36] tracking-tight mt-3">
                ¿Dónde y Cómo Puedes Usar AgroSmart IoT?
              </h2>
            </div>
            <p className="text-base text-[#526052] max-w-md mt-4 md:mt-0">
              Adaptable tanto para pequeños y medianos productores como para explotaciones comerciales tecnificadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Aplicación 1 */}
            <div className="bg-white rounded-2xl p-6 border border-[#244C36]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#244C36] flex items-center justify-center mb-4">
                  <Warehouse className="w-5 h-5 text-[#244C36]" />
                </div>
                <span className="text-[11px] font-bold text-[#6A994E] uppercase tracking-wider">Bajo Cubierta</span>
                <h3 className="text-lg font-bold text-[#244C36] mt-1 mb-2">Invernaderos de Hortalizas y Flores</h3>
                <p className="text-xs sm:text-sm text-[#526052] leading-relaxed">
                  Ideal para tomates, pimientos, frutillas y rosas. Mantiene un microclima radicular perfecto evitando hongos y asfixia en sustrato o suelo.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-slate-100 text-xs text-[#526052] space-y-1.5">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6A994E]" /> Control por estrato de sustrato</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6A994E]" /> Compatible con fertirriego</li>
              </ul>
            </div>

            {/* Aplicación 2 */}
            <div className="bg-white rounded-2xl p-6 border border-[#244C36]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#244C36] flex items-center justify-center mb-4">
                  <Trees className="w-5 h-5 text-[#244C36]" />
                </div>
                <span className="text-[11px] font-bold text-[#6A994E] uppercase tracking-wider">Fruticultura</span>
                <h3 className="text-lg font-bold text-[#244C36] mt-1 mb-2">Frutales, Cítricos y Aguacate</h3>
                <p className="text-xs sm:text-sm text-[#526052] leading-relaxed">
                  Monitoreo a 30 cm y 60 cm de profundidad. Estimula el llenado del fruto y mejora el calibre comercial para venta y exportación.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-slate-100 text-xs text-[#526052] space-y-1.5">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6A994E]" /> Monitoreo radicular profundo</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6A994E]" /> Evita pudrición de raíz</li>
              </ul>
            </div>

            {/* Aplicación 3 */}
            <div className="bg-white rounded-2xl p-6 border border-[#244C36]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#244C36] flex items-center justify-center mb-4">
                  <Sun className="w-5 h-5 text-[#244C36]" />
                </div>
                <span className="text-[11px] font-bold text-[#6A994E] uppercase tracking-wider">Campo Abierto</span>
                <h3 className="text-lg font-bold text-[#244C36] mt-1 mb-2">Cultivos Extensivos y Granos</h3>
                <p className="text-xs sm:text-sm text-[#526052] leading-relaxed">
                  Maíz, papa, hortalizas de campo abierto y pasturas. Optimiza los turnos de agua de riego por acequia o pozo profundo sin pérdidas.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-slate-100 text-xs text-[#526052] space-y-1.5">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6A994E]" /> Mayor rendimiento por hectárea</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6A994E]" /> Ajuste dinámico ante lluvias</li>
              </ul>
            </div>

            {/* Aplicación 4 */}
            <div className="bg-white rounded-2xl p-6 border border-[#244C36]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#244C36] flex items-center justify-center mb-4">
                  <Droplets className="w-5 h-5 text-[#244C36]" />
                </div>
                <span className="text-[11px] font-bold text-[#6A994E] uppercase tracking-wider">Presurizado</span>
                <h3 className="text-lg font-bold text-[#244C36] mt-1 mb-2">Riego por Goteo y Microaspersión</h3>
                <p className="text-xs sm:text-sm text-[#526052] leading-relaxed">
                  Control automatizado de electroválvulas sectorizadas. Distribuye el agua por cuarteles de manera balanceada y con presión constante.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-slate-100 text-xs text-[#526052] space-y-1.5">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6A994E]" /> Riego sectorizado por válvulas</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6A994E]" /> Prevención de sobrepresión</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. LA GRAN AYUDA PARA EL AGRICULTOR (ANTES VS. DESPUÉS)
          ========================================================================= */}
      <section id="ayuda-agricultor" className="py-20 bg-white border-y border-[#244C36]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#6A994E] font-bold text-xs uppercase tracking-wider bg-[#6A994E]/10 px-3 py-1 rounded-full">
              Comparativa Real
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#244C36] tracking-tight mt-3">
              La Gran Ayuda para el Agricultor: ¿Qué Cambia en tu Día a Día?
            </h2>
            <p className="text-base sm:text-lg text-[#526052] mt-3">
              Compara el método tradicional empírico frente a la tranquilidad de contar con tecnología de precisión en tu campo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna ANTES (Riego Tradicional) */}
            <div className="bg-rose-50/50 rounded-3xl p-7 sm:p-8 border-2 border-rose-200 shadow-xs relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-rose-950">Riego Tradicional a Ciegas</h3>
                  <p className="text-xs text-rose-800 font-medium">Método manual sin sensores ni automatización</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-rose-950/90">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Riego por tanteo o calendario fijo:</strong> Se riega a horas fijas aunque haya llovido o el suelo esté saturado, causando pudrición y gasto inútil.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Riesgo constante de quemar la bomba:</strong> Si el pozo o cisterna se queda sin agua mientras riegas, la bomba gira en seco y se daña en minutos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Pérdida de tiempo y esfuerzo físico:</strong> Obligación de madrugar o trasladarse físicamente a abrir llaves, prender motores y vigilar el caudal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Cosecha despareja:</strong> Sectores que reciben demasiada agua y otros que sufren estrés hídrico, reduciendo el peso y valor del cultivo.</span>
                </li>
              </ul>
            </div>

            {/* Columna DESPUÉS (Con AgroSmart IoT) */}
            <div className="bg-emerald-50/60 rounded-3xl p-7 sm:p-8 border-2 border-emerald-400 shadow-md shadow-emerald-500/10 relative">
              <div className="absolute -top-3.5 right-6 bg-[#244C36] text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Con AgroSmart IoT
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#244C36] text-white flex items-center justify-center shadow-md shadow-[#244C36]/20">
                  <CheckCircle2 className="w-6 h-6 text-[#A7C957]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#244C36]">Precisión y Tranquilidad Total</h3>
                  <p className="text-xs text-[#6A994E] font-medium">Control inteligente por histéresis y seguridad hídrica</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-[#244C36]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#6A994E] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Riego automático exacto:</strong> La bomba enciende únicamente si la humedad baja al 30% y se apaga sola al llegar al 70%. Cero desperdicio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#6A994E] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Protección blindada del equipo:</strong> Sensores de nivel y corriente apagan la electrobomba de inmediato si falta agua, protegiendo tu inversión.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#6A994E] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Monitoreo en el celular:</strong> El agricultor puede supervisar sus lotes desde su casa, programar horarios nocturnos y recibir alertas tempranas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#6A994E] shrink-0 mt-0.5 font-bold" />
                  <span><strong>Cosechas de mayor valor y calibre:</strong> Las plantas reciben humedad constante y equilibrada, aumentando el rendimiento hasta un 30%.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CALCULADORA INTERACTIVA DE RETORNO Y AHORRO
          ========================================================================= */}
      <section id="calculadora" className="py-20 bg-[#F2EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#244C36]/15 shadow-xl shadow-[#244C36]/10">
            <div className="max-w-3xl mb-10">
              <span className="text-[#6A994E] font-bold text-xs uppercase tracking-wider bg-[#6A994E]/10 px-3 py-1 rounded-full">
                Simulador Económico para Productores
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#244C36] tracking-tight mt-3">
                Calcula el Ahorro de Agua y Dinero en Tu Finca
              </h2>
              <p className="text-base text-[#526052] mt-2">
                Mueve los parámetros a continuación para estimar el volumen de agua que dejarás de desperdiciar y cuánto dinero ahorrarás al año.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Controles de Entrada (Izquierda) */}
              <div className="lg:col-span-6 space-y-6">
                {/* Selector de Hectáreas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-[#244C36]">Hectáreas Cultivadas:</label>
                    <span className="font-mono text-xl font-extrabold text-[#6A994E] bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      {hectares} ha
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={hectares}
                    onChange={(e) => setHectares(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#244C36]"
                  />
                  <div className="flex justify-between text-xs text-[#526052] font-mono mt-1">
                    <span>5 ha</span>
                    <span>75 ha</span>
                    <span>150+ ha</span>
                  </div>
                </div>

                {/* Tipo de Cultivo */}
                <div>
                  <label className="text-sm font-bold text-[#244C36] block mb-2">Tipo de Cultivo Principal:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'hortalizas', label: 'Hortalizas' },
                      { id: 'frutales', label: 'Frutales / Cítricos' },
                      { id: 'maiz', label: 'Granos / Maíz' },
                      { id: 'flores', label: 'Flores / Invernadero' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCropType(item.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          cropType === item.id
                            ? 'bg-[#244C36] text-white border-[#244C36] shadow-sm'
                            : 'bg-slate-50 text-[#526052] border-slate-200 hover:border-[#6A994E]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuente de Agua */}
                <div>
                  <label className="text-sm font-bold text-[#244C36] block mb-2">Fuente de Agua Principal:</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'pozo', label: 'Pozo Profundo', desc: 'Mayor costo eléctrico' },
                      { id: 'canal', label: 'Canal / Turno', desc: 'Turnos regulados' },
                      { id: 'reservorio', label: 'Reservorio / Tanque', desc: 'Almacenamiento' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setWaterSource(item.id)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          waterSource === item.id
                            ? 'bg-emerald-50 border-emerald-500 text-[#244C36]'
                            : 'bg-white border-slate-200 text-[#526052] hover:border-[#6A994E]'
                        }`}
                      >
                        <span className="block text-xs font-bold">{item.label}</span>
                        <span className="text-[10px] text-slate-500">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel de Resultados (Derecha) */}
              <div className="lg:col-span-6 bg-gradient-to-br from-[#244C36] to-[#163022] rounded-3xl p-6 sm:p-8 text-white shadow-lg">
                <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-6">
                  <span className="text-xs font-bold text-[#A7C957] uppercase tracking-wider">
                    Impacto Estimado Anual
                  </span>
                  <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-200 font-mono">
                    {hectares} Hectáreas
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Métrica 1: Agua Ahorrada */}
                  <div>
                    <span className="text-xs text-slate-300 font-medium">Volumen de Agua Ahorrada Anual:</span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#A7C957] font-mono mt-1">
                      {waterSavedM3.toLocaleString()} <span className="text-lg font-normal text-slate-200">m³ / año</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Equivalente a más de {Math.round(waterSavedM3 / 2500)} piscinas olímpicas de agua dulce preservada.
                    </p>
                  </div>

                  {/* Métrica 2: Ahorro en Dinero */}
                  <div className="pt-4 border-t border-white/15">
                    <span className="text-xs text-slate-300 font-medium">Ahorro Económico en Energía / Bombeo:</span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1">
                      ${annualSavingsUSD.toLocaleString()} <span className="text-lg font-normal text-slate-200">USD / año</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Menos horas de motor encendido y menor consumo eléctrico en la red.
                    </p>
                  </div>

                  {/* Métrica 3: Retorno de Inversión */}
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-200 block">Amortización estimada del sistema:</span>
                      <span className="text-sm font-bold text-[#A7C957]">Retorno de inversión (ROI)</span>
                    </div>
                    <span className="text-2xl font-extrabold text-white font-mono">
                      ~ {roiMonths} meses
                    </span>
                  </div>
                </div>

                <button
                  onClick={onGoToDashboard}
                  className="w-full mt-6 py-3.5 rounded-xl bg-[#6A994E] hover:bg-[#588140] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Probar AgroSmart IoT con Mis Datos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CASOS DE ÉXITO Y TESTIMONIOS
          ========================================================================= */}
      <section id="testimonios" className="py-20 bg-white border-y border-[#244C36]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#6A994E] font-bold text-xs uppercase tracking-wider bg-[#6A994E]/10 px-3 py-1 rounded-full">
              Voces del Agro
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#244C36] tracking-tight mt-3">
              Lo que Dicen Quienes Ya Protegen sus Cultivos
            </h2>
            <p className="text-base text-[#526052] mt-3">
              Historias reales de productores que tecnificaron su riego con AgroSmart IoT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F2EFE6]/60 rounded-2xl p-6 border border-[#244C36]/10 flex flex-col justify-between">
              <p className="text-sm text-[#526052] italic leading-relaxed mb-6">
                "Antes perdíamos dos o tres bombas por año porque el pozo bajaba de nivel y se quedaba girando en seco en la noche. Desde que pusimos AgroSmart IoT, el corte es automático y la tranquilidad no tiene precio."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#244C36]/10">
                <div className="w-10 h-10 rounded-full bg-[#244C36] text-white flex items-center justify-center font-bold text-sm">
                  RM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#244C36]">Roberto Morales</h4>
                  <p className="text-xs text-[#526052]">Productor de Cítricos • 45 Hectáreas</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F2EFE6]/60 rounded-2xl p-6 border border-[#244C36]/10 flex flex-col justify-between">
              <p className="text-sm text-[#526052] italic leading-relaxed mb-6">
                "En el tomate de invernadero el exceso de agua genera hongos de inmediato. Con los sensores al 70% de parada, la planta siempre está con humedad justa y el calibre del fruto fue el mejor de las últimas 4 temporadas."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#244C36]/10">
                <div className="w-10 h-10 rounded-full bg-[#6A994E] text-white flex items-center justify-center font-bold text-sm">
                  CG
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#244C36]">Carmen Gutiérrez</h4>
                  <p className="text-xs text-[#526052]">Hortalizas Bajo Cubierta • 12 Naves</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F2EFE6]/60 rounded-2xl p-6 border border-[#244C36]/10 flex flex-col justify-between">
              <p className="text-sm text-[#526052] italic leading-relaxed mb-6">
                "Poder monitorear y cambiar la programación desde el celular sin tener que viajar 20 km hasta la finca me cambió la vida. La factura de electricidad bajó casi un 40% al regar solo en horas nocturnas."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#244C36]/10">
                <div className="w-10 h-10 rounded-full bg-[#B87543] text-white flex items-center justify-center font-bold text-sm">
                  FA
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#244C36]">Fernando Arteaga</h4>
                  <p className="text-xs text-[#526052]">Aguacate Hass y Frutales • 60 Hectáreas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CTA FINAL Y FOOTER
          ========================================================================= */}
      <section className="py-20 bg-gradient-to-br from-[#244C36] via-[#1B3828] to-[#12241A] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#A7C957] font-semibold text-xs mb-6">
            <Sprout className="w-4 h-4" />
            <span>Únete a la Agricultura del Futuro</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
            ¿Listo para Proteger tu Cosecha y Dejar de Regar a Ciegas?
          </h2>

          <p className="text-base sm:text-lg text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ingresa ahora mismo a la plataforma de monitoreo y control en vivo de AgroSmart IoT y experimenta cómo la tecnología trabaja para el agricultor.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#6A994E] hover:bg-[#588140] text-white font-extrabold text-base shadow-xl shadow-black/25 transition-all hover:scale-105 cursor-pointer"
            >
              <Gauge className="w-5 h-5 text-[#A7C957]" />
              <span>Entrar al Dashboard de Control</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#12241A] text-slate-400 py-12 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#244C36] text-white flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#A7C957]" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">AgroSmart IoT</span>
              <p className="text-[11px] text-slate-400">Grupo Sostenibilidad • UPEC AgTech</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-300 font-medium">
            <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
            <a href="#aplicaciones" className="hover:text-white transition-colors">Aplicaciones</a>
            <a href="#ayuda-agricultor" className="hover:text-white transition-colors">Ayuda al Agricultor</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Calculadora</a>
          </div>

          <div className="text-slate-400">
            © 2026 AgroSmart IoT. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
