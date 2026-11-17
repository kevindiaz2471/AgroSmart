import React, { useState } from 'react';
import { MapPin, X, Plus, Save } from 'lucide-react';

export default function PlaceModal({ isOpen, onClose, onSave, editingPlace = null }) {
  const [name, setName] = useState(editingPlace?.name || '');
  const [location, setLocation] = useState(editingPlace?.location || '');
  const [coords, setCoords] = useState(editingPlace?.coords || '0.8123, -77.7145');
  const [description, setDescription] = useState(editingPlace?.description || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(editingPlace?.id ? { id: editingPlace.id } : {}),
      name,
      location,
      coords,
      description
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-emerald-400" />
          {editingPlace ? 'Editar Finca o Lugar' : 'Registrar Nueva Finca o Lugar'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Nombre del Lugar / Finca</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Finca Las Acacias - Lote 3"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Ubicación / Sector</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Cantón Tulcán, Vía Julio Andrade"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Coordenadas GPS</label>
            <input
              type="text"
              value={coords}
              onChange={(e) => setCoords(e.target.value)}
              placeholder="Latitud, Longitud"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Descripción de Cultivos</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle de parcelas, invernaderos y tipos de suelo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer keep-white"
            >
              {editingPlace ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingPlace ? 'Actualizar Lugar' : 'Guardar Lugar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
