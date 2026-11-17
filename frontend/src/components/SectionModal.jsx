import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SectionModal({
  isOpen = false,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconColor = '#6A994E',
  iconBg = 'rgba(106, 153, 78, 0.16)',
  iconBorder = 'rgba(106, 153, 78, 0.4)',
  badge = null,
  maxWidth = 'max-w-7xl',
  children
}) {
  // Lock background dashboard scroll and allow closing with Escape key
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-[95vw] sm:w-[90vw] h-[90vh] ${maxWidth} rounded-2xl sm:rounded-3xl shadow-2xl border flex flex-col overflow-hidden relative transition-all`}
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-panel)'
        }}
      >
        {/* Fixed Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-4 border-b shrink-0 gap-3"
          style={{
            backgroundColor: 'var(--bg-subpanel)',
            borderColor: 'var(--border-panel)'
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: iconBg,
                  border: `1px solid ${iconBorder}`,
                  color: iconColor
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                  {title}
                </h2>
                {badge}
              </div>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0"
            style={{
              backgroundColor: 'var(--bg-panel)',
              borderColor: 'var(--border-panel)'
            }}
            aria-label={`Cerrar ${title}`}
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Independent Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-6"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
