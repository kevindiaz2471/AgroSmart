import React, { useState } from 'react';
import {
  Sprout,
  MapPin,
  Plus,
  BookOpen,
  LogOut,
  Menu,
  X,
  Activity,
  CalendarClock,
  BarChart3,
  Bell,
  Sliders,
  FlaskConical,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'control', label: 'Monitoreo y Control', icon: Activity, isDashboard: true },
  { id: 'schedules', label: 'Programación', icon: CalendarClock },
  { id: 'history', label: 'Historial y Estadísticas', icon: BarChart3 },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'config', label: 'Configuración', icon: Sliders },
  { id: 'simulation', label: 'Simulación y Diagnóstico', icon: FlaskConical }
];

export default function Navbar({
  user,
  onLogout,
  places = [],
  currentPlaceId,
  onSelectPlace,
  onNewPlace,
  onOpenManual,
  isBackendOnline,
  activeSection: _activeSection = 'control',
  onSelectSection,
  activeModal = null,
  onOpenModal,
  onCloseModal,
  isHistoryModalOpen = false,
  onOpenHistoryModal,
  unresolvedAlertsCount = 0,
  isAutoSimulating = false,
  theme = 'light',
  onToggleTheme,
  isLandingView = false,
  onToggleLanding
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 agro-navbar shadow-md transition-all">
      {/* Top Row: Brand, Farm Selector, System Status, Theme & User */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Agricultural Brand Identity */}
        <div
          onClick={() => {
            if (onCloseModal) onCloseModal();
            if (onSelectSection) onSelectSection('control');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: '#6A994E', border: '1px solid #A7C957' }}
          >
            <Sprout className="w-6 h-6 text-white keep-white" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-1.5 leading-none keep-white">
              <span>AgroSmart</span>
              <span
                className="px-2 py-0.5 rounded-lg text-xs font-bold tracking-wide"
                style={{ backgroundColor: '#A7C957', color: '#1B3A28' }}
              >
                AgTech IoT
              </span>
            </div>
            <p className="text-[11px] hidden sm:block mt-1" style={{ color: '#DCE7DC' }}>
              Gestión Inteligente de Riego y Cultivos Agrícolas
            </p>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* System Status Badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border"
            style={{
              backgroundColor: isBackendOnline ? 'rgba(167, 201, 87, 0.16)' : 'rgba(233, 162, 59, 0.18)',
              borderColor: isBackendOnline ? 'rgba(167, 201, 87, 0.45)' : 'rgba(233, 162, 59, 0.5)',
              color: isBackendOnline ? '#D9F2A0' : '#FFE0A3'
            }}
            title={
              isBackendOnline
                ? 'Conectado al servidor Spring Boot REST API'
                : 'Operando en modo local con almacenamiento persistente'
            }
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: isBackendOnline ? '#A7C957' : '#E9A23B' }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: isBackendOnline ? '#A7C957' : '#E9A23B' }}
              ></span>
            </span>
            <span>{isBackendOnline ? 'Sistema Conectado' : 'Modo Local Activo'}</span>
          </div>

          {/* Farm / Place Selector */}
          <div
            className="flex items-center rounded-xl p-1 text-xs border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <MapPin className="w-4 h-4 ml-2 mr-1.5 shrink-0" style={{ color: '#A7C957' }} />
            <select
              value={currentPlaceId}
              onChange={(e) => onSelectPlace(e.target.value)}
              aria-label="Seleccionar Finca o Parcela"
              className="bg-transparent outline-none pr-2 cursor-pointer py-1 font-semibold max-w-[195px] truncate"
              style={{ color: '#FFFFFF' }}
            >
              {places.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  style={{ backgroundColor: '#244C36', color: '#FFFFFF' }}
                >
                  {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onNewPlace}
              title="Registrar Nueva Finca o Parcela"
              className="p-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ backgroundColor: '#6A994E', color: '#FFFFFF' }}
            >
              <Plus className="w-3.5 h-3.5 keep-white" />
            </button>
          </div>

          {/* Light / Dark Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Cambiar a Modo Oscuro Agrícola' : 'Cambiar a Modo Claro Natural'}
              className="px-2.5 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF'
              }}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" style={{ color: '#A7C957' }} />
                  <span className="hidden xl:inline" style={{ color: '#FFFFFF' }}>Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" style={{ color: '#E9A23B' }} />
                  <span className="hidden xl:inline" style={{ color: '#FFFFFF' }}>Claro</span>
                </>
              )}
            </button>
          )}

          {/* User Manual Button */}
          <button
            type="button"
            onClick={onOpenManual}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF'
            }}
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: '#A7C957' }} />
            <span style={{ color: '#FFFFFF' }}>Guía</span>
          </button>

          {/* Toggle Landing / Dashboard Button */}
          {onToggleLanding && (
            <button
              type="button"
              onClick={onToggleLanding}
              title={isLandingView ? 'Regresar al Dashboard Operativo' : 'Ver Portal Promocional e Informativo'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all shadow-xs"
              style={{
                backgroundColor: isLandingView ? '#A7C957' : '#6A994E',
                borderColor: isLandingView ? '#A7C957' : '#6A994E',
                color: isLandingView ? '#1B3A28' : '#FFFFFF'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: isLandingView ? '#1B3A28' : '#FFFFFF' }} />
              <span>{isLandingView ? 'Ver Dashboard' : 'Portal AgTech'}</span>
            </button>
          )}

          {/* User Profile */}
          <div
            className="flex items-center gap-2 pl-2.5 border-l"
            style={{ borderColor: 'rgba(255, 255, 255, 0.18)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0 keep-white"
              style={{ backgroundColor: '#B87543' }}
            >
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : 'AG'}
            </div>
            <div className="text-left text-xs leading-tight hidden lg:block">
              <div className="font-bold truncate max-w-[125px]" style={{ color: '#FFFFFF' }}>
                {user?.name}
              </div>
              <div className="text-[10px] truncate max-w-[125px]" style={{ color: '#D0DFD0' }}>
                {user?.role}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
              style={{ color: '#FFD2D0' }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderColor: 'rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF'
              }}
              aria-label="Cambiar tema claro u oscuro"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" style={{ color: '#A7C957' }} />
              ) : (
                <Sun className="w-4 h-4" style={{ color: '#E9A23B' }} />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderColor: 'rgba(255, 255, 255, 0.22)',
              color: '#FFFFFF'
            }}
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Modular Navigation Tabs Bar */}
      {(onSelectSection || onOpenModal) && (
        <nav className="agro-subnav" aria-label="Secciones principales del sistema">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const effectiveModal = activeModal || (isHistoryModalOpen ? 'history' : null);
              const isActive = item.isDashboard || item.id === 'control'
                ? !effectiveModal
                : effectiveModal === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.isDashboard || item.id === 'control') {
                      if (onCloseModal) onCloseModal();
                      if (onSelectSection) onSelectSection('control');
                    } else {
                      if (onOpenModal) {
                        onOpenModal(item.id);
                      } else if (item.id === 'history' && onOpenHistoryModal) {
                        onOpenHistoryModal();
                      } else if (onSelectSection) {
                        onSelectSection(item.id);
                      }
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all"
                  style={
                    isActive
                      ? {
                          backgroundColor: '#6A994E',
                          color: '#FFFFFF',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: '#DCE7DC'
                        }
                  }
                >
                  <Icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: isActive ? '#FFFFFF' : '#A7C957' }}
                  />
                  <span style={{ color: isActive ? '#FFFFFF' : '#E8F0E8' }}>{item.label}</span>
                  {item.id === 'alerts' && unresolvedAlertsCount > 0 && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
                      style={{ backgroundColor: '#D9534F', color: '#FFFFFF' }}
                    >
                      {unresolvedAlertsCount}
                    </span>
                  )}
                  {item.id === 'simulation' && isAutoSimulating && (
                    <span
                      className="w-2 h-2 rounded-full animate-ping"
                      style={{ backgroundColor: '#E9A23B' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Mobile Collapsible Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 pb-4 pt-3 border-t space-y-3"
          style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: '#1B3B2A' }}
        >
          {/* Mobile Navigation Links */}
          <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const effectiveModal = activeModal || (isHistoryModalOpen ? 'history' : null);
              const isActive = item.isDashboard || item.id === 'control'
                ? !effectiveModal
                : effectiveModal === item.id;
              return (
                <button
                  key={`mobile-${item.id}`}
                  type="button"
                  onClick={() => {
                    if (item.isDashboard || item.id === 'control') {
                      if (onCloseModal) onCloseModal();
                      if (onSelectSection) onSelectSection('control');
                    } else {
                      if (onOpenModal) {
                        onOpenModal(item.id);
                      } else if (item.id === 'history' && onOpenHistoryModal) {
                        onOpenHistoryModal();
                      } else if (onSelectSection) {
                        onSelectSection(item.id);
                      }
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-colors text-left"
                  style={
                    isActive
                      ? {
                          backgroundColor: '#6A994E',
                          borderColor: '#A7C957',
                          color: '#FFFFFF'
                        }
                      : {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          color: '#DCE7DC'
                        }
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? '#FFFFFF' : '#A7C957' }} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div>
            <label
              className="block text-[11px] font-semibold mb-1 flex items-center gap-1"
              style={{ color: '#DCE7DC' }}
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: '#A7C957' }} /> Finca / Parcela Activa:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={currentPlaceId}
                onChange={(e) => {
                  onSelectPlace(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-xl px-3 py-2 text-xs font-semibold outline-none border"
                style={{
                  backgroundColor: '#244C36',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF'
                }}
              >
                {places.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    style={{ backgroundColor: '#244C36', color: '#FFFFFF' }}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  onNewPlace();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl shrink-0"
                style={{ backgroundColor: '#6A994E', color: '#FFFFFF' }}
                title="Nueva Finca"
              >
                <Plus className="w-4 h-4 keep-white" />
              </button>
            </div>
          </div>

          {onToggleLanding && (
            <button
              type="button"
              onClick={() => {
                onToggleLanding();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold"
              style={{
                backgroundColor: isLandingView ? '#A7C957' : '#6A994E',
                borderColor: isLandingView ? '#A7C957' : '#6A994E',
                color: isLandingView ? '#1B3A28' : '#FFFFFF'
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLandingView ? 'Regresar al Dashboard' : 'Ver Portal Promocional AgTech'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenManual();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF'
            }}
          >
            <BookOpen className="w-4 h-4" style={{ color: '#A7C957' }} />
            <span style={{ color: '#FFFFFF' }}>Manual y Guía del Agricultor</span>
          </button>

          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 keep-white"
                style={{ backgroundColor: '#B87543' }}
              >
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'AG'}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold" style={{ color: '#FFFFFF' }}>{user?.name}</div>
                <div className="text-[10px]" style={{ color: '#D0DFD0' }}>{user?.role}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{ backgroundColor: '#D9534F', color: '#FFFFFF' }}
            >
              <LogOut className="w-3.5 h-3.5 keep-white" />
              <span className="keep-white">Salir</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
