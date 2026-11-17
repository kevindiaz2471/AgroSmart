import React, { useState } from 'react';
import {
  Sprout,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  Lock,
  User,
  Shield,
  AlertCircle,
  ArrowRight,
  Leaf
} from 'lucide-react';

export default function AuthModal({ onLogin, onRegister }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('admin@agrosmart.io');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('Ing. Kevin Díaz');
  const [role, setRole] = useState('Administrador Agrícola');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isLoginTab) {
        await onLogin(email, password);
      } else {
        await onRegister(name, email, password, role);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCreds = () => {
    setIsLoginTab(true);
    setEmail('admin@agrosmart.io');
    setPassword('admin123');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, #244C36 0%, #1B3B2A 50%, #2E5A40 100%)'
      }}
    >
      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE2D5] z-10">
        {/* Top Accent Bar */}
        <div
          className="absolute top-0 left-8 right-8 h-1.5 rounded-b-full"
          style={{ background: 'linear-gradient(90deg, #244C36, #6A994E, #A7C957)' }}
        />

        {/* Header & Logo */}
        <div className="text-center mb-6 pt-2">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3"
            style={{ backgroundColor: '#244C36', border: '2px solid #A7C957' }}
          >
            <Sprout className="w-8 h-8 text-white keep-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#244C36' }}>
            AgroSmart <span style={{ color: '#6A994E' }}>IoT</span>
          </h2>
          <p className="text-xs font-medium mt-1 flex items-center justify-center gap-1" style={{ color: '#526052' }}>
            <Leaf className="w-3.5 h-3.5" style={{ color: '#6A994E' }} />
            Plataforma Comercial de Riego y Agricultura Inteligente
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex p-1 rounded-2xl mb-5 border"
          style={{ backgroundColor: '#F2EFE6', borderColor: '#DCE2D5' }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
            }}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            style={
              isLoginTab
                ? { backgroundColor: '#6A994E', color: '#FFFFFF' }
                : { color: '#526052' }
            }
          >
            <LogIn className="w-3.5 h-3.5" /> Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
            }}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            style={
              !isLoginTab
                ? { backgroundColor: '#6A994E', color: '#FFFFFF' }
                : { color: '#526052' }
            }
          >
            <UserPlus className="w-3.5 h-3.5" /> Crear Cuenta
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            className="mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 font-medium"
            style={{
              backgroundColor: 'rgba(217, 83, 79, 0.1)',
              borderColor: 'rgba(217, 83, 79, 0.35)',
              color: '#D9534F'
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLoginTab && (
            <div className="space-y-1">
              <label className="block text-xs font-bold" style={{ color: '#244C36' }}>
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#6A994E' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ing. Kevin Díaz"
                  className="w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border focus:outline-none"
                  style={{
                    backgroundColor: '#FAF8F3',
                    borderColor: '#DCE2D5',
                    color: '#1C3A29'
                  }}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold" style={{ color: '#244C36' }}>
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#6A994E' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@agrosmart.io"
                className="w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border focus:outline-none"
                style={{
                  backgroundColor: '#FAF8F3',
                  borderColor: '#DCE2D5',
                  color: '#1C3A29'
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold" style={{ color: '#244C36' }}>
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#6A994E' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border focus:outline-none"
                style={{
                  backgroundColor: '#FAF8F3',
                  borderColor: '#DCE2D5',
                  color: '#1C3A29'
                }}
                required
              />
            </div>
          </div>

          {!isLoginTab && (
            <div className="space-y-1">
              <label className="block text-xs font-bold" style={{ color: '#244C36' }}>
                Rol en la Finca
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#6A994E' }} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border focus:outline-none"
                  style={{
                    backgroundColor: '#FAF8F3',
                    borderColor: '#DCE2D5',
                    color: '#1C3A29'
                  }}
                >
                  <option value="Administrador Agrícola">Administrador Agrícola / Agrónomo</option>
                  <option value="Operador de Riego">Operador de Campo y Riego</option>
                  <option value="Investigador / Técnico">Investigador / Técnico Agrícola</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all keep-white"
            style={{ backgroundColor: '#6A994E', color: '#FFFFFF' }}
          >
            {isLoginTab ? (
              <>
                <LogIn className="w-4 h-4 keep-white" />
                <span className="keep-white">{loading ? 'Accediendo...' : 'Ingresar a la Plataforma'}</span>
                <ArrowRight className="w-4 h-4 keep-white" />
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 keep-white" />
                <span className="keep-white">{loading ? 'Registrando...' : 'Registrar y Acceder'}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div
          className="mt-5 p-3 rounded-2xl border text-xs flex items-center justify-between"
          style={{ backgroundColor: '#F2EFE6', borderColor: '#DCE2D5' }}
        >
          <div>
            <div className="font-bold flex items-center gap-1.5 text-[11px]" style={{ color: '#244C36' }}>
              <KeyRound className="w-3.5 h-3.5" style={{ color: '#B87543' }} /> Acceso Rápido Demo:
            </div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: '#526052' }}>
              admin@agrosmart.io / admin123
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemoCreds}
            className="text-xs font-bold underline cursor-pointer px-2.5 py-1 rounded-lg"
            style={{ color: '#244C36' }}
          >
            Cargar Demo
          </button>
        </div>
      </div>
    </div>
  );
}
